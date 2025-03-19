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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");

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
        <p className="text-gray-600 mb-2">
          {quiz.category ? quiz.category.title : "Sem Categoria"}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          📅 {new Date(quiz.created_at).toLocaleDateString()}
        </p>
        <button
          onClick={() => onCreateLobby(quiz.id)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t("Iniciar Lobby")}
        </button>
      </div>
    </div>
  );

  const processQuizzes = (quizzes) => {
    return quizzes
      .filter((quiz) =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOption === "newest") {
          return new Date(b.created_at) - new Date(a.created_at);
        } else if (sortOption === "oldest") {
          return new Date(a.created_at) - new Date(b.created_at);
        } else if (sortOption === "name-asc") {
          return a.title.localeCompare(b.title);
        } else if (sortOption === "name-desc") {
          return b.title.localeCompare(a.title);
        }
        return 0;
      });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white/80 backdrop-blur-sm rounded p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {t("Create Game Lobby")}
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4  rounded-lg">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("Search quizzes...")}
            className="w-full sm:w-2/5 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">{t("Newest First")}</option>
              <option value="oldest">{t("Oldest First")}</option>
              <option value="name-asc">{t("Name A-Z")}</option>
              <option value="name-desc">{t("Name Z-A")}</option>
            </select>
          </div>
        </div>

        {processQuizzes(availableQuizzes).length > 0 && (
          <>
            <h3 className="text-xl font-semibold mb-3">{t("Your Quizzes")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {processQuizzes(availableQuizzes).map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onCreateLobby={handleCreateLobby}
                />
              ))}
            </div>
          </>
        )}

        {processQuizzes(generalQuizzes).length > 0 && (
          <>
            <h3 className="text-xl font-semibold mt-6 mb-3">
              {t("General Quizzes")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {processQuizzes(generalQuizzes).map((quiz) => (
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
    </div>
  );
};

export default CreateLobby;
