import React, { useState } from "react";

const NameInputComponent = ({ onSubmit }) => {
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Digite seu nome
        </h2>
        <input
          type="text"
          value={name}
          onChange={handleChange}
          placeholder="Seu nome"
          className={`w-full px-4 py-2 border rounded ${
            isInvalid ? "border-red-500" : "border-gray-300"
          }`}
        />
        {isInvalid && (
          <p className="text-red-500 text-sm mt-1">
            Por favor, digite um nome.
          </p>
        )}
        <button
          type="submit"
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default NameInputComponent;
