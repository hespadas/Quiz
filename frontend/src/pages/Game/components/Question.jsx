import React from "react";
import { useTranslation } from "react-i18next";

const Question = ({
  gameRoom,
  currentQuestionIndex,
  selectedOptions,
  setSelectedOptions,
  isHost,
}) => {
  const { t } = useTranslation();
  const questions = gameRoom?.quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex] || {};

  const totalQuestions = questions.length;
  const progressPercentage =
    ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleOptionSelect = (optionId) => {
    if (!gameRoom || !currentQuestion.id) return;
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [currentQuestion.id]: optionId,
    }));
  };

  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
            {t("Question")} {currentQuestionIndex + 1}/{questions.length}
          </span>

          {isHost && (
            <span className="text-sm text-gray-500">
              {t("Showing question to players")}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-6">
          {currentQuestion.text}
        </h3>

        <div className="space-y-3 mt-4">
          {currentQuestion.options &&
            currentQuestion.options.map((option) => {
              const isSelected =
                selectedOptions[currentQuestion.id] === option.id;

              return (
                <button
                  key={option.id}
                  onClick={
                    !isHost ? () => handleOptionSelect(option.id) : undefined
                  }
                  disabled={isHost}
                  className={`w-full p-4 rounded-lg border text-left transition-all duration-200
                    ${
                      isSelected
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent"
                        : "bg-white hover:bg-gray-50 border-gray-200 hover:border-indigo-300"
                    }
                    ${isHost ? "cursor-default" : "cursor-pointer"}
                  `}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 min-w-6 rounded-full border flex items-center justify-center mr-3
                      ${
                        isSelected ? "bg-white border-white" : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                      )}
                    </div>
                    <span
                      className={`font-medium ${
                        isSelected ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {option.text}
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Question;
