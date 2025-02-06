import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
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
  const [gameRoom, setGameRoom] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const selectedOptionsRef = useRef(selectedOptions);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(null);
  const [finalScores, setFinalScores] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    selectedOptionsRef.current = selectedOptions;
  }, [selectedOptions]);

  const handleAxiosError = useCallback(
    (err, fallbackMessage) => {
      if (err.response) {
        console.error("[Backend error]:", err.response.data);
        toast.error(err.response.data.message || t(fallbackMessage));
      } else if (err.request) {
        console.error("[No response from backend]:", err.request);
        toast.error(t("Network error. Please try again."));
      } else {
        console.error("[Error]:", err.message);
        toast.error(t("An unexpected error occurred."));
      }
    },
    [t]
  );

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get(`/game_rooms/${code}/`);
        setGameRoom(response.data);
      } catch (err) {
        console.error("[Frontend] Error fetching game room:", err);
        setError(t("Error fetching game room."));
        toast.error(t("Error fetching game room."));
      }
    };
    fetchGame();
  }, [code, t]);

  const submitQuiz = useCallback(async () => {
    if (!gameRoom) return;
    try {
      const { data } = await axios.post(
        `/quizzes/submit/${gameRoom.quiz.id}/`,
        { answers: selectedOptionsRef.current },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setScore(data);

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "user_score",
            username: user.username,
            score: data.score,
            total: data.total,
          })
        );
      }
    } catch (err) {
      console.error(
        `[Frontend] User ${user?.username} failed to submit answers`,
        err
      );
      handleAxiosError(err, "Error submitting quiz.");
    }
  }, [gameRoom, user, handleAxiosError]);

  const connectWebSocket = useCallback(
    (attempt = 1) => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        return;
      }

      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const backendHost = process.env.REACT_APP_BACKEND_HOST || "localhost";
      const backendPort = process.env.REACT_APP_BACKEND_PORT || "8000";
      const wsUrl = `${wsProtocol}://${backendHost}:${backendPort}/ws/game_rooms/${code}/`;

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.info("[WebSocket] Connection established.");
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
        if (attempt < 5) {
          setTimeout(() => connectWebSocket(attempt + 1), attempt * 1000);
        } else {
          toast.error(
            t("WebSocket connection failed after multiple attempts.")
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case "quiz_finished":
              submitQuiz();
              break;
            case "question_advanced":
              setCurrentQuestionIndex(data.question_index);
              break;
            case "scores_update":
              setFinalScores(data.scores);
              break;
            default:
              break;
          }
        } catch (err) {
          console.error("[WebSocket] Error parsing message:", err);
        }
      };

      ws.onclose = () => {
        console.warn(
          "[WebSocket] Connection closed. Attempting to reconnect..."
        );
        setTimeout(() => connectWebSocket(), 2000);
      };
    },
    [code, submitQuiz, t]
  );

  useEffect(() => {
    if (gameRoom && !socketRef.current) {
      connectWebSocket();
      return () => {
        socketRef.current?.close();
      };
    }
  }, [gameRoom, connectWebSocket]);

  useEffect(() => {
    if (gameRoom && currentQuestionIndex >= gameRoom.quiz.questions.length) {
      submitQuiz();
    }
  }, [currentQuestionIndex, gameRoom, submitQuiz]);

  const questions = useMemo(() => gameRoom?.quiz?.questions || [], [gameRoom]);
  const currentQuestion = questions[currentQuestionIndex] || {};

  const handleOptionSelect = useCallback(
    (optionId) => {
      if (!gameRoom || !currentQuestion.id) return;
      setSelectedOptions((prev) => ({
        ...prev,
        [currentQuestion.id]: optionId,
      }));
    },
    [gameRoom, currentQuestion]
  );

  const handleNextQuestion = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast.error(t("Connection lost. Reconnecting..."));
      connectWebSocket();
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      socketRef.current.send(
        JSON.stringify({
          type: "advance_question",
          question_index: currentQuestionIndex + 1,
        })
      );
    } else {
      socketRef.current.send(
        JSON.stringify({
          type: "quiz_finished",
        })
      );
    }
  }, [currentQuestionIndex, questions, connectWebSocket, t]);

  const handlePreviousQuestion = useCallback(() => {
    if (
      currentQuestionIndex > 0 &&
      socketRef.current?.readyState === WebSocket.OPEN
    ) {
      socketRef.current.send(
        JSON.stringify({
          type: "advance_question",
          question_index: currentQuestionIndex - 1,
        })
      );
    }
  }, [currentQuestionIndex]);

  if (!gameRoom) {
    return <p>{error || t("Loading game room...")}</p>;
  }

  if (score !== null && finalScores) {
    const filteredScores = finalScores.filter(
      (item) => item.username !== gameRoom.host
    );

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h2 className="text-3xl font-bold mb-6">{t("Scoreboard")}</h2>
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

  const isHost = gameRoom.host === user?.username;

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
        {currentQuestion.options?.map((option) => (
          <button
            key={option.id}
            onClick={() => !isHost && handleOptionSelect(option.id)}
            disabled={score !== null || isHost}
            className={`p-2 rounded 
          ${
            !isHost && selectedOptions[currentQuestion.id] === option.id
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          } 
          ${isHost ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {option.text}
          </button>
        ))}
      </div>

      {isHost && (
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {t("Previous")}
          </button>
          <button
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex >= questions.length}
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
