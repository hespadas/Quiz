import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useGameLogic from "../../hooks/useGameLogic";
import Scoreboard from "./components/Scoreboard";
import Question from "./components/Question";
import WaitScreen from "./components/WaitScreen";
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
    return <p>{error || t("Carregando sala de jogo...")}</p>;
  }

  if (isSubmitting) {
    return <WaitScreen message="Carregando resultados, por favor aguarde..." />;
  }

  if (showScoreboard || (score !== null && finalScores)) {
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
