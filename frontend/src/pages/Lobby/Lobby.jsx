import React, {
  useEffect,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import axios from "../../services/axiosConfig";
import { toast } from "react-toastify";
import useWebSocket from "../../hooks/useWebSocket";
import { AuthContext } from "../../components/auth/AuthContext";

const Lobby = () => {
  const { t } = useTranslation();
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [gameInfo, setGameInfo] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [hostUsername, setHostUsername] = useState(null);

  useEffect(() => {
    if (!code) return;
    axios
      .get(`/game_rooms/${code}/`)
      .then((response) => setGameInfo(response.data))
      .catch((err) => {
        console.error("[Lobby] Erro ao carregar os dados:", err);
        toast.error("Falha ao carregar o lobby.");
        setGameInfo(null);
        navigate("/");
      });
  }, [code, navigate]);

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
          console.warn("[Lobby] Mensagem WebSocket não tratada:", data);
      }
    },
    [code, navigate]
  );

  const { sendMessage } = useWebSocket(wsUrl, handleWebSocketMessage);
  const isHost = hostUsername === user?.username;

  const handleStartGame = () => {
    if (!isHost) return;

    const chosenQuizId = gameInfo?.quiz?.id;
    if (!chosenQuizId) {
      console.warn("[Lobby] Nenhum quiz ID encontrado.");
      return;
    }

    sendMessage({
      type: "start_game",
      quiz_id: chosenQuizId,
    });
  };

  if (!gameInfo) {
    return (
      <p className="text-center text-gray-500 mt-4">
        {t("Carregando lobby...")}
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded mt-10">
      <h2 className="text-2xl font-bold mb-4">
        {t("Código do Lobby")}:{" "}
        <span className="text-blue-600">{gameInfo.code}</span>
      </h2>
      <h3 className="text-xl font-semibold mb-2">
        {t("Usuários Conectados")}:
      </h3>
      <ul className="list-disc pl-5 mb-6">
        {connectedUsers.map((username) => (
          <li key={username} className="text-gray-800">
            {username}{" "}
            {username === hostUsername && (
              <span className="font-bold text-green-600">(Host)</span>
            )}
          </li>
        ))}
      </ul>

      {isHost && (
        <button
          onClick={handleStartGame}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {t("Iniciar Jogo")}
        </button>
      )}
    </div>
  );
};

export default Lobby;
