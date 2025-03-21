// src/components/quiz/QuizBasicForm.js

import React, { useState, useEffect } from "react";
import axios from "../../services/axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const QuizBasicForm = ({ initialData = null, isEdit = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialData ? initialData.title : "");
  const [description, setDescription] = useState(
    initialData ? initialData.description : ""
  );
  const [category, setCategory] = useState(
    initialData && initialData.category ? initialData.category : ""
  );
  const [imagem, setImage] = useState(initialData ? initialData.imagem : null);
  const [imagePreview, setImagePreview] = useState(
    initialData ? initialData.image : null
  );
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/categories/");
        setAvailableCategories(response.data);
      } catch (error) {
        toast.error(t("Error fetching categories"));
      }
    };
    fetchCategories();
  }, [t]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category_id", category !== "" ? Number(category) : "");
    if (imagem) {
      formData.append("imagem", imagem);
    }

    try {
      if (isEdit && initialData) {
        await axios.put(`/quiz/edit/${initialData.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(t("Quiz updated successfully!"));
        navigate(`/quiz/${initialData.id}/edit-questions`);
      } else {
        const response = await axios.post("/quizzes/create/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(t("Quiz created successfully!"));
        navigate(`/quiz/${response.data.id}/edit-questions`);
      }
    } catch (error) {
      let errorMessage = t("Failed to submit quiz. Please check your inputs.");
      if (error.response && error.response.data) {
        errorMessage = JSON.stringify(error.response.data);
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white/80 backdrop-blur-sm shadow-md rounded items-center">
      <h2 className="text-2xl font-semibold mb-4">
        {isEdit ? t("Edit Quiz") : t("Create New Quiz")}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block mb-2 font-medium">{t("Title")}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">{t("Description")}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">{t("Category")}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="">{t("Select Category")}</option>
            {availableCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">{t("Image")}</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-2 h-48 object-cover"
            />
          )}
        </div>

        <div className="flex justify-between items-center">
          {isEdit && initialData && (
            <Link
              to={`/quiz/${initialData.id}/edit-questions`}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {t("Edit Questions")}
            </Link>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isEdit ? t("Update Quiz") : t("Create Quiz")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizBasicForm;
