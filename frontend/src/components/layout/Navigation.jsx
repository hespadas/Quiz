import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { useTranslation } from "react-i18next";

export function Navigation() {
  const { t } = useTranslation();
  const { isAuth, user } = useContext(AuthContext);
  const location = useLocation();

  return (
    <div className="bg-gray-900 text-white">
      <nav className="container mx-auto flex justify-between items-center p-4">
        <div className="flex space-x-4 items-center">
          {isAuth && (
            <>
              {user && (
                <span className="text-sm font-semibold mr-4">
                  {t("Hello")}, {user.username}!
                </span>
              )}
              <Link to="/" className="text-white hover:text-gray-400">
                {t("Home")}
              </Link>
              <Link
                to="/create-quiz"
                className="text-white hover:text-gray-400"
              >
                {t("Create Quiz")}
              </Link>
              <Link to="/quizzes" className="text-white hover:text-gray-400">
                {t("Your Quizzes")}
              </Link>
              <Link
                to="/lobby/join/"
                className="text-white hover:text-gray-400"
              >
                {t("Join Game")}
              </Link>
              <Link
                to="/lobby/create"
                className="text-white hover:text-gray-400"
              >
                {t("Create Game")}
              </Link>
            </>
          )}
        </div>

        <div>
          {isAuth ? (
            <Link to="/logout" className="text-white hover:text-gray-400">
              {t("Logout")}
            </Link>
          ) : (
            <>
              {location.pathname !== "/login" && (
                <Link to="/login" className="text-white hover:text-gray-400">
                  {t("Login")}
                </Link>
              )}
              {location.pathname !== "/register" && (
                <Link to="/register" className="text-white hover:text-gray-400">
                  {t("Register")}
                </Link>
              )}
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
