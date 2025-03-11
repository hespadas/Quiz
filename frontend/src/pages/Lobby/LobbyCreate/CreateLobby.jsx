import React, { useEffect, useState } from "react";
import axios from "../../../services/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const CreateLobby = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [availableQuizzes, setAvailableQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get("/quizzes/");
        setAvailableQuizzes(response.data.results);
      } catch (error) {
        toast.error(t("Erro ao buscar quizzes."));
      }
    };
    void fetchQuizzes();
  }, [t]);

  const handleCreateLobby = async (quizId) => {
    try {
      const response = await axios.post("/game_rooms/create/", {
        quiz_id: quizId,
      });
      const gameRoom = response.data;
      toast.success(t("Sala de jogo criada! Código: ") + gameRoom.code);
      navigate(`/lobby/${gameRoom.code}/`);
    } catch (error) {
      toast.error(t("Erro ao criar a sala de jogo."));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">{t("Criar Sala de Jogo")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {availableQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white shadow-md rounded overflow-hidden"
          >
            {/* Exibe a imagem se existir; caso contrário, usa uma imagem padrão */}
            <img
              src={
                quiz.imagem ||
                "https://via.placeholder.com/300x200?text=Sem+Imagem"
              }
              alt={quiz.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
              <p className="text-gray-600 mb-4">
                {quiz.category ? quiz.category.title : t("Sem Categoria")}
              </p>
              <button
                onClick={() => handleCreateLobby(quiz.id)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t("Iniciar Lobby")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateLobby;
