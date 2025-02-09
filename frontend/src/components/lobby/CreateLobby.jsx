import React, { useEffect, useState } from "react";
import axios from "../../services/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const CreateLobby = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [quizId, setQuizId] = useState("");
  const [availableQuizzes, setAvailableQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get("/quizzes/");
        setAvailableQuizzes(response.data.results);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        toast.error(t("Error fetching quizzes."));
      }
    };
    void fetchQuizzes();
  }, [t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/game_rooms/create/", {
        quiz_id: quizId,
      });
      const gameRoom = response.data;
      toast.success(t("Game room created! Code: ") + gameRoom.code);
      navigate(`/lobby/${gameRoom.code}/`);
    } catch (error) {
      console.error("Error creating game room:", error);
      toast.error(t("Error creating game room."));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-2xl font-semibold mb-4">{t("Create Game Room")}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">{t("Select Quiz")}</label>
          <select
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="">{t("Select a quiz")}</option>
            {availableQuizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t("Create")}
        </button>
      </form>
    </div>
  );
};

export default CreateLobby;
