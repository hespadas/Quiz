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
      console.error(
        `[Frontend] O usuário ${user?.username} falhou ao enviar as respostas`,
        error
      );

      if (error.response) {
        console.error("Erro do backend:", error.response.data);
        toast.error(error.response.data.message || t("Erro ao enviar quiz."));
      } else if (error.request) {
        console.error("Sem resposta do backend:", error.request);
        toast.error(t("Erro de rede. Por favor, tente novamente."));
      } else {
        console.error("Erro:", error.message);
        toast.error(t("Ocorreu um erro inesperado."));
      }
    }
  }, [gameRoom, selectedOptionsRef, user, sendMessage, setScore, t]);
};

export default useSubmitQuiz;
