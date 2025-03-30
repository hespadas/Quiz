// src/hooks/useSubmitQuiz.js
import { useCallback } from "react";
import axios from "../services/axiosConfig";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const useSubmitQuiz = (
  gameRoom,
  selectedOptionsRef,
  user,
  sendMessage,
  setScore,
  setIsSubmitting
) => {
  const { t } = useTranslation();

  return useCallback(async () => {
    if (!gameRoom) return;
    setIsSubmitting(true);

    const totalQuestions = gameRoom.quiz.questions.length;
    let correctAnswers = 0;

    gameRoom.quiz.questions.forEach((question) => {
      const selected = selectedOptionsRef.current[question.id];
      if (selected && selected === question.correct_answer) correctAnswers++;
    });

    const score = correctAnswers;
    setScore({ score, total: totalQuestions });

    if (user && user.token) {
      try {
        await axios.post(
          `/quizzes/submit/${gameRoom.quiz.id}/`,
          { answers: selectedOptionsRef.current },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
      } catch (error) {
        if (error.response) {
          toast.error(
            error.response.data.message || t("Error submitting quiz.")
          );
        } else if (error.request) {
          toast.error(t("Network error. Please try again."));
        } else {
          toast.error(t("An unexpected error has occurred."));
        }
      }
    }

    sendMessage({
      type: "user_score",
      username: user.username,
      score,
      total: totalQuestions,
    });

    setIsSubmitting(false);
  }, [
    gameRoom,
    selectedOptionsRef,
    user,
    sendMessage,
    setScore,
    setIsSubmitting,
    t,
  ]);
};

export default useSubmitQuiz;
