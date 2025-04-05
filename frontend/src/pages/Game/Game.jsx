import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useGameLogic from "../../hooks/useGameLogic";
import Scoreboard from "./components/Scoreboard";
import Question from "./components/Question";
import HostView from "./components/HostView";

const Game = () => {
  const { t } = useTranslation();
  const {
    gameRoom,
    error,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    selectedOptions,
    setSelectedOptions,
    score,
    finalScores,
    sendMessage,
    user,
    isSubmitting,
  } = useGameLogic();

  const [showScoreboard, setShowScoreboard] = useState(false);

  useEffect(() => {
    if (score !== null && finalScores) {
      setShowScoreboard(true);
    }
  }, [score, finalScores]);

  if (!gameRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-700 font-medium">
            {error || t("Loading game room...")}
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-700 font-medium">
            {t("Loading results, please wait...")}
          </p>
        </div>
      </div>
    );
  }

  if (showScoreboard || (score !== null && finalScores)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
            <h2 className="text-2xl font-bold text-white text-center">
              {t("Game Results")}
            </h2>
            <p className="text-indigo-100 text-sm text-center">
              {t("Quiz")} {gameRoom.quiz.title}
            </p>
          </div>
          <Scoreboard finalScores={finalScores} host={gameRoom.host} />
        </div>
      </div>
    );
  }

  const isHost = user?.role === "host" || gameRoom.host === user?.username;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
          <h2 className="text-2xl font-bold text-white">
            {t("Game Room")}: {gameRoom.code}
          </h2>
          <div className="flex flex-wrap items-center justify-between">
            <p className="text-indigo-100 text-sm">{gameRoom.quiz.title}</p>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
              {t("Host")}: {gameRoom.host}
            </span>
          </div>
          {user?.username && (
            <div className="mt-2 text-sm text-white/90">
              {t("You're playing as")}: <strong>{user.username}</strong>
            </div>
          )}
        </div>
        <div className="p-6">
          <Question
            gameRoom={gameRoom}
            currentQuestionIndex={currentQuestionIndex}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            isHost={isHost}
          />
          {isHost && (
            <HostView
              t={t}
              gameRoom={gameRoom}
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              sendMessage={sendMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
