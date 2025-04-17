import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { useTranslation } from "react-i18next";

export function Navigation() {
  const { t } = useTranslation();
  const { isAuth, user } = useContext(AuthContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { path: "/", label: t("Home") },
    { path: "/create-quiz", label: t("Create Quiz") },
    { path: "/quizzes", label: t("Your Quizzes") },
    { path: "/lobby/join/", label: t("Join Game") },
    { path: "/lobby/create", label: t("Create Game") },
  ];

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/"
                className="text-white font-bold text-xl flex items-center"
              >
                <img src="/img/icon2.png" alt="Logo" className="h-8 w-8 mr-2" />
                Rabbit Quiz
              </Link>
            </div>

            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === link.path
                      ? "bg-purple-800 text-white"
                      : "text-indigo-100 hover:bg-indigo-700 hover:text-white transition-colors"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* User info and auth buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuth ? (
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-800 rounded-full px-3 py-1 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium truncate">
                    {user?.username || t("User")}
                  </span>
                </div>
                <Link
                  to="/logout"
                  className="bg-purple-800 hover:bg-purple-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {t("Logout")}
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {location.pathname !== "/login" && (
                  <Link
                    to="/login"
                    className="bg-indigo-800 hover:bg-indigo-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t("Login")}
                  </Link>
                )}
                {location.pathname !== "/register" && (
                  <Link
                    to="/register"
                    className="bg-purple-800 hover:bg-purple-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t("Register")}
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:text-white hover:bg-indigo-700 focus:outline-none"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">{t("Open main menu")}</span>
              {!mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-indigo-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuth &&
              navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? "bg-purple-800 text-white"
                      : "text-indigo-100 hover:bg-indigo-700 hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

            {isAuth ? (
              <div className="pt-4 pb-3 border-t border-indigo-700">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-indigo-300"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">
                      {user?.username || t("User")}
                    </div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    to="/logout"
                    className="block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("Logout")}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-indigo-700">
                {location.pathname !== "/login" && (
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("Login")}
                  </Link>
                )}
                {location.pathname !== "/register" && (
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("Register")}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
