import { useState, useCallback } from "react";

export const useLobbyMessageHandler = (code, navigate) => {
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [hostUsername, setHostUsername] = useState(null);

  const handleWebSocketMessage = useCallback(
    (data) => {
      switch (data.type) {
        case "user_list":
          setConnectedUsers(data.users);
          setHostUsername(data.host);
          break;
        case "game_started":
          navigate(`/game_rooms/${code}/`);
          break;
        default:
          console.warn("[Lobby] Unhandled WebSocket message:", data);
      }
    },
    [code, navigate]
  );

  return { handleWebSocketMessage, connectedUsers, hostUsername };
};
