import React from "react";

const LobbyPresentation = ({
  gameInfo,
  connectedUsers,
  hostUsername,
  isHost,
  onStartGame,
  t,
}) => {
  if (!gameInfo) {
    return (
      <p className="text-center text-gray-500 mt-4">{t("Loading lobby...")}</p>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-lg max-w-xl w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {t("Lobby code")}:{" "}
          <span className="text-blue-600">{gameInfo.code}</span>
        </h2>

        <h3 className="text-xl font-semibold mb-2">{t("Connected Users")}:</h3>
        <ul className="list-disc pl-5 mb-6">
          {connectedUsers.map((username) => (
            <li key={username} className="text-gray-800">
              {username}{" "}
              {username === hostUsername && (
                <span className="font-bold text-green-600">(Host)</span>
              )}
            </li>
          ))}
        </ul>

        {isHost && (
          <div className="text-center">
            <button
              onClick={onStartGame}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {t("Game Start")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyPresentation;
