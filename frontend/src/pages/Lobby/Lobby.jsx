// LobbyContainer.js
import React, { useContext, useMemo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../../components/auth/AuthContext";
import { useLobbyData } from "../../hooks/useLobbyData";
import useWebSocket from "../../hooks/useWebSocket";
import LobbyPresentation from "./components/LobbyPresentation";

const Lobby = () => {
  const { t } = useTranslation();
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [connectedUsers, setConnectedUsers] = useState([]);
  const [hostUsername, setHostUsername] = useState(null);

  const { gameInfo } = useLobbyData(code, navigate);

  const wsUrl = useMemo(() => {
    if (!gameInfo || !code) return null;
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const backendHost = process.env.REACT_APP_BACKEND_HOST || "localhost";
    const backendPort = process.env.REACT_APP_BACKEND_PORT || "8000";
    return `${wsProtocol}://${backendHost}:${backendPort}/ws/lobby/${code}/`;
  }, [gameInfo, code]);

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

  const { sendMessage } = useWebSocket(wsUrl, handleWebSocketMessage);
  const isHost = hostUsername === user?.username;

  const handleStartGame = () => {
    if (!isHost) return;
    if (!gameInfo?.quiz?.id) return;
    sendMessage({
      type: "start_game",
      quiz_id: gameInfo.quiz.id,
    });
  };

  return (
    <LobbyPresentation
      gameInfo={gameInfo}
      connectedUsers={connectedUsers}
      hostUsername={hostUsername}
      isHost={isHost}
      onStartGame={handleStartGame}
      t={t}
    />
  );
};

export default Lobby;
