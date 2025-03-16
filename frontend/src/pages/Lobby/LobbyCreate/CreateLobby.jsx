import React, { useEffect, useState } from "react";
import axios from "../../../services/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const CreateLobby = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [generalQuizzes, setGeneralQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const [userQuizzesResponse, generalQuizzesResponse] = await Promise.all(
          [axios.get("/quizzes/"), axios.get("/quizzes/general/")]
        );

        setAvailableQuizzes(userQuizzesResponse.data.results);
        setGeneralQuizzes(generalQuizzesResponse.data.results);
      } catch (error) {
        toast.error(t("Error loading quizzes"));
      }
    };
    void fetchQuizzes();
  }, [t]);

  const QuizCard = ({ quiz, onCreateLobby }) => (
    <div className="bg-white shadow-md rounded overflow-hidden">
      <img
        src={
          quiz.imagem || "https://via.placeholder.com/300x200?text=Sem+Imagem"
        }
        alt={quiz.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
        <p className="text-gray-600 mb-4">
          {quiz.category ? quiz.category.title : "Sem Categoria"}
        </p>
        <button
          onClick={() => onCreateLobby(quiz.id)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Iniciar Lobby
        </button>
      </div>
    </div>
  );

  const handleCreateLobby = async (quizId) => {
    try {
      const response = await axios.post("/game_rooms/create/", {
        quiz_id: quizId,
      });
      const gameRoom = response.data;
      toast.success(t("Game lobby created successfully"));
      navigate(`/lobby/${gameRoom.code}/`);
    } catch (error) {
      toast.error(t("Error creating game lobby"));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">{t("Create Game Lobby")}</h2>

      {availableQuizzes.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mb-3">{t("Your Quizzes")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {availableQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onCreateLobby={handleCreateLobby}
              />
            ))}
          </div>
        </>
      )}

      {generalQuizzes.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-6 mb-3">
            {t("General Quizzes")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {generalQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onCreateLobby={handleCreateLobby}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CreateLobby;
