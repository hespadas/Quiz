import React, { useState, useEffect, useCallback } from "react";
import axios from "../../services/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const QuizForm = ({ initialData = null, isEdit = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialData ? initialData.title : "");
  const [description, setDescription] = useState(
    initialData ? initialData.description : ""
  );
  const [category, setCategory] = useState(
    initialData && initialData.category ? initialData.category : ""
  );
  const [questions, setQuestions] = useState(
    initialData ? initialData.questions : []
  );

  const [availableCategories, setAvailableCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddQuestion = useCallback(() => {
    setQuestions((prevQuestions) => [
      ...prevQuestions,
      {
        text: "",
        order: prevQuestions.length + 1,
        question_type: "MC",
        options: [
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ],
      },
    ]);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/categories/");
        setAvailableCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error(t("Error fetching categories"));
      }
    };
    fetchCategories();

    if (isEdit && (!questions || questions.length === 0)) {
      handleAddQuestion();
    }
  }, [isEdit, questions, handleAddQuestion, t]);

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    const updatedQuestions = [...questions];
    if (field === "is_correct" && value === true) {
      updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.map(
        (option, index) => ({
          ...option,
          is_correct: index === oIndex,
        })
      );
    } else {
      updatedQuestions[qIndex].options[oIndex][field] = value;
    }

    setQuestions(updatedQuestions);
  };

  const handleAddOption = (qIndex) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[qIndex].options.push({
        text: "",
        is_correct: false,
      });
      return updatedQuestions;
    });
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      if (updatedQuestions[qIndex].options.length > 2) {
        updatedQuestions[qIndex].options.splice(oIndex, 1);
      }
      return updatedQuestions;
    });
  };

  const handleRemoveQuestion = (qIndex) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions.splice(qIndex, 1);
      return updatedQuestions;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    for (let q of questions) {
      if (!q.options.some((option) => option.is_correct)) {
        toast.error(t("Each question must have at least one correct option."));
        setIsSubmitting(false);
        return;
      }
    }

    for (let q of questions) {
      const optionTexts = q.options.map((o) => o.text.trim().toLowerCase());
      const uniqueOptionTexts = new Set(optionTexts);
      if (uniqueOptionTexts.size !== optionTexts.length) {
        toast.error(t("Duplicate options found in a question."));
        setIsSubmitting(false);
        return;
      }
    }

    const quizData = {
      title,
      description,
      category_id: category !== "" ? Number(category) : null,
      questions: questions.map((q) => ({
        ...(q.id && { id: q.id }),
        text: q.text,
        order: q.order,
        question_type: q.question_type,
        options: q.options.map((o) => ({
          ...(o.id && { id: o.id }),
          text: o.text,
          is_correct: o.is_correct,
        })),
      })),
    };

    try {
      if (isEdit && initialData) {
        await axios.put(`/quiz/edit/${initialData.id}`, quizData);
        toast.success(t("Quiz updated successfully!"));
        navigate(`/quizzes/${initialData.id}/`);
      } else {
        await axios.post("/quizzes/create/", quizData);
        toast.success(t("Quiz created successfully!"));
        navigate("/quizzes");
      }
    } catch (error) {
      let errorMessage = t("Failed to submit quiz. Please check your inputs.");
      if (error.response && error.response.data) {
        const errors = error.response.data;
        errorMessage = JSON.stringify(errors);
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded">
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
          <h3 className="text-xl font-semibold mb-2">{t("Questions")}</h3>
          {questions.map((question, qIndex) => (
            <div
              key={qIndex}
              className="mb-4 p-4 border border-gray-200 rounded"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{`${t("Question")} ${
                  qIndex + 1
                }`}</h4>
                {isEdit && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="text-red-500"
                  >
                    {t("Remove Question")}
                  </button>
                )}
              </div>
              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  {t("Question Text")}
                </label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "text", e.target.value)
                  }
                  required
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>

              <div className="mb-2">
                <label className="block mb-1 font-medium">
                  {t("Question Type")}
                </label>
                <select
                  value={question.question_type}
                  onChange={(e) =>
                    handleQuestionChange(
                      qIndex,
                      "question_type",
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  <option value="MC">{t("Multiple Choice")}</option>
                  <option value="TF">{t("True/False")}</option>
                </select>
              </div>

              <div className="mb-2">
                <h4 className="font-medium">{t("Options")}</h4>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(
                          qIndex,
                          oIndex,
                          "text",
                          e.target.value
                        )
                      }
                      required
                      className="flex-1 border border-gray-300 p-2 rounded mr-2"
                      placeholder={`${t("Option")} ${oIndex + 1}`}
                    />
                    <label className="flex items-center mr-2">
                      <input
                        type="checkbox"
                        checked={option.is_correct}
                        onChange={(e) =>
                          handleOptionChange(
                            qIndex,
                            oIndex,
                            "is_correct",
                            e.target.checked
                          )
                        }
                        className="mr-1"
                      />
                      {t("Correct")}
                    </label>
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(qIndex, oIndex)}
                        className="text-red-500"
                      >
                        {t("Remove")}
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddOption(qIndex)}
                  className="mt-2 text-blue-500"
                >
                  {t("Add Option")}
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="mt-2 text-green-500"
          >
            {t("Add Question")}
          </button>
        </div>

        <div className="text-center">
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

export default QuizForm;
