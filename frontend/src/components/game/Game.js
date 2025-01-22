import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import axios from "../../services/axiosConfig";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { AuthContext } from "../auth/AuthContext";

const Game = () => {
  const { t } = useTranslation();
  const { code } = useParams();
  const { user } = useContext(AuthContext);
  const [gameRoom, setGame] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [error, setError] = useState(null);
  const [score, setScore] = useState(null);
  const socketRef = useRef(null);
  const [finalScores, setFinalScores] = useState(null);

  const submitQuiz = useCallback(async () => {
    console.log(
      `[Frontend] User ${user?.username} submitting answers`,
      selectedOptions
    );
    try {
      const response = await axios.post(
        `/quizzes/submit/${gameRoom.quiz.id}/`,
        { answers: selectedOptions }
      );
      console.log(
        `[Frontend] User ${user?.username} received score:`,
        response.data
      );
      setScore(response.data);

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        console.log(`[Frontend] Sending user_score for ${user.username}`);
        socketRef.current.send(
          JSON.stringify({
            type: "user_score",
            username: user.username,
            score: response.data.score,
            total: response.data.total,
          })
        );
      }
    } catch (error) {
      console.error(
        `[Frontend] User ${user?.username} failed to submit answers`,
        error
      );
      toast.error(t("Error submitting quiz."));
    }
  }, [gameRoom, selectedOptions, t, user?.username]);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        console.log("[Frontend] Fetching game room with code:", code);
        const response = await axios.get(`/game_rooms/${code}/`);
        console.log("[Frontend] Game room data received:", response.data);
        setGame(response.data);
      } catch (err) {
        console.error(
          "[Frontend] Error fetching game room:",
          err.response || err.message
        );
        setError(t("Error fetching game room."));
        toast.error(t("Error fetching game room."));
      }
    };
    fetchGame();
  }, [code, t]);

  useEffect(() => {
    if (gameRoom) {
      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const backendHost = process.env.REACT_APP_BACKEND_HOST;
      const backendPort = process.env.REACT_APP_BACKEND_PORT;
      const wsUrl = `${wsProtocol}://${backendHost}:${backendPort}/ws/game_rooms/${code}/`;
      console.log("[Frontend] Establishing WebSocket connection to:", wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[Frontend] WebSocket connected");
      };

      ws.onmessage = (event) => {
        console.log("[Frontend] WebSocket message received:", event.data);
        try {
          const data = JSON.parse(event.data);
          console.log("[Frontend] Parsed data:", data);
          if (data.type === "quiz_finished") {
            console.log("[Frontend] Handling 'quiz_finished'");
            submitQuiz();
          } else if (data.type === "question_advanced") {
            console.log("[Frontend] Handling 'question_advanced'");
            setCurrentQuestionIndex(data.question_index);
          } else if (data.type === "test_message") {
            console.log("[Frontend] Received test message:", data.content);
          } else if (data.type === "scores_update") {
            console.log("[Frontend] Updating finalScores:", data.scores);
            setFinalScores(data.scores);
          } else {
            console.log("[Frontend] Unknown message type:", data.type);
          }
        } catch (err) {
          console.error("[Frontend] Error parsing WebSocket message:", err);
        }
      };

      ws.onclose = (event) => {
        console.log("[Frontend] WebSocket disconnected:", event);
      };

      ws.onerror = (error) => {
        console.error("[Frontend] WebSocket error:", error);
        if (
          ws.readyState !== WebSocket.CLOSING &&
          ws.readyState !== WebSocket.CLOSED
        ) {
          toast.error(
            "WebSocket encountered an error. Please try again later."
          );
        }
      };

      socketRef.current = ws;

      return () => {
        console.log("[Frontend] Closing WebSocket connection");
        ws.close();
      };
    }
  }, [gameRoom, code, t, submitQuiz]);

  useEffect(() => {
    if (gameRoom && currentQuestionIndex >= gameRoom.quiz.questions.length) {
      console.log("[Frontend] Quiz is finished based on question index");
      submitQuiz();
    }
  }, [currentQuestionIndex, gameRoom, submitQuiz]);

  if (!gameRoom) {
    return <p>{error || t("Loading game room...")}</p>;
  }

  if (score !== null && finalScores) {
    const filteredScores = finalScores.filter(
      (item) => item.username !== gameRoom.host
    );
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h2 className="text-3xl font-bold mb-6">Scoreboard</h2>
        <ul className="w-full max-w-md bg-white rounded-lg shadow p-4 space-y-2">
          {filteredScores.map((item) => (
            <li
              key={item.username}
              className="flex justify-between p-2 border-b last:border-b-0"
            >
              <span className="font-medium text-gray-700">
                {item.username}:
              </span>
              <span className="text-blue-600">
                {item.score}/{item.total}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const questions = gameRoom.quiz.questions;
  const currentQuestion = questions[currentQuestionIndex];

  const isHost = gameRoom.host === user?.username;

  const handleOptionSelect = (optionId) => {
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [currentQuestion.id]: optionId,
    }));
    console.log(
      "[Frontend] Option selected:",
      optionId,
      "for question:",
      currentQuestion.id
    );
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      console.log("[Frontend] Host advancing to question index:", nextIndex);
      socketRef.current.send(
        JSON.stringify({
          type: "advance_question",
          question_index: nextIndex,
        })
      );
    } else {
      console.log("[Frontend] Host is finishing the quiz");
      socketRef.current.send(
        JSON.stringify({
          type: "quiz_finished",
        })
      );
      submitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      console.log("[Frontend] Host returning to question index:", prevIndex);
      socketRef.current.send(
        JSON.stringify({
          type: "advance_question",
          question_index: prevIndex,
        })
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-semibold mb-4">
        {t("Game Room")} {gameRoom.code}
      </h2>
      <h3 className="text-xl font-semibold mb-2">{gameRoom.quiz.title}</h3>

      <p className="text-gray-600">
        {t("Created by")}: {gameRoom.host}
      </p>

      <div className="my-4">
        <h4 className="text-lg font-medium">
          {t("Question")} {currentQuestionIndex + 1}/{questions.length}
        </h4>
        <p>{currentQuestion.text}</p>
      </div>

      <div className="flex flex-col gap-2 my-4">
        {currentQuestion.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            disabled={score !== null}
            className={`p-2 rounded ${
              selectedOptions[currentQuestion.id] === option.id
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>

      {isHost && (
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0 || false}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {t("Previous")}
          </button>
          <button
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex >= questions.length || false}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {currentQuestionIndex < questions.length - 1
              ? t("Next")
              : t("Submit")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
