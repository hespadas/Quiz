import React from "react";
import { useTranslation } from "react-i18next";

const Question = ({
  gameRoom,
  currentQuestionIndex,
  selectedOptions,
  setSelectedOptions,
}) => {
  const { t } = useTranslation();
  const questions = gameRoom?.quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex] || {};

  const handleOptionSelect = (optionId) => {
    if (!gameRoom || !currentQuestion.id) return;
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [currentQuestion.id]: optionId,
    }));
  };

  return (
    <div className="my-4">
      <h4 className="text-lg font-medium">
        {t("Question")} {currentQuestionIndex + 1}/{questions.length}
      </h4>
      <p>{currentQuestion.text}</p>
      <div className="flex flex-col gap-2 my-4">
        {currentQuestion.options &&
          currentQuestion.options.map((option) => (
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
    </div>
  );
};

export default Question;
