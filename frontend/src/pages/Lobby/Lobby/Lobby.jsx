import React, { useContext, useMemo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../../../components/auth/AuthContext";
import { useLobbyData } from "../../../hooks/useLobbyData";
import useWebSocket from "../../../hooks/useWebSocket";
import LobbyPresentation from "./components/LobbyPresentation";
import NameInputComponent from "./components/NameInputComponent";

const Lobby = () => {
  const { t } = useTranslation();
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [connectedUsers, setConnectedUsers] = useState([]);
  const [hostUsername, setHostUsername] = useState(null);
  const [guestName, setGuestName] = useState(
    user?.isGuest ? user.username : null
  );

  const { gameInfo } = useLobbyData(code, navigate);

  // Determina o nome a ser usado para identificar o usuário
  const currentUsername = user?.username || guestName;

  // Monta a URL WebSocket incluindo o username na query string
  const wsUrl = useMemo(() => {
    if (!gameInfo || !code || !currentUsername) return null;

    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const backendHost = process.env.REACT_APP_BACKEND_HOST || "localhost";
    const backendPort = process.env.REACT_APP_BACKEND_PORT || "8000";

    return `${wsProtocol}://${backendHost}:${backendPort}/ws/lobby/${code}/?username=${encodeURIComponent(
      currentUsername
    )}`;
  }, [gameInfo, code, currentUsername]);

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

  const isHost = hostUsername === currentUsername;

  const handleStartGame = () => {
    if (!isHost || !gameInfo?.quiz?.id) return;
    sendMessage({
      type: "start_game",
      quiz_id: gameInfo.quiz.id,
    });
  };

  const handleNameSubmit = (name) => {
    setGuestName(name);
    // O envio do "join" só é possível depois da conexão WebSocket ser aberta,
    // então pode ser necessário aguardar ou mover isso para dentro de `useWebSocket`.
  };

  // Se não tem user nem guestName ainda, pede nome
  if (!currentUsername) {
    return <NameInputComponent onSubmit={handleNameSubmit} />;
  }

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
