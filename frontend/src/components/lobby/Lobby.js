import React, { useEffect, useRef, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../auth/AuthContext";
import axios from "../../services/axiosConfig";
import { toast } from "react-toastify";

const Lobby = () => {
  const { t } = useTranslation();
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const socketRef = useRef(null);
  const [gameInfo, setGameInfo] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [hostUsername, setHostUsername] = useState(null);

  useEffect(() => {
    if (code) {
      axios
        .get(`/game_rooms/${code}/`)
        .then((response) => setGameInfo(response.data))
        .catch((err) => {
          console.error("Error loading lobby data:", err);
          toast.error("Failed to load lobby.");
        });
    }
  }, [code]);

  useEffect(() => {
    if (!code) {
      toast.error("Invalid lobby code");
      return;
    }

    const timeoutId = setTimeout(() => {
      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const backendHost = process.env.REACT_APP_BACKEND_HOST;
      const backendPort = process.env.REACT_APP_BACKEND_PORT;

      console.log("backendHost", backendHost);
      console.log("backendPort", backendPort);

      const wsUrl = `${wsProtocol}://${backendHost}:${backendPort}/ws/lobby/${code}/`;

      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case "user_list":
              setConnectedUsers(data.users);
              setHostUsername(data.host);
              break;
            case "game_started":
              navigate(`/game_rooms/${code}/`);
              break;
            default:
              console.warn("Unhandled message:", data);
          }
        } catch (err) {
          console.error("Error parsing ws message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        toast.error("WebSocket encountered an error.");
      };

      socketRef.current = ws;
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [code, navigate, t]);

  const isHost = hostUsername === user?.username;

  const handleStartGame = () => {
    if (!isHost) return;

    const chosenQuizId = gameInfo?.quiz?.id;
    if (!chosenQuizId) {
      console.warn("No quiz ID found in gameInfo, cannot start.");
      return;
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "start_game",
          quiz_id: chosenQuizId,
        })
      );
    }
  };

  if (!gameInfo) {
    return (
      <p className="text-center text-gray-500 mt-4">{t("Loading lobby...")}</p>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded mt-10">
      <h2 className="text-2xl font-bold mb-4">
        {t("Lobby Code")}:{" "}
        <span className="text-blue-600">{gameInfo.code}</span>
      </h2>
      <h3 className="text-xl font-semibold mb-2">{t("Connected Users")}:</h3>
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
          {t("Start Game")}
        </button>
      )}
    </div>
  );
};

export default Lobby;
