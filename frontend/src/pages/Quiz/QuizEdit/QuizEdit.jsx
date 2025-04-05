import React, { useEffect, useState } from "react";
import axios from "../../../services/axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import QuizBasicForm from "../../../components/quiz/QuizBasicForm";

const QuizEdit = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`/quizzes/${id}/`);
        const quizData = {
          id: response.data.id,
          title: response.data.title,
          description: response.data.description,
          category: response.data.category ? response.data.category.id : "",
          questions: (response.data.questions || []).map((q) => ({
            id: q.id,
            text: q.text,
            order: q.order,
            question_type: q.question_type,
            options: (q.options || []).map((o) => ({
              id: o.id,
              text: o.text,
              is_correct: o.is_correct,
            })),
          })),
        };
        setInitialData(quizData);
      } catch (err) {
        setError(t("Failed to load quiz data."));
        if (err.response && err.response.status === 404) {
          navigate("/quizzes");
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchQuiz();
  }, [id, navigate, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-indigo-700 font-medium">
              {t("Loading quiz data...")}
            </p>
          </div>
        ) : error ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center">
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-red-600 font-medium text-lg">{error}</p>
            <button
              onClick={() => navigate("/quizzes")}
              className="mt-6 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {t("Return to Quizzes")}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
              <h2 className="text-2xl font-bold text-white">
                {t("Edit Quiz")}
              </h2>
              <p className="text-indigo-100 text-sm">
                {t("Update your quiz details and questions")}
              </p>
            </div>
            <div className="p-6">
              <QuizBasicForm initialData={initialData} isEdit={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizEdit;
