import React, { useEffect, useState } from "react";
import axios from "../../services/axiosConfig";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const GameRoom = () => {
  const { t } = useTranslation();
  const { code } = useParams();
  const [gameRoom, setGameRoom] = useState(null);

  useEffect(() => {
    const fetchGameRoom = async () => {
      try {
        const response = await axios.get(`/game_rooms/${code}/`);
        setGameRoom(response.data);
      } catch (error) {
        console.error("Error fetching game room:", error);
        toast.error(t("Error fetching game room."));
      }
    };
    fetchGameRoom();
  }, [code, t]);

  if (!gameRoom) {
    return <p>{t("Loading game room...")}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-semibold mb-4">
        {t("Game Room")} {gameRoom.code}
      </h2>
      <h3 className="text-xl font-semibold mb-2">{gameRoom.quiz.title}</h3>
    </div>
  );
};

export default GameRoom;
