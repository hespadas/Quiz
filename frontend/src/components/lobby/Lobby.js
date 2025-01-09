import React, { useEffect, useRef, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../auth/AuthContext";
import axios from "../../services/axiosConfig";
import { toast } from "react-toastify";

const Lobby = () => {
  const { t } = useTranslation();
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const socketRef = useRef(null);

  const [gameInfo, setGameInfo] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [hostUsername, setHostUsername] = useState(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get(`/game_rooms/${code}/`);
        // e.g. { code: 'ABC123', quiz: { id: 5, ... }, host: 'espadas', ... }
        setGameInfo(response.data);
      } catch (err) {
        console.error("Error loading lobby data:", err);
        toast.error("Failed to load lobby.");
      }
    };

    if (code) fetchGame();
  }, [code]);

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
              navigate(`/game_rooms/${data.quiz_id}/`);
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

    const chosenQuizId = gameInfo?.quiz?.id;
    if (!chosenQuizId) {
      console.warn("No quiz ID found in gameInfo, cannot start.");
      return;
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "start_game",
          quiz_id: chosenQuizId,
        })
      );
    }
  };

  if (!gameInfo) {
    return <p>{t("Loading lobby...")}</p>;
  }

  return (
    <div>
      <h2>
        {t("Lobby Code")}: {gameInfo.code}
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
