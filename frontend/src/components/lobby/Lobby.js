import React, { useEffect, useRef, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../auth/AuthContext";

const Lobby = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const socketRef = useRef(null);
  const [connectedUsers, setConnectedUsers] = useState([]);

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
      const data = JSON.parse(event.data);
      if (data.type === "user_list") {
        setConnectedUsers(data.users);
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
  }, []);

  return (
    <div>
      <h2>{t("Connected to Static Lobby")}</h2>
      <h3>{t("Current Users")}:</h3>
      <ul>
        {connectedUsers.map((username) => (
          <li key={username}>{username}</li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
