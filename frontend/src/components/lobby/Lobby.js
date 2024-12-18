import React, { useEffect, useRef, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../auth/AuthContext";

const Lobby = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const socketRef = useRef(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const backendHost = "localhost";
    const backendPort = "8000";
    const wsUrl = `${wsProtocol}://${backendHost}:${backendPort}/ws/lobby/`;

    console.log("Connecting to WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected to static lobby");
    };

    ws.onmessage = (event) => {
      console.log("Message from WebSocket:", event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === "user_list") {
          setConnectedUsers(data.users);
        } else if (data.type === "host_status") {
          setIsHost(data.isHost);
          if (data.isHost) {
            console.log("You are the host.");
          } else {
            console.log("You are not the host.");
          }
        } else if (data.type === "game_started") {
          console.log("Game has started!");
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected from static lobby:", event);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error in static lobby:", error);
    };

    socketRef.current = ws;

    return () => {
      console.log("Closing WebSocket connection to static lobby");
      ws.close();
    };
  }, [user.username]);

  const startGame = () => {
    if (socketRef.current && isHost) {
      socketRef.current.send(JSON.stringify({ type: "start_game" }));
      console.log("Game start message sent.");
    }
  };

  return (
    <div>
      <h2>{t("Connected to Static Lobby")}</h2>
      <h3>{t("Current Users")}:</h3>
      <ul>
        {connectedUsers.map((username) => (
          <li key={username}>{username}</li>
        ))}
      </ul>

      {isHost && (
        <button
          onClick={startGame}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {t("Start Game")}
        </button>
      )}
    </div>
  );
};

export default Lobby;
