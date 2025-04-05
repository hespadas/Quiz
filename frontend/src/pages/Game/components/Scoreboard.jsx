import React from "react";
import { useTranslation } from "react-i18next";

const Scoreboard = ({ finalScores, host }) => {
  const { t } = useTranslation();

  const filteredScores = finalScores.filter((item) => item.username !== host);

  const sortedScores = [...filteredScores].sort((a, b) => b.score - a.score);

  return (
    <div className="p-6">
      <div className="mb-4 text-center">
        <div className="inline-block p-3 rounded-full bg-indigo-100 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-1">
          {t("Final Results")}
        </h2>
        <p className="text-gray-500">{t("See how everyone performed")}</p>
      </div>

      <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {sortedScores.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {sortedScores.map((item, index) => (
              <li
                key={item.username}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 
                    ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                        ? "bg-gray-200 text-gray-700"
                        : index === 2
                        ? "bg-amber-100 text-amber-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {index < 3 ? (
                      <span className="font-bold">{index + 1}</span>
                    ) : (
                      item.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="font-medium text-gray-800">
                    {item.username}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-indigo-600">
                    {item.score}
                  </span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-gray-500">{item.total}</span>
                  <div className="ml-3 w-16 bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full"
                      style={{ width: `${(item.score / item.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">{t("No scores available")}</p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg
            hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
        >
          {t("Return to Home")}
        </button>
      </div>
    </div>
  );
};

export default Scoreboard;
