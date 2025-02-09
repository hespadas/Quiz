import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useContext } from "react";
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
  const [gameOver, setGameOver] = useState(false);

  const selectedOptionsRef = useRef(selectedOptions);
  useEffect(() => {
    selectedOptionsRef.current = selectedOptions;
  }, [selectedOptions]);

  const submitQuiz = useSubmitQuiz(
    gameRoom,
    selectedOptionsRef,
    user,
    () => sendMessage({ type: "quiz_finished" }),
    setScore
  );

  const handleWebSocketMessage = useCallback(
    (data) => {
      if (data.type === "quiz_finished") {
        submitQuiz();
        setGameOver(true);
      } else if (data.type === "question_advanced") {
        setCurrentQuestionIndex(data.question_index);
      } else if (data.type === "scores_update") {
        setFinalScores(data.scores);
      }
    },
    [submitQuiz, setCurrentQuestionIndex, setFinalScores] // ✅ Agora `submitQuiz` já foi definido
  );

  const { sendMessage, socket } = useGameWebSocket(
    gameRoom,
    code,
    handleWebSocketMessage,
    !gameOver
  );

  useEffect(() => {
    if (gameRoom && currentQuestionIndex >= gameRoom.quiz.questions.length) {
      submitQuiz();
    }
  }, [currentQuestionIndex, gameRoom, submitQuiz]);

  useEffect(() => {
    if (gameOver && socket) {
      socket.close();
    }
  }, [gameOver, socket]);

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
    gameOver,
  };
};

export default useGameLogic;
