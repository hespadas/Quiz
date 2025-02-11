// useLobbyData.js
import { useState, useEffect } from "react";
import axios from "../services/axiosConfig";
import { toast } from "react-toastify";

export function useLobbyData(code, navigate) {
  const [gameInfo, setGameInfo] = useState(null);

  useEffect(() => {
    if (!code) return;
    axios
      .get(`/game_rooms/${code}/`)
      .then((response) => setGameInfo(response.data))
      .catch((err) => {
        console.error("[Lobby] Erro ao carregar dados:", err);
        toast.error("Falha ao carregar o lobby.");
        setGameInfo(null);
        navigate("/");
      });
  }, [code, navigate]);

  return { gameInfo };
}
