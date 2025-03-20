import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const [message, setMessage] = useState("");
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
      setMessage(t("Passwords do not match"));
      return;
    }

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
        setMessage(t("User created successfully, confirm your email"));
        setTimeout(() => {
          navigate("/home");
        }, 2500);
      } else {
        const errorMessage = data.password2
          ? data.password2.join(" ")
          : JSON.stringify(data);
        setMessage(`${t("Error")}: ` + errorMessage);
      }
    } catch (error) {
      setMessage(`${t("Error")}: ${error.message || error.toString()}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
        onSubmit={handleSubmit}
      >
        <h3 className="text-2xl font-semibold text-center mb-6">
          {t("Register")}
        </h3>

        <div className="mb-4">
          <label htmlFor="username" className="block mb-2 text-gray-700">
            {t("Username")}
          </label>
          <input
            id="username"
            type="text"
            name="username"
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder={t("Username")}
            value={formData.username}
            required
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-gray-700">
            {t("Email")}
          </label>
          <input
            id="email"
            type="email"
            name="email"
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder={t("Email")}
            value={formData.email}
            required
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block mb-2 text-gray-700">
            {t("Password")}
          </label>
          <input
            id="password"
            type="password"
            name="password"
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder={t("Password")}
            value={formData.password}
            required
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password2" className="block mb-2 text-gray-700">
            {t("Confirm password")}
          </label>
          <input
            id="password2"
            type="password"
            name="password2"
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder={t("Confirm password")}
            value={formData.password2}
            required
            onChange={handleChange}
          />
        </div>

        {message && (
          <div
            className={`mb-4 text-center ${
              message.includes(t("Error")) ? "text-red-500" : "text-green-500"
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            {t("Submit")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
