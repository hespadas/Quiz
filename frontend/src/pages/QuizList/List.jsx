// src/components/quiz/QuizList.js

import React, { useEffect, useState } from "react";
import axios from "../../services/axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const QuizList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);

  const [fetchStatus, setFetchStatus] = useState({
    loading: true,
    error: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [ordering, setOrdering] = useState("-created_at");

  const { loading, error } = fetchStatus;

  useEffect(() => {
    const fetchQuizzes = async () => {
      setFetchStatus((prev) => ({ ...prev, loading: true, error: "" }));

      try {
        const response = await axios.get("/quizzes/", {
          params: {
            page: currentPage,
            search: searchQuery,
            ordering: ordering,
          },
        });

        setQuizzes(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10));
      } catch (err) {
        setFetchStatus((prev) => ({
          ...prev,
          loading: false,
          error: t("Failed to load quizzes."),
        }));

        if (err.response && err.response.status === 401) {
          navigate("/login");
        }
        return;
      }

      setFetchStatus((prev) => ({ ...prev, loading: false, error: "" }));
    };

    void fetchQuizzes();
  }, [currentPage, searchQuery, ordering, navigate, t]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleOrderingChange = (e) => {
    setOrdering(e.target.value);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-3xl font-semibold mb-4">{t("Available Quizzes")}</h2>

      <div className="flex flex-col md:flex-row justify-between mb-6">
        <form
          onSubmit={handleSearch}
          className="flex items-center mb-4 md:mb-0"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("Search Quizzes...")}
            className="border border-gray-300 p-2 rounded-l"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-r hover:bg-blue-700"
          >
            {t("Search")}
          </button>
        </form>

        <div className="flex items-center">
          <label className="mr-2 font-medium">{t("Sort By")}:</label>
          <select
            value={ordering}
            onChange={handleOrderingChange}
            className="border border-gray-300 p-2 rounded"
          >
            <option value="-created_at">{t("Newest")}</option>
            <option value="created_at">{t("Oldest")}</option>
            <option value="title">{t("Title (A-Z)")}</option>
            <option value="-title">{t("Title (Z-A)")}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>{t("Loading quizzes...")}</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : quizzes.length === 0 ? (
        <p>{t("No quizzes found.")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="border border-gray-200 p-4 rounded shadow-sm"
            >
              <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
              <p className="text-gray-700 mb-2">{quiz.description}</p>
              <p className="text-gray-500 mb-2">
                {t("Category")}:{" "}
                {quiz.category ? quiz.category.name : t("Uncategorized")}
              </p>
              <p className="text-gray-500 mb-2">
                {t("Created At")}:{" "}
                {new Date(quiz.created_at).toLocaleDateString()}
              </p>
              <div className="flex space-x-2 mt-2">
                <Link
                  to={`/quizzes/${quiz.id}/`}
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  {t("View Details")}
                </Link>
                <Link
                  to={`/quiz/edit/${quiz.id}`}
                  className="inline-block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  {t("Edit")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {t("Previous")}
            </button>
            <span>
              {t("Page")} {currentPage} {t("of")} {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {t("Next")}
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default QuizList;
