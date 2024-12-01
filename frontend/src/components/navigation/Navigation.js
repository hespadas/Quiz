import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { useTranslation } from "react-i18next";

export function Navigation() {
  const { t } = useTranslation();
  const { isAuth } = useContext(AuthContext);
  const location = useLocation();

  return (
    <div className="bg-gray-900 text-white">
      <nav className="container mx-auto flex justify-between items-center p-4">
        <div className="flex space-x-4">
          {isAuth && (
            <>
              <Link to="/" className="text-white hover:text-gray-400">
                {t("home")}
              </Link>
              <Link
                to="/create-quiz"
                className="text-white hover:text-gray-400"
              >
                {t("Create Quiz")}
              </Link>
              <Link to="/quizzes" className="text-white hover:text-gray-400">
                {t("Quiz List")}
              </Link>
              {/* New Menu Items */}
              <Link
                to="/game_rooms/create"
                className="text-white hover:text-gray-400"
              >
                {t("Create Game Room")}
              </Link>
              <Link
                to="/game_rooms/join"
                className="text-white hover:text-gray-400"
              >
                {t("Join Game Room")}
              </Link>
              <Link to="/lobby" className="text-white hover:text-gray-400">
                {t("Join Lobby")}
              </Link>
            </>
          )}
        </div>
        <div>
          {isAuth ? (
            <Link to="/logout" className="text-white hover:text-gray-400">
              {t("logout")}
            </Link>
          ) : (
            <>
              {location.pathname !== "/login" && (
                <Link to="/login" className="text-white hover:text-gray-400">
                  {t("login")}
                </Link>
              )}
              {location.pathname !== "/register" && (
                <Link to="/register" className="text-white hover:text-gray-400">
                  {t("register")}
                </Link>
              )}
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
