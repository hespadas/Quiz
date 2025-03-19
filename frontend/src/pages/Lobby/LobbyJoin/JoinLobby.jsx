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
      navigate(`/lobby/${code}/`);
    } else {
      toast.error(t("Please enter a valid game room code."));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {t("Join Game Room")}
        </h2>
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
          className="w-full px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {t("Join")}
        </button>
      </div>
    </div>
  );
};

export default JoinGameRoom;
