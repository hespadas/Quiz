// src/hooks/useQuizProgress.js

import { useState, useEffect, useMemo, useCallback } from "react";

export default function useQuizProgress(gameRoom, submitQuiz, sendMessage) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (
      gameRoom &&
      currentQuestionIndex >= (gameRoom.quiz?.questions?.length || 0)
    ) {
      submitQuiz();
    }
  }, [currentQuestionIndex, gameRoom, submitQuiz]);

  const questions = useMemo(() => gameRoom?.quiz?.questions || [], [gameRoom]);

  const currentQuestion = useMemo(() => {
    return questions[currentQuestionIndex] || {};
  }, [questions, currentQuestionIndex]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      sendMessage({
        type: "advance_question",
        question_index: currentQuestionIndex + 1,
      });
    } else {
      sendMessage({
        type: "quiz_finished",
      });
    }
  }, [currentQuestionIndex, questions.length, sendMessage]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      sendMessage({
        type: "advance_question",
        question_index: currentQuestionIndex - 1,
      });
    }
  }, [currentQuestionIndex, sendMessage]);

  const setQuestionIndexFromOutside = useCallback(
    (newIndex) => {
      setCurrentQuestionIndex(newIndex);
    },
    [setCurrentQuestionIndex]
  );

  return {
    currentQuestionIndex,
    currentQuestion,
    questions,
    handleNextQuestion,
    handlePreviousQuestion,
    setCurrentQuestionIndex: setQuestionIndexFromOutside,
  };
}
