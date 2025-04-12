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

  const isOptionSelected = (optionId) =>
    selectedOptions[currentQuestion.id] === optionId;

  return (
    <div className="animate-fade-in">
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 mb-6 transition-all animate-slide-up">
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

        <h3 className="text-2xl font-semibold text-gray-900 mb-6 leading-relaxed">
          {currentQuestion.text}
        </h3>

        <div className="grid gap-4 mt-4 sm:grid-cols-1 md:grid-cols-2">
          {currentQuestion.options &&
            currentQuestion.options.map((option) => {
              const isSelected = isOptionSelected(option.id);

              return (
                <button
                  key={option.id}
                  onClick={
                    !isHost ? () => handleOptionSelect(option.id) : undefined
                  }
                  disabled={isHost}
                  aria-pressed={isSelected}
                  role="button"
                  className={`w-full p-4 rounded-lg border text-left transition-all duration-200 shadow-sm
                    ${
                      isSelected
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent"
                        : "bg-white hover:bg-gray-50 border-gray-200 hover:border-indigo-400"
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
