import React, { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../../components/auth/AuthContext";
import { useLobbyData } from "../../../hooks/useLobbyData";
import useWebSocket from "../../../hooks/useWebSocket";
import LobbyPresentation from "./components/LobbyPresentation";
import NameInputComponent from "./components/NameInputComponent";
import { useGuestName } from "../../../hooks/useGuestName";
import { useLobbyMessageHandler } from "../../../hooks/useLobbyMessageHandler";
import { useLobbyWebSocket } from "../../../hooks/useLobbyWebSocket";

const Lobby = () => {
  const { t } = useTranslation();
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const { currentUsername, handleNameSubmit } = useGuestName(user);
  const { gameInfo } = useLobbyData(code, navigate);
  const wsUrl = useLobbyWebSocket(gameInfo, code, currentUsername);

  const { handleWebSocketMessage, connectedUsers, hostUsername } =
    useLobbyMessageHandler(code, navigate);

  const { sendMessage } = useWebSocket(wsUrl, handleWebSocketMessage);

  const isHost = hostUsername === currentUsername;

  const handleStartGame = () => {
    if (!isHost || !gameInfo?.quiz?.id) return;
    sendMessage({
      type: "start_game",
      quiz_id: gameInfo.quiz.id,
    });
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
