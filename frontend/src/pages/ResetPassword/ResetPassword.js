// src/pages/Auth/ResetPassword.js
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import authService from "../../services/authService";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t("Passwords do not match"));
      return;
    }

    try {
      const response = await authService.resetPassword(uidb64, token, password);
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
          {t("reset password")}
        </h3>

        <div className="mb-4">
          <label htmlFor="password" className="block mb-2 text-gray-700">
            {t("New password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder={t("Enter new password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block mb-2 text-gray-700">
            {t("Confirm new password")}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder={t("Enter new password again")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

export default ResetPassword;
