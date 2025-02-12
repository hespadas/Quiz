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
  setScore
) => {
  const { t } = useTranslation();

  return useCallback(async () => {
    try {
      if (!gameRoom) return;
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
        toast.error(error.response.data.message || t("Erro ao enviar quiz."));
      } else if (error.request) {
        toast.error(t("Erro de rede. Por favor, tente novamente."));
      } else {
        toast.error(t("Ocorreu um erro inesperado."));
      }
    }
  }, [gameRoom, selectedOptionsRef, user, sendMessage, setScore, t]);
};

export default useSubmitQuiz;
