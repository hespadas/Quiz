// src/components/quiz/GenerateQuestionsPanel.jsx
import React, { useState } from "react";
import axios from "../../services/axiosConfig";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const SpinnerIcon = ({ className = "h-5 w-5 text-white" }) => (
  <svg
    className={`animate-spin -ml-1 mr-2 ${className}`}
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
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const GenerateQuestionsPanel = ({ setQuestions }) => {
  const { t } = useTranslation();
  const [loadingGPT, setLoadingGPT] = useState(false);
  const [quizTopic, setQuizTopic] = useState("");

  const handleGenerateQuestions = async () => {
    if (!quizTopic.trim()) {
      toast.error(
        t("Please enter a topic or subject.More Specific is better.")
      );
      return;
    }
    setLoadingGPT(true);
    try {
      const payload = {
        quiz_topic: quizTopic,
      };

      const response = await axios.post(
        "/api/gpt/generate-questions/",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setQuestions((prev) => [...prev, ...response.data]);
      toast.success(t("Questions generated successfully!"));
    } catch (error) {
      toast.error(t("Error generating questions. Please try again."));
      console.error(error);
    } finally {
      setLoadingGPT(false);
    }
  };

  return (
    <div className="relative p-6 bg-white rounded-md shadow-lg max-w-xl mx-auto">
      {loadingGPT && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-md">
          <SpinnerIcon className="h-8 w-8 text-indigo-600" />
          <p className="mt-2 text-indigo-700 font-medium">
            {t("Generating questions…")}
          </p>
        </div>
      )}

      <fieldset
        disabled={loadingGPT}
        className={loadingGPT ? "opacity-40" : ""}
      >
        <h3 className="text-2xl font-bold mb-2 text-indigo-700">
          {t("Generate Questions")}
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          {t("Enter a topic or subject to generate questions.")}
        </p>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={quizTopic}
            onChange={(e) => setQuizTopic(e.target.value)}
            placeholder={t("Enter topic or subject")}
            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={handleGenerateQuestions}
            disabled={loadingGPT}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center justify-center"
          >
            {loadingGPT ? (
              <>
                <SpinnerIcon /> {t("Generating…")}
              </>
            ) : (
              t("Generate Questions")
            )}
          </button>
        </div>
      </fieldset>
    </div>
  );
};

export default GenerateQuestionsPanel;
