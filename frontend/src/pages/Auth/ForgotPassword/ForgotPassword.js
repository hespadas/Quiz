// src/pages/Auth/ForgotPassword.js
import { useState } from "react";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import authService from "../../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.requestPasswordReset(email);
      toast.success(response.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.error || t("Password reset failed"));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h3 className="text-2xl font-semibold text-center mb-6">
          {t("Forgot password")}
        </h3>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-gray-700">
            {t("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder={t("Enter email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          {t("Reset password")}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
