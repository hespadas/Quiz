import React, { useContext, useEffect, useState } from "react";
import axios from "../../services/axiosConfig";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { AuthContext } from "../auth/AuthContext";

const GameRoom = () => {
  const { t } = useTranslation();
  const { code } = useParams();
  const { user } = useContext(AuthContext);
  const [gameRoom, setGameRoom] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});

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

  const questions = gameRoom.quiz.questions;
  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (optionId) => {
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-semibold mb-4">
        {t("Game Room")} {gameRoom.code}
      </h2>
      <h3 className="text-xl font-semibold mb-2">{gameRoom.quiz.title}</h3>

      <p className="text-gray-600">
        {t("Created by")}: {gameRoom.host}
      </p>

      <div className="my-4">
        <h4 className="text-lg font-medium">
          {t("Question")} {currentQuestionIndex + 1}/{questions.length}
        </h4>
        <p>{currentQuestion.text}</p>
      </div>

      <div className="flex flex-col gap-2 my-4">
        {currentQuestion.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            className={`p-2 rounded ${
              selectedOptions[currentQuestion.id] === option.id
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {t("Previous")}
        </button>
        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {t("Next")}
        </button>
      </div>
    </div>
  );
};

export default GameRoom;
