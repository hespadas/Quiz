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
    void fetchData();
  }, [navigate]);

  const options = [
    { label: t("Join Game"), color: "bg-red-600", path: "/lobby/join/" },
    { label: t("Create Game"), color: "bg-yellow-600", path: "/lobby/create" },
    { label: t("Create Quiz"), color: "bg-green-600", path: "/create-quiz" },
    { label: t("Edit Quiz"), color: "bg-blue-600", path: "/quizzes" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br to-blue-500 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-4xl w-full">
        <div className="text-center mb-8">
          <img
            src="/img/White_Rabbit_Alice_Wonderland.jpeg"
            alt="Profile"
            className="mx-auto h-24 w-24 object-cover rounded-full shadow-md"
          />
          <h3 className="mt-4 text-3xl font-bold">
            {t("Greeting, Welcome to the Quiz Platform")}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => navigate(option.path)}
              className={`${option.color} text-white py-10 rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition duration-200 text-xl font-semibold`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
