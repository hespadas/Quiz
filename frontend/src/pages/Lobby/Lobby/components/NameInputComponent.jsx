import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const NameInputComponent = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  const handleChange = (e) => {
    setName(e.target.value);
    setTouched(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() !== "") {
      onSubmit(name.trim());
    }
  };

  const isInvalid = touched && name.trim() === "";

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6 rounded-t-xl">
        <h2 className="text-2xl font-bold text-white text-center">
          {t("Enter Your Name")}
        </h2>
        <p className="text-indigo-100 text-sm text-center">
          {t("Join the game with a unique username")}
        </p>
      </div>

      <div className="bg-white p-6 rounded-b-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("Username")}
            </label>
            <input
              id="username"
              type="text"
              value={name}
              onChange={handleChange}
              placeholder={t("Enter your name")}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all
                ${isInvalid ? "border-red-500" : "border-gray-300"}`}
            />
            {isInvalid && (
              <p className="text-red-500 text-sm mt-1">
                {t("Please enter a name")}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isInvalid}
            className={`w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium
              rounded-lg shadow hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200
              ${isInvalid ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {t("Join Game")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NameInputComponent;
