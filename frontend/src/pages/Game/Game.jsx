import React from "react";
import { useTranslation } from "react-i18next";
import useGameLogic from "../../hooks/useGameLogic";
import Scoreboard from "./components/Scoreboard";
import Question from "./components/Question";
import WaitScreen from "./components/WaitScreen";

const HostView = ({
  t,
  gameRoom,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  sendMessage,
}) => {
  return (
    <div className="mt-6">
      <div className="flex justify-between">
        <button
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
          }
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
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
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
        >
          {currentQuestionIndex < gameRoom.quiz.questions.length - 1
            ? t("Próxima")
            : t("Enviar")}
        </button>
      </div>
    </div>
  );
};

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
    return <p>{error || t("Carregando sala de jogo...")}</p>;
  }

  if (isSubmitting) {
    return <WaitScreen message="Carregando resultados, por favor aguarde..." />;
  }

  if (score !== null && finalScores) {
    return <Scoreboard finalScores={finalScores} host={gameRoom.host} />;
  }

  const isHost = user?.role === "host" || gameRoom.host === user?.username;

  if (isHost) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-4xl p-6 bg-white/80 backdrop-blur-sm rounded shadow-md">
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
            isHost={isHost}
          />

          <HostView
            t={t}
            gameRoom={gameRoom}
            currentQuestionIndex={currentQuestionIndex}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            sendMessage={sendMessage}
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-4xl p-6 bg-white/80 backdrop-blur-sm rounded shadow-md">
          <Question
            gameRoom={gameRoom}
            currentQuestionIndex={currentQuestionIndex}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            isHost={isHost}
          />
        </div>
      </div>
    );
  }
};

export default Game;
