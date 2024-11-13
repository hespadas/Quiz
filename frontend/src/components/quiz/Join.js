import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const JoinGameRoom = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const handleJoin = () => {
    if (code.trim()) {
      navigate(`/game_rooms/${code}/`);
    } else {
      toast.error(t("Please enter a valid game room code."));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-semibold mb-4">{t("Join Game Room")}</h2>
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          {t("Enter Game Room Code")}
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>
      <button
        onClick={handleJoin}
        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {t("Join")}
      </button>
    </div>
  );
};

export default JoinGameRoom;
