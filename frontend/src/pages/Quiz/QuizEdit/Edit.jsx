import React, { useEffect, useState } from "react";
import axios from "../../../services/axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import QuizBasicForm from "../../../components/quiz/QuizBasicForm";

const EditQuiz = () => {
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
    <div className="min-h-screen flex items-center">
      <div className="w-full">
        {loading ? (
          <div className="p-6 text-center">{t("Loading quiz data...")}</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : (
          <QuizBasicForm initialData={initialData} isEdit={true} />
        )}
      </div>
    </div>
  );
};

export default EditQuiz;
