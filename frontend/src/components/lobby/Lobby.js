import React, { useEffect, useRef, useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../auth/AuthContext"; // Adjust import path as needed

const Lobby = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext); // Assuming AuthContext provides user info
  const socketRef = useRef(null);

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
      // Handle incoming messages as needed
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

  return <div>{t("Connected to Static Lobby")}</div>;
};

export default Lobby;
