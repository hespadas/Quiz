import React, { useEffect, useState } from "react";
import axios from "../../../services/axiosConfig";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const QuizDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`/quizzes/${id}/`);
        setQuiz(response.data);
      } catch (err) {
        setError(t("Failed to load quiz details."));
        if (err.response && err.response.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchQuiz();
  }, [id, navigate, t]);

  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-lg max-w-4xl w-full p-6">
        {loading ? (
          <p>{t("Loading quiz details...")}</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : quiz ? (
          <>
            <h2 className="text-3xl font-semibold mb-4">{quiz.title}</h2>
            <p className="text-gray-700 mb-2">{quiz.description}</p>
            <p className="text-gray-500 mb-2">
              {t("Category")}:{" "}
              {quiz.category ? quiz.category.name : t("Uncategorized")}
            </p>

            <h3 className="text-2xl font-semibold mb-2">{t("Questions")}</h3>
            <ul className="space-y-4">
              {quiz.questions.map((question) => (
                <li
                  key={question.id}
                  className="border border-gray-200 p-4 rounded"
                >
                  <p className="font-medium">{question.text}</p>
                  <p className="text-sm text-gray-600">
                    {t("Type")}:{" "}
                    {question.question_type === "MC"
                      ? t("Multiple Choice")
                      : t("True/False")}
                  </p>
                  <ul className="list-disc list-inside mt-2">
                    {question.options.map((option) => (
                      <li
                        key={option.id}
                        className={option.is_correct ? "text-green-600" : ""}
                      >
                        {option.text} {option.is_correct && `(${t("Correct")})`}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Link
                to="/quizzes/"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {t("Back to Quiz List")}
              </Link>
            </div>
          </>
        ) : (
          <p>{t("Quiz not found.")}</p>
        )}
      </div>
    </div>
  );
};

export default QuizDetail;
