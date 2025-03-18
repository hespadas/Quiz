import React, { useState, useEffect } from "react";
import axios from "../../services/axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import QuizQuestions from "./QuizQuestion";

const QuizQuestionsForm = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carrega as questões do quiz
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`/api/quizzes/${id}/questions/`);
        setQuestions(response.data);
      } catch (error) {
        toast.error(t("Error fetching questions"));
      }
    };
    fetchQuestions();
  }, [id, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Valida que cada questão tem pelo menos uma opção correta
    for (let q of questions) {
      if (!q.options.some((option) => option.is_correct)) {
        toast.error(t("Each question must have at least one correct option."));
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Exemplo: envio das questões para um endpoint específico de atualização
      await axios.put(`/quiz/${id}/update-questions/`, { questions });
      toast.success(t("Questions updated successfully!"));
      navigate(`/quizzes/${id}/`);
    } catch (error) {
      let errorMessage = t(
        "Failed to update questions. Please check your inputs."
      );
      if (error.response && error.response.data) {
        errorMessage = JSON.stringify(error.response.data);
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white/80 backdrop-blur-sm shadow-md rounded">
      <h2 className="text-2xl font-semibold mb-4">
        {t("Edit Quiz Questions2")}
      </h2>
      <form onSubmit={handleSubmit}>
        <QuizQuestions questions={questions} setQuestions={setQuestions} />
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {t("Update Questions")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizQuestionsForm;
