import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import axios from "../../../services/axiosConfig";
import QuizQuestions from "../../../components/quiz/QuizQuestion";

const EditQuestions = () => {
  const { id } = useParams(); // id do quiz
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`/api/quizzes/${id}/questions/`);
        const formattedQuestions = response.data.map((q) => ({
          id: q.id || null,
          text: q.text,
          order: q.order,
          question_type: q.question_type,
          options: q.options.map((o) => ({
            id: o.id || null,
            text: o.text,
            is_correct: o.is_correct,
          })),
        }));
        setQuestions(formattedQuestions);
      } catch (error) {
        toast.error(t("Error fetching questions"));
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    for (let q of questions) {
      if (!q.options.some((option) => option.is_correct)) {
        toast.error(t("Each question must have at least one correct option."));
        setIsSubmitting(false);
        return;
      }
    }

    const formattedPayload = {
      questions: questions.map((q, index) => ({
        id: q.id ?? null,
        text: q.text,
        order: q.order ?? index + 1,
        question_type: q.question_type,
        options: q.options.map((o) => ({
          id: o.id ?? null,
          text: o.text,
          is_correct: o.is_correct,
        })),
      })),
    };

    try {
      await axios.put(
        `/api/quizzes/${id}/questions/bulk-update/`,
        formattedPayload
      );
      toast.success(t("Questions updated successfully!"));
      navigate(`/quiz/edit/${id}/`);
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

  if (loading) {
    return <div className="text-center">{t("Loading questions...")}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white/80 backdrop-blur-sm shadow-md rounded">
      <h2 className="text-2xl font-semibold mb-4">
        {t("Edit Quiz Questions")}
      </h2>
      <form onSubmit={handleSubmit}>
        <QuizQuestions questions={questions} setQuestions={setQuestions} />
        <div className="text-center mt-4">
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

export default EditQuestions;
