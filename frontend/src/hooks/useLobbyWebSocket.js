import { useMemo } from "react";

export const useLobbyWebSocket = (gameInfo, code, currentUsername) => {
  const wsUrl = useMemo(() => {
    if (!gameInfo || !code || !currentUsername) return null;

    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const backendHost = process.env.REACT_APP_BACKEND_HOST || "localhost";
    const backendPort = process.env.REACT_APP_BACKEND_PORT || "8000";

    return `${wsProtocol}://${backendHost}:${backendPort}/ws/lobby/${code}/?username=${encodeURIComponent(
      currentUsername
    )}`;
  }, [gameInfo, code, currentUsername]);

  return wsUrl;
};
