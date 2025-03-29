// useGameWebSocket.js
import { useMemo, useCallback } from "react";
import useWebSocket from "./useWebSocket";

function useGameWebSocket(
  gameRoom,
  code,
  username,
  onMessage,
  shouldReconnect
) {
  const wsUrl = useMemo(() => {
    if (!gameRoom || !username) return null;
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const backendHost = process.env.REACT_APP_BACKEND_HOST || "localhost";
    const backendPort = process.env.REACT_APP_BACKEND_PORT || "8000";
    return `${wsProtocol}://${backendHost}:${backendPort}/ws/game_rooms/${code}/?username=${encodeURIComponent(
      username
    )}`;
  }, [gameRoom, code, username]);

  // Aqui está o ajuste definitivo com proteção clara:
  const handleWebSocketMessage = useCallback(
    (data) => {
      if (typeof onMessage === "function") {
        onMessage(data);
      } else {
        console.warn(
          "[useGameWebSocket] onMessage não é uma função válida!",
          onMessage
        );
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
