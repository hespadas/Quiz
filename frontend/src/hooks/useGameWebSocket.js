import { useMemo, useCallback } from "react";
import useWebSocket from "./useWebSocket";

function useGameWebSocket(gameRoom, code, onMessage, shouldReconnect) {
  const wsUrl = useMemo(() => {
    if (!gameRoom) return null;
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const backendHost = process.env.REACT_APP_BACKEND_HOST || "localhost";
    const backendPort = process.env.REACT_APP_BACKEND_PORT || "8000";
    return `${wsProtocol}://${backendHost}:${backendPort}/ws/game_rooms/${code}/`;
  }, [gameRoom, code]);

  const handleWebSocketMessage = useCallback(
    (data) => {
      if (onMessage) {
        onMessage(data);
      }
    },
    [onMessage]
  );

  const { sendMessage, socket } = useWebSocket(
    wsUrl,
    handleWebSocketMessage,
    shouldReconnect
  );

  return { sendMessage, socket };
}

export default useGameWebSocket;
