import React from "react";
import { useTranslation } from "react-i18next";

const Scoreboard = ({ finalScores, host }) => {
  const { t } = useTranslation();

  const filteredScores = finalScores.filter((item) => item.username !== host);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h2 className="text-3xl font-bold mb-6">{t("Score")}</h2>
      <ul className="w-full max-w-md bg-white rounded-lg shadow p-4 space-y-2">
        {filteredScores.map((item) => (
          <li
            key={item.username}
            className="flex justify-between p-2 border-b last:border-b-0"
          >
            <span className="font-medium text-gray-700">{item.username}:</span>
            <span className="text-blue-600">
              {item.score}/{item.total}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Scoreboard;
