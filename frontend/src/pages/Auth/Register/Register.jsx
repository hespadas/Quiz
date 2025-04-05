import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      toast.error(t("Passwords do not match"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/accounts/register/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(t("User created successfully, confirm your email"));
        setTimeout(() => {
          navigate("/home");
        }, 2500);
      } else {
        const errorMessage = data.password2
          ? data.password2.join(" ")
          : Object.values(data).flat().join(" ");
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error(`${t("Error")}: ${error.message || error.toString()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
          <h2 className="text-2xl font-bold text-white text-center">
            {t("Create an Account")}
          </h2>
          <p className="text-indigo-100 text-sm text-center">
            {t("Join our quiz community today")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
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
              type="text"
              name="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={t("Enter your username")}
              value={formData.username}
              required
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("Email")}
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={t("Enter your email")}
              value={formData.email}
              required
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("Password")}
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={t("Create a password")}
              value={formData.password}
              required
              onChange={handleChange}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password2"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("Confirm password")}
            </label>
            <input
              id="password2"
              type="password"
              name="password2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={t("Confirm your password")}
              value={formData.password2}
              required
              onChange={handleChange}
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
                {t("Processing...")}
              </div>
            ) : (
              t("Register")
            )}
          </button>

          <div className="mt-6 text-center text-gray-600 text-sm">
            {t("Already have an account?")}{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {t("Login here")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
