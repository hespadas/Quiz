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
import useWebSocket from "../../hooks/useWebSocket";

const Game = () => {
  const { t } = useTranslation();
  const { code } = useParams();
  const { user } = useContext(AuthContext);
  const [gameRoom, setGame] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [error, setError] = useState(null);
  const [score, setScore] = useState(null);
  const [finalScores, setFinalScores] = useState(null);

  const selectedOptionsRef = useRef(selectedOptions);
  useEffect(() => {
    selectedOptionsRef.current = selectedOptions;
  }, [selectedOptions]);

  const submitQuiz = useCallback(async () => {
    try {
      const response = await axios.post(
        `/quizzes/submit/${gameRoom.quiz.id}/`,
        { answers: selectedOptionsRef.current },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setScore(response.data);

      sendMessage({
        type: "user_score",
        username: user.username,
        score: response.data.score,
        total: response.data.total,
      });
    } catch (error) {
      console.error(
        `[Frontend] O usuário ${user?.username} falhou ao enviar as respostas`,
        error
      );

      if (error.response) {
        console.error("Erro do backend:", error.response.data);
        toast.error(error.response.data.message || t("Erro ao enviar quiz."));
      } else if (error.request) {
        console.error("Sem resposta do backend:", error.request);
        toast.error(t("Erro de rede. Por favor, tente novamente."));
      } else {
        console.error("Erro:", error.message);
        toast.error(t("Ocorreu um erro inesperado."));
      }
    }
  }, [gameRoom, t, user]);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get(`/game_rooms/${code}/`);
        setGame(response.data);
      } catch (err) {
        console.error(
          "[Frontend] Erro ao buscar a sala de jogo:",
          err.response || err.message
        );
        setError(t("Erro ao buscar a sala de jogo."));
        toast.error(t("Erro ao buscar a sala de jogo."));
      }
    };
    void fetchGame();
  }, [code, t]);

  const wsUrl = useMemo(() => {
    if (!gameRoom) return null;
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const backendHost = process.env.REACT_APP_BACKEND_HOST || "localhost";
    const backendPort = process.env.REACT_APP_BACKEND_PORT || "8000";
    return `${wsProtocol}://${backendHost}:${backendPort}/ws/game_rooms/${code}/`;
  }, [gameRoom, code]);

  const handleWebSocketMessage = useCallback(
    (data) => {
      if (data.type === "quiz_finished") {
        submitQuiz();
      } else if (data.type === "question_advanced") {
        setCurrentQuestionIndex(data.question_index);
      } else if (data.type === "scores_update") {
        setFinalScores(data.scores);
      }
    },
    [submitQuiz]
  );

  const { sendMessage } = useWebSocket(wsUrl, handleWebSocketMessage);

  useEffect(() => {
    if (gameRoom && currentQuestionIndex >= gameRoom.quiz.questions.length) {
      submitQuiz();
    }
  }, [currentQuestionIndex, gameRoom, submitQuiz]);

  const questions = useMemo(() => gameRoom?.quiz?.questions || [], [gameRoom]);
  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex] || {},
    [questions, currentQuestionIndex]
  );

  const handleOptionSelect = useCallback(
    (optionId) => {
      if (!gameRoom || !currentQuestion.id) return;
      setSelectedOptions((prevSelectedOptions) => ({
        ...prevSelectedOptions,
        [currentQuestion.id]: optionId,
      }));
    },
    [gameRoom, currentQuestion]
  );

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      sendMessage({
        type: "advance_question",
        question_index: nextIndex,
      });
    } else {
      sendMessage({
        type: "quiz_finished",
      });
    }
  }, [currentQuestionIndex, questions, sendMessage]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      sendMessage({
        type: "advance_question",
        question_index: prevIndex,
      });
    }
  }, [currentQuestionIndex, sendMessage]);

  if (!gameRoom) {
    return <p>{error || t("Carregando sala de jogo...")}</p>;
  }

  if (score !== null && finalScores) {
    const filteredScores = finalScores.filter(
      (item) => item.username !== gameRoom.host
    );
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h2 className="text-3xl font-bold mb-6">Placar</h2>
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
        {t("Sala de Jogo")} {gameRoom.code}
      </h2>
      <h3 className="text-xl font-semibold mb-2">{gameRoom.quiz.title}</h3>
      <p className="text-gray-600">
        {t("Criado por")}: {gameRoom.host}
      </p>
      <div className="my-4">
        <h4 className="text-lg font-medium">
          {t("Pergunta")} {currentQuestionIndex + 1}/{questions.length}
        </h4>
        <p>{currentQuestion.text}</p>
      </div>
      <div className="flex flex-col gap-2 my-4">
        {currentQuestion.options &&
          currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={isHost || score !== null}
              className={`p-2 rounded ${
                selectedOptions[currentQuestion.id] === option.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              } ${isHost ? "opacity-50 cursor-not-allowed" : ""}`}
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
            {t("Anterior")}
          </button>
          <button
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex >= questions.length}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {currentQuestionIndex < questions.length - 1
              ? t("Próxima")
              : t("Enviar")}
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;
