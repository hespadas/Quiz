import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../../services/authService";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../../components/auth/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export const Login = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { isAuth, setIsAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuth) {
      navigate("/");
    }
  }, [isAuth, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await authService.login(username, password);
      setIsAuth(true);
      navigate("/");
    } catch (e) {
      if (e.response && e.response.data && e.response.data.detail) {
        toast.error(e.response.data.detail);
      } else {
        toast.error(t("Invalid credentials"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
          <h2 className="text-2xl font-bold text-white text-center">
            {t("Sign In")}
          </h2>
          <p className="text-indigo-100 text-sm text-center">
            {t("Welcome back to your quiz account")}
          </p>
        </div>

        <form onSubmit={submit} className="p-6">
          <div className="text-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("Username")}
            </label>
            <input
              id="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={t("Enter username")}
              name="username"
              type="text"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("Password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={t("Enter password")}
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg
              hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium
              ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {t("Signing in...")}
              </div>
            ) : (
              t("Sign In")
            )}
          </button>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              to="/forgot-password"
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
            >
              {t("Forgot password?")}
            </Link>
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
            >
              {t("Create an account")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
