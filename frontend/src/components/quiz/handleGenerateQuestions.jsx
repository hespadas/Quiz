import React, { useState } from "react";
import axios from "../../services/axiosConfig";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const GenerateQuestionsPanel = ({ setQuestions }) => {
  const { t } = useTranslation();
  const [loadingGPT, setLoadingGPT] = useState(false);
  const [quizTopic, setQuizTopic] = useState("");

  const handleGenerateQuestions = async () => {
    if (!quizTopic.trim()) {
      toast.error(t("Please enter a topic or subject."));
      return;
    }

    setLoadingGPT(true);
    try {
      const questionCount = 5;
      const response = await axios.post("/api/gpt/generate-questions/", {
        quizTopic,
        questionCount,
      });

      const newQuestions = response.data;
      setQuestions((prev) => [...prev, ...newQuestions]);
      toast.success("Questions generated successfully!");
    } catch (error) {
      toast.error("Error generating questions. Please try again.");
      console.error(error);
    } finally {
      setLoadingGPT(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-lg max-w-xl mx-auto">
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
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
        >
          {loadingGPT ? t("Generating...") : t("Generate Questions")}
        </button>
      </div>
    </div>
  );
};

export default GenerateQuestionsPanel;
