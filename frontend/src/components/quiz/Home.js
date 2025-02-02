import { useEffect } from "react";
import axios from "../../services/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios.get("/home/");
      } catch (e) {
        navigate("/login");
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br to-blue-500 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
        <div className="text-center">
          <img
            src="/img/White_Rabbit_Alice_Wonderland.jpeg"
            alt="Profile"
            className="mx-auto h-24 w-24 object-cover rounded-full shadow-md"
          />
          <h3 className="mt-4 text-2xl font-bold">
            {t("Greeting, Welcome to the Quiz Platform")}
          </h3>
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={() => navigate("/quizzes")}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
          >
            {t("Quiz List")}
          </button>
          <button
            onClick={() => navigate("/lobby/create")}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200"
          >
            {t("Create Quiz")}
          </button>
          <button
            onClick={() => navigate("/create-quiz")}
            className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition duration-200"
          >
            {t("Create Lobby")}
          </button>
          <button
            onClick={() => navigate("/lobby/join/")}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
          >
            {t("Enter Lobby")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
