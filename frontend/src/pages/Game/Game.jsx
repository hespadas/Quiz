import React from "react";
import { useTranslation } from "react-i18next";
import useGameLogic from "../../hooks/useGameLogic";
import Scoreboard from "./components/Scoreboard";
import Question from "./components/Question";

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
  } = useGameLogic();

  if (!gameRoom) {
    return <p>{error || t("Carregando sala de jogo...")}</p>;
  }

  if (score !== null && finalScores) {
    return <Scoreboard finalScores={finalScores} host={gameRoom.host} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-semibold mb-4">
        {t("Sala de Jogo")} {gameRoom.code}
      </h2>
      <h3 className="text-xl font-semibold mb-2">{gameRoom.quiz.title}</h3>
      <p className="text-gray-600">
        {t("Criado por")}: {gameRoom.host}
      </p>

      <Question
        gameRoom={gameRoom}
        currentQuestionIndex={currentQuestionIndex}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
      />

      {gameRoom.host === user?.username && (
        <div className="flex justify-between mt-6">
          <button
            onClick={() =>
              setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {t("Anterior")}
          </button>
          <button
            onClick={() =>
              sendMessage({
                type: "advance_question",
                question_index: currentQuestionIndex + 1,
              })
            }
            disabled={currentQuestionIndex >= gameRoom.quiz.questions.length}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {currentQuestionIndex < gameRoom.quiz.questions.length - 1
              ? t("Próxima")
              : t("Enviar")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
