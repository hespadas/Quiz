import React from "react";

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
export default HostView;
