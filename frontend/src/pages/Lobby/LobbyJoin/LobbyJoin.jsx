import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const JoinGameRoom = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = () => {
    if (!code.trim()) {
      toast.error(t("Please enter a valid game room code."));
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      navigate(`/lobby/${code.trim()}/`);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
          <h2 className="text-2xl font-bold text-white text-center">
            {t("Join Game Room")}
          </h2>
          <p className="text-indigo-100 text-sm text-center">
            {t("Enter a code to join an existing game")}
          </p>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("Game Room Code")}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("Enter code...")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-lg uppercase tracking-wider"
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={isSubmitting}
            className={`w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg 
              hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium
              ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {t("Joining...")}
              </div>
            ) : (
              t("Join Game")
            )}
          </button>

          <p className="mt-6 text-sm text-gray-600 text-center">
            {t("Don't have a code?")}{" "}
            <button
              onClick={() => navigate("/lobby/create")}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {t("Create a new game")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinGameRoom;
