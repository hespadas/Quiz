// LobbyPresentation.js
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
      <p className="text-center text-gray-500 mt-4">
        {t("Carregando lobby...")}
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded mt-10">
      <h2 className="text-2xl font-bold mb-4">
        {t("Código do Lobby")}:{" "}
        <span className="text-blue-600">{gameInfo.code}</span>
      </h2>
      <h3 className="text-xl font-semibold mb-2">
        {t("Usuários Conectados")}:
      </h3>
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
        <button
          onClick={onStartGame}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {t("Iniciar Jogo")}
        </button>
      )}
    </div>
  );
};

export default LobbyPresentation;
