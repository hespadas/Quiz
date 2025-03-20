import React from "react";
import { useTranslation } from "react-i18next";
import useGameLogic from "../../hooks/useGameLogic";
import Scoreboard from "./components/Scoreboard";
import Question from "./components/Question";
import WaitScreen from "./components/WaitScreen";

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

  if (!gameRoom) {
    return <p>{error || t("Loading game room...")}</p>;
  }

  if (isSubmitting) {
    return <WaitScreen message="Loading results, please wait..." />;
  }

  if (score !== null && finalScores) {
    return <Scoreboard finalScores={finalScores} host={gameRoom.host} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-4xl p-6 bg-white/80 backdrop-blur-sm rounded shadow-md">
        <h2 className="text-2xl font-semibold mb-4">
          {t("Game Room")} {gameRoom.code}
        </h2>
        <h3 className="text-xl font-semibold mb-2">{gameRoom.quiz.title}</h3>
        <p className="text-gray-600">
          {t("Created by")}: {gameRoom.host}
        </p>

        <Question
          gameRoom={gameRoom}
          currentQuestionIndex={currentQuestionIndex}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          isHost={gameRoom.host === user?.username}
        />

        {gameRoom.host === user?.username && (
          <div className="flex justify-between mt-6">
            <button
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
            >
              {t("Previous")}
            </button>
            <button
              onClick={() =>
                sendMessage({
                  type: "advance_question",
                  question_index: currentQuestionIndex + 1,
                })
              }
              disabled={currentQuestionIndex >= gameRoom.quiz.questions.length}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
            >
              {currentQuestionIndex < gameRoom.quiz.questions.length - 1
                ? t("Next")
                : t("Submit")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
