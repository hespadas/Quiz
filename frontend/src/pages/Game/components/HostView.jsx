import React from "react";

const HostView = ({
  t,
  gameRoom,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  sendMessage,
}) => {
  const isLastQuestion =
    currentQuestionIndex === gameRoom.quiz.questions.length - 1;
  const isFinished = currentQuestionIndex >= gameRoom.quiz.questions.length;

  const handleFinishQuiz = () => {
    sendMessage({
      type: "finish_quiz",
    });
  };

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
      <div className="mb-4 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-indigo-800">
          {t("Host Controls")}
        </h3>
      </div>

      <p className="text-sm text-indigo-700 mb-4">
        {isFinished
          ? t("Quiz has been completed")
          : t(
              "You can navigate between questions and control the flow of the game"
            )}
      </p>

      <div className="flex justify-between gap-4">
        <button
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
          }
          disabled={currentQuestionIndex === 0 || isFinished}
          className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center
            ${
              currentQuestionIndex === 0 || isFinished
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300"
            }
            transition-all duration-200`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t("Previous")}
        </button>

        {!isFinished && (
          <button
            onClick={() => {
              if (isLastQuestion) {
                handleFinishQuiz();
              } else {
                sendMessage({
                  type: "advance_question",
                  question_index: currentQuestionIndex + 1,
                });
              }
            }}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg
              hover:shadow-md transition-all duration-200 font-medium flex items-center justify-center"
          >
            {isLastQuestion ? (
              <>
                {t("Submit Quiz")}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </>
            ) : (
              <>
                {t("Next")}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default HostView;
