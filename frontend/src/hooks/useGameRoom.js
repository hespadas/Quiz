// src/hooks/useGameRoom.js

import { useState, useEffect } from "react";
import axios from "../services/axiosConfig";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function useGameRoom(code) {
  const { t } = useTranslation();
  const [gameRoom, setGameRoom] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameRoom = async () => {
      try {
        const response = await axios.get(`/game_rooms/${code}/`);
        setGameRoom(response.data);
      } catch (err) {
        console.error("[Frontend] Erro ao buscar a sala de jogo:", err);
        setError(t("Erro ao buscar a sala de jogo."));
        toast.error(t("Erro ao buscar a sala de jogo."));
      }
    };

    if (code) {
      fetchGameRoom();
    }
  }, [code, t]);

  return { gameRoom, error };
}
