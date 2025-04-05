import { useEffect, useMemo, useCallback } from "react";
import useWebSocket from "./useWebSocket";

function useGameWebSocket(
  gameRoom,
  code,
  username,
  onMessage,
  shouldReconnect,
  gameOver = false
) {
  const wsUrl = useMemo(() => {
    if (!gameRoom || !username || gameOver) return null;
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const backendHost = process.env.REACT_APP_BACKEND_HOST || "localhost";
    const backendPort = process.env.REACT_APP_BACKEND_PORT || "8000";
    return `${wsProtocol}://${backendHost}:${backendPort}/ws/game_rooms/${code}/?username=${encodeURIComponent(
      username
    )}`;
  }, [gameRoom, code, username, gameOver]);

  const handleWebSocketMessage = useCallback(
    (data) => {
      if (typeof onMessage === "function") {
        onMessage(data);
      } else {
        console.warn(
          "[useGameWebSocket] onMessage is not a valid function",
          onMessage
        );
      }
    },
    [onMessage]
  );

  const { sendMessage, socket, closeSocket } = useWebSocket(
    wsUrl,
    handleWebSocketMessage,
    shouldReconnect
  );

  useEffect(() => {
    if (gameOver) {
      closeSocket();
    }
  }, [gameOver, closeSocket]);

  return { sendMessage, socket, closeSocket };
}

export default useGameWebSocket;
