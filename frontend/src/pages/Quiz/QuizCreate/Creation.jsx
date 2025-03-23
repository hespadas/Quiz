import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../../services/authService";
import QuizBasicForm from "../../../components/quiz/QuizBasicForm";

const QuizCreation = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.checkAuth();
      } catch (error) {
        navigate("/login");
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [navigate]);

  if (!authChecked) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center">
      <div className="w-full">
        <QuizBasicForm />
      </div>
    </div>
  );
};

export default QuizCreation;
