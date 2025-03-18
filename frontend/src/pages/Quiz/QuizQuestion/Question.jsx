// QuizQuestionsScreen.js
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import axios from "../../services/axiosConfig";
import QuizQuestions from "./QuizQuestion"; // você pode reutilizar o componente existente
import { useNavigate } from "react-router-dom";

const QuizQuestionsScreen = ({ quizData, onSubmitQuestions }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(quizData.questions || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    for (let q of questions) {
      if (!q.options.some((option) => option.is_correct)) {
        toast.error(t("Each question must have at least one correct option."));
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", quizData.title);
    formData.append("description", quizData.description);
    formData.append(
      "category_id",
      quizData.category !== "" ? Number(quizData.category) : ""
    );
    if (quizData.imagem) {
      formData.append("imagem", quizData.imagem);
    }
    formData.append("questions", JSON.stringify(questions));

    setIsSubmitting(true);
    try {
      await axios.post("/quizzes/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("Quiz created successfully!"));
      navigate("/quizzes");
    } catch (error) {
      let errorMessage = t("Failed to submit quiz. Please check your inputs.");
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
      <h2 className="text-2xl font-semibold mb-4">{t("Crie as Questões")}</h2>
      <form onSubmit={handleFinalSubmit}>
        <QuizQuestions questions={questions} setQuestions={setQuestions} />
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {t("Finalizar Quiz")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizQuestionsScreen;
