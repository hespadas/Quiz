import React, { useEffect, useRef, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../auth/AuthContext";
import { toast } from "react-toastify";

const Lobby = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { code } = useParams();
  const socketRef = useRef(null);

  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!code) {
      toast.error(t("Invalid lobby code."));
      return;
    }

    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const backendHost = "localhost";
    const backendPort = "8000";
    const wsUrl = `${wsProtocol}://${backendHost}:${backendPort}/ws/lobby/${code}/`;

    console.log("Connecting to WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected to lobby with code:", code);
    };

    ws.onmessage = (event) => {
      console.log("Lobby message:", event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === "user_list") {
          setConnectedUsers(data.users);
        } else if (data.type === "host_status") {
          setIsHost(data.isHost);
        } else if (data.type === "game_started") {
          console.log("Game started!");
          // Possibly navigate to a game screen
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected:", event);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error(t("WebSocket encountered an error."));
    };

    socketRef.current = ws;

    return () => {
      console.log("Closing WebSocket for lobby code:", code);
      ws.close();
    };
  }, [code, t]);

  const handleStartGame = () => {
    if (socketRef.current && isHost) {
      socketRef.current.send(JSON.stringify({ type: "start_game" }));
      console.log("Game start message sent.");
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
          <li key={username}>{username}</li>
        ))}
      </ul>
      {isHost && <button onClick={handleStartGame}>{t("Start Game")}</button>}
    </div>
  );
};

export default Lobby;
