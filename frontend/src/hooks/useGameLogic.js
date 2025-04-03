import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import useGameRoom from "./useGameRoom";
import useGameWebSocket from "./useGameWebSocket";
import useSubmitQuiz from "./useSubmitQuiz";
import { AuthContext } from "../components/auth/AuthContext";

const useGameLogic = () => {
  const { code } = useParams();
  const { user } = useContext(AuthContext);

  const { gameRoom, error } = useGameRoom(code);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [score, setScore] = useState(null);
  const [finalScores, setFinalScores] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const username = user?.username || localStorage.getItem("guestName");

  const selectedOptionsRef = useRef(selectedOptions);
  useEffect(() => {
    selectedOptionsRef.current = selectedOptions;
  }, [selectedOptions]);

  const submitQuizRef = useRef(null);

  const triggerSubmitQuiz = useCallback(() => {
    if (submitQuizRef.current) {
      submitQuizRef.current();
    } else {
      console.warn("Submit quiz function not yet initialized");
    }
  }, []);

  const handleWebSocketMessage = useCallback(
    (data) => {
      if (data.type === "question_advanced") {
        setCurrentQuestionIndex(data.question_index);
      } else if (data.type === "scores_update") {
        setFinalScores(data.scores);
      } else if (data.type === "quiz_finished") {
        setQuizFinished(true);
        triggerSubmitQuiz();
      }
    },
    [triggerSubmitQuiz]
  );

  const { sendMessage } = useGameWebSocket(
    gameRoom,
    code,
    username,
    handleWebSocketMessage,
    true
  );

  const submitQuiz = useSubmitQuiz(
    gameRoom,
    selectedOptionsRef,
    user || { username: localStorage.getItem("guestName") },
    sendMessage,
    setScore,
    setIsSubmitting
  );

  useEffect(() => {
    submitQuizRef.current = submitQuiz;
  }, [submitQuiz]);

  useEffect(() => {
    if (
      gameRoom &&
      !quizFinished &&
      currentQuestionIndex >= gameRoom.quiz.questions.length
    ) {
      triggerSubmitQuiz();
      setQuizFinished(true);
    }
  }, [currentQuestionIndex, gameRoom, quizFinished, triggerSubmitQuiz]);

  return {
    gameRoom,
    error,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    selectedOptions,
    setSelectedOptions,
    score,
    finalScores,
    submitQuiz,
    sendMessage,
    user,
    isSubmitting,
  };
};

export default useGameLogic;
