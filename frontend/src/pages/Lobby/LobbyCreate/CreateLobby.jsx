import React, { useEffect, useState } from "react";
import axios from "../../../services/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import authService from "../../../services/authService";

const CreateLobby = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [generalQuizzes, setGeneralQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [loading, setLoading] = useState(true);

  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        await authService.checkAuth();
        setIsAuthenticated(true);
      } catch (error) {
        navigate("/login");
      } finally {
        setAuthChecked(true);
      }
    };
    checkUserAuth();
  }, [navigate]);

  useEffect(() => {
    if (!authChecked || !isAuthenticated) return;
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const [userQuizzesResponse, generalQuizzesResponse] = await Promise.all(
          [axios.get("/quizzes/"), axios.get("/quizzes/general/")]
        );
        setAvailableQuizzes(userQuizzesResponse.data.results);
        setGeneralQuizzes(generalQuizzesResponse.data.results);
      } catch (error) {
        toast.error(t("Error loading quizzes"));
      } finally {
        setLoading(false);
      }
    };
    void fetchQuizzes();
  }, [t, authChecked, isAuthenticated]);

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
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
        {quiz.imagem ? (
          <img
            src={quiz.imagem}
            alt={quiz.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-white/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {quiz.title}
        </h3>
        <div className="flex gap-2 mb-3">
          {quiz.category && (
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded">
              {quiz.category.title}
            </span>
          )}
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
            {new Date(quiz.created_at).toLocaleDateString()}
          </span>
        </div>
        <button
          onClick={() => onCreateLobby(quiz.id)}
          className="w-full px-4 py-3 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 font-medium"
        >
          {t("Start Lobby")}
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

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-700 font-medium">
            {t("Checking authorization...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 py-8 px-4">
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
          <h2 className="text-2xl font-bold text-white">
            {t("Create Game Lobby")}
          </h2>
          <p className="text-indigo-100 text-sm">
            {t("Select a quiz to create your game lobby")}
          </p>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="relative w-full sm:w-2/5">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("Search quizzes...")}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full p-3 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
              >
                <option value="newest">{t("Newest First")}</option>
                <option value="oldest">{t("Oldest First")}</option>
                <option value="name-asc">{t("Name A-Z")}</option>
                <option value="name-desc">{t("Name Z-A")}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {processQuizzes(availableQuizzes).length > 0 && (
                <>
                  <div className="mb-3 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {t("Your Quizzes")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                  <div className="mb-3 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {t("General Quizzes")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

              {processQuizzes(availableQuizzes).length === 0 &&
                processQuizzes(generalQuizzes).length === 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto text-blue-400 mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <p className="text-lg font-medium">
                      {t("No quizzes found")}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {t(
                        "Try changing your search criteria or create a new quiz"
                      )}
                    </p>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateLobby;
