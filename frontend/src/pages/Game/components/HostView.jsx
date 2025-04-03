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
    <div className="mt-6">
      <div className="flex justify-between">
        <button
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
          }
          disabled={currentQuestionIndex === 0 || isFinished}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
        >
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isLastQuestion ? t("Submit Quiz") : t("Next")}
          </button>
        )}
      </div>
    </div>
  );
};

export default HostView;
