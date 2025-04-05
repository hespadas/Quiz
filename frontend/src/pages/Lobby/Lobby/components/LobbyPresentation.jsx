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
      <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
          <h2 className="text-xl font-bold text-white text-center">
            {t("Loading Lobby")}
          </h2>
        </div>
        <div className="p-8 flex justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
          <h2 className="text-2xl font-bold text-white text-center">
            {t("Game Lobby")}
          </h2>
          <div className="flex justify-center mt-2">
            <span className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium">
              {t("Code")}: <span className="font-bold">{gameInfo.code}</span>
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {t("Connected Players")}
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <ul className="divide-y divide-gray-200">
                {connectedUsers.map((username) => (
                  <li
                    key={username}
                    className="py-3 px-2 flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <span className="font-medium text-indigo-800">
                          {username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-800 font-medium">
                        {username}
                      </span>
                    </div>
                    {username === hostUsername && (
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {t("Host")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {isHost && (
            <div className="flex justify-center mt-6">
              <button
                onClick={onStartGame}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg
                  shadow hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("Start Game")}
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            {!isHost && <p>{t("Waiting for host to start the game...")}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPresentation;
