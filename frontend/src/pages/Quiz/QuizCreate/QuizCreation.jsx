import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import authService from "../../../services/authService";
import QuizBasicForm from "../../../components/quiz/QuizBasicForm";

const QuizCreation = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.checkAuth();
      } catch (error) {
        navigate("/login");
      } finally {
        setAuthChecked(true);
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-700 font-medium">
            {t("Checking authorization...")}
          </p>
        </div>
      </div>
    );
  }

  if (!authChecked) {
    return null;
  }

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
