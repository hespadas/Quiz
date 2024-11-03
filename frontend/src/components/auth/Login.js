import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import authService from "../../services/authService";
import { useTranslation } from "react-i18next";

export const Login = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { isAuth, setIsAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isAuth) {
      navigate("/");
    }
  }, [isAuth, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await authService.login(username, password);
      setIsAuth(true);
      navigate("/");
    } catch (e) {
      if (e.response && e.response.data && e.response.data.detail) {
        setErrorMessage(e.response.data.detail);
      } else {
        setErrorMessage(t("invalid_credentials"));
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
        onSubmit={submit}
      >
        <h3 className="text-2xl font-semibold text-center mb-6">
          {t("sign_in")}
        </h3>
        <div className="mb-4">
          <label htmlFor="username" className="block mb-2 text-gray-700">
            {t("username")}
          </label>
          <input
            id="username"
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder={t("enter_username")}
            name="username"
            type="text"
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-2 text-gray-700">
            {t("password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder={t("enter_password")}
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {errorMessage && (
          <div className="mb-4 text-red-500 text-center">{errorMessage}</div>
        )}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            {t("submit")}
          </button>
        </div>
      </form>
    </div>
  );
};
