import { useEffect } from "react";
import apiPublic from "../../services/apiPublic";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      await apiPublic.get("/home/");
    };
    void fetchData();
  }, [navigate]);

  const options = [
    {
      label: t("Join Game"),
      color: "bg-gradient-to-r from-pink-500 to-red-500",
      path: "/lobby/join/",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      label: t("Create Game"),
      color: "bg-gradient-to-r from-amber-400 to-yellow-500",
      path: "/lobby/create",
      icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
    },
    {
      label: t("Create Quiz"),
      color: "bg-gradient-to-r from-emerald-400 to-green-500",
      path: "/create-quiz",
      icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    },
    {
      label: t("Edit Quiz"),
      color: "bg-gradient-to-r from-blue-400 to-indigo-500",
      path: "/quizzes",
      icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-violet-500 to-indigo-600 p-4 sm:p-8">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-4xl w-full">
        <div className="text-center mb-10">
          <div className="relative w-28 h-28 mx-auto">
            <img
              src="/img/White_Rabbit_Alice_Wonderland.jpeg"
              alt="Profile"
              className="h-28 w-28 object-cover rounded-full shadow-lg border-4 border-white"
            />
            <div className="absolute -bottom-2 -right-2 bg-indigo-500 w-8 h-8 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
          </div>
          <h3 className="mt-6 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            {t("Welcome to Rabbit Quiz")}
          </h3>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            {t(
              "Create, play and challenge your friends with interactive quizzes"
            )}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => navigate(option.path)}
              className={`${option.color} group relative text-white py-5 px-6 rounded-xl shadow-lg
                hover:shadow-2xl transition duration-300 transform hover:scale-105 
                flex items-center justify-between`}
            >
              <div className="flex flex-col items-start">
                <span className="text-xl font-semibold">{option.label}</span>
                <span className="text-sm opacity-80 mt-1">
                  {option.label === t("Join Game")
                    ? t("Enter a game code to join")
                    : option.label === t("Create Game")
                    ? t("Host a new game session")
                    : option.label === t("Create Quiz")
                    ? t("Build your own quiz")
                    : t("Modify your quizzes")}
                </span>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={option.icon}
                  />
                </svg>
              </div>
              <span className="absolute bottom-2 right-2 text-xs font-medium opacity-70">
                {idx + 1}/4
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 text-white/70 text-sm">
        © {new Date().getFullYear()} Rabbit Quiz | {t("All Rights Reserved")}
      </div>
    </div>
  );
};

export default Home;
