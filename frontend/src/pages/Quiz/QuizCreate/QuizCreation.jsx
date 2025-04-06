import React from "react";

import { useTranslation } from "react-i18next";
import QuizBasicForm from "../../../components/quiz/QuizBasicForm";

const QuizCreation = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
          <h2 className="text-2xl font-bold text-white">
            {t("Create New Quiz")}
          </h2>
          <p className="text-indigo-100 text-sm">
            {t("Set up your new quiz and add questions")}
          </p>
        </div>
        <div className="p-6">
          <QuizBasicForm />
        </div>
      </div>
    </div>
  );
};

export default QuizCreation;
