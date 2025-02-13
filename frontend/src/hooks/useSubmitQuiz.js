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
    try {
      const response = await axios.post(
        `/quizzes/submit/${gameRoom.quiz.id}/`,
        { answers: selectedOptionsRef.current },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setScore(response.data);
      sendMessage({
        type: "user_score",
        username: user.username,
        score: response.data.score,
        total: response.data.total,
      });
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || t("Error submitting quiz."));
      } else if (error.request) {
        toast.error(t("Network error. Please try again."));
      } else {
        toast.error(t("An unexpected error has occurred."));
      }
    } finally {
      setIsSubmitting(false);
    }
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
