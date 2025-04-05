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

  const currentUsername = user?.username || guestName;

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
    const uniqueName = `${name}_${Math.floor(Math.random() * 10000)}`;
    localStorage.setItem("guestName", uniqueName);
    setGuestName(uniqueName);
  };

  if (!currentUsername) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
          <NameInputComponent onSubmit={handleNameSubmit} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 py-8 px-4 flex items-center justify-center">
      <LobbyPresentation
        gameInfo={gameInfo}
        connectedUsers={connectedUsers}
        hostUsername={hostUsername}
        isHost={isHost}
        onStartGame={handleStartGame}
        t={t}
      />
    </div>
  );
};

export default Lobby;
