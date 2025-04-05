import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import axios from "../../../services/axiosConfig";
import QuizQuestions from "../../../components/quiz/QuizQuestion";

const EditQuestions = () => {
  const { id } = useParams();
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-700 font-medium">
            {t("Loading questions...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
          <h2 className="text-2xl font-bold text-white">
            {t("Edit Quiz Questions")}
          </h2>
          <p className="text-indigo-100 text-sm">
            {t("Customize your question settings and answers")}
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <QuizQuestions questions={questions} setQuestions={setQuestions} />
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium
                shadow-md hover:shadow-lg focus:outline-none focus:ring-2
                focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200
                ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("Updating...")}
                  </span>
                ) : (
                  t("Update Questions")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditQuestions;
