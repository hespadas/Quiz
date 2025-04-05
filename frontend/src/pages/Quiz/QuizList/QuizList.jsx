import React, { useState, useEffect } from "react";
import axios from "../../../services/axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const QuizList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [ordering, setOrdering] = useState("-created_at");

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get("/quizzes/", {
          params: {
            page: currentPage,
            search: searchQuery,
            ordering: ordering,
          },
        });
        setQuizzes(response.data.results || []);
        setTotalPages(Math.ceil(response.data.count / 10));
      } catch (err) {
        setError(t("Failed to load quizzes."));
        if (err.response && err.response.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchQuizzes();
  }, [currentPage, ordering, t, navigate, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/quizzes/", {
          params: {
            page: 1,
            search: searchQuery,
            ordering: ordering,
          },
        });
        setQuizzes(response.data.results || []);
        setTotalPages(Math.ceil(response.data.count / 10));
      } catch (err) {
        toast.error(t("Failed to search quizzes."));
      } finally {
        setLoading(false);
      }
    };

    void fetchQuizzes();
  };

  if (loading && quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-700 font-medium">
            {t("Loading quizzes...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
          <h2 className="text-2xl font-bold text-white">
            {t("Available Quizzes")}
          </h2>
          <p className="text-indigo-100 text-sm">
            {t("Browse, search and manage your quizzes")}
          </p>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("Search Quizzes...")}
                className="border border-gray-300 p-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-r-lg hover:opacity-90 transition-opacity"
              >
                {t("Search")}
              </button>
            </form>

            <div className="flex items-center">
              <label className="mr-2 font-medium text-gray-700">
                {t("Sort By")}:
              </label>
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="-created_at">{t("Newest")}</option>
                <option value="created_at">{t("Oldest")}</option>
                <option value="title">{t("Title (A-Z)")}</option>
                <option value="-title">{t("Title (Z-A)")}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          ) : quizzes.length === 0 ? (
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
              <p className="text-lg font-medium">{t("No quizzes found.")}</p>
              <p className="text-sm text-gray-600 mt-2">
                {t("Try changing your search criteria or create a new quiz.")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                    <h3 className="text-xl font-semibold text-gray-800 truncate">
                      {quiz.title}
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                      {quiz.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {quiz.category && (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded">
                          {quiz.category.name}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Link
                        to={`/quizzes/${quiz.id}/`}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                      >
                        {t("View Details")}
                      </Link>
                      <Link
                        to={`/quiz/edit/${quiz.id}`}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                      >
                        {t("Edit")}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {t("Previous")}
                </button>
                <span className="px-4 py-2 text-gray-700">
                  {t("Page")} {currentPage} {t("of")} {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {t("Next")}
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizList;
