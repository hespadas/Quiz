import React, { useEffect, useRef, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../auth/AuthContext";
import { toast } from "react-toastify";

const Lobby = () => {
  const { t } = useTranslation();
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const socketRef = useRef(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [hostUsername, setHostUsername] = useState(null);

  useEffect(() => {
    if (!code) {
      toast.error("Invalid lobby code");
      return;
    }

    const timeoutId = setTimeout(() => {
      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const backendHost = "localhost";
      const backendPort = "8000";
      const wsUrl = `${wsProtocol}://${backendHost}:${backendPort}/ws/lobby/${code}/`;

      console.log("Connecting to:", wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket open for code:", code);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case "user_list":
              setConnectedUsers(data.users);
              setHostUsername(data.host);
              break;
            case "game_started":
              console.log("Game started, quiz_id:", data.quiz_id);
              navigate(`/quiz/${data.quiz_id || 1}/question/1`);
              break;
            default:
              console.warn("Unhandled message:", data);
          }
        } catch (err) {
          console.error("Error parsing ws message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        toast.error("WebSocket encountered an error.");
      };

      ws.onclose = (e) => {
        console.log("WebSocket closed:", e);
      };

      socketRef.current = ws;
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [code, navigate]);

  const isHost = hostUsername === user?.username;

  const handleStartGame = () => {
    if (!isHost) return;

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "start_game",
          quiz_id: 123,
        })
      );
    }
  };

  return (
    <div>
      <h2>
        {t("Lobby Code")}: {code}
      </h2>
      <h3>{t("Connected Users")}:</h3>
      <ul>
        {connectedUsers.map((username) => (
          <li key={username}>
            {username}
            {username === hostUsername && " (Host)"}
          </li>
        ))}
      </ul>

      {isHost && <button onClick={handleStartGame}>{t("Start Game")}</button>}
    </div>
  );
};

export default Lobby;
