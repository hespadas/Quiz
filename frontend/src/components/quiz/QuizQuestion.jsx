import React from "react";
import { useTranslation } from "react-i18next";

const QuizQuestions = ({ questions, setQuestions }) => {
  const { t } = useTranslation();

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) =>
        i === qIndex
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === oIndex
                  ? { ...opt, [field]: field === "is_correct" ? true : value }
                  : field === "is_correct"
                  ? { ...opt, is_correct: false }
                  : opt
              ),
            }
          : q
      )
    );
  };

  const handleAddOption = (qIndex) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) =>
        i === qIndex
          ? { ...q, options: [...q.options, { text: "", is_correct: false }] }
          : q
      )
    );
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.filter((_, j) => j !== oIndex) }
          : q
      )
    );
  };

  const handleAddQuestion = () => {
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
  };

  const handleRemoveQuestion = (qIndex) => {
    setQuestions((prevQuestions) =>
      prevQuestions
        .filter((_, i) => i !== qIndex)
        .map((q, i) => ({
          ...q,
          order: i + 1,
        }))
    );
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-2">{t("Questions")}</h3>
      {questions.map((question, qIndex) => (
        <div key={qIndex} className="mb-4 p-4 border border-gray-200 rounded">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">{`${t("Question")} ${qIndex + 1}`}</h4>
            <button
              type="button"
              onClick={() => handleRemoveQuestion(qIndex)}
              className="text-red-500"
            >
              {t("Remove Question")}
            </button>
          </div>

          <label className="block mb-1 font-medium">{t("Question Text")}</label>
          <input
            type="text"
            value={question.text}
            onChange={(e) =>
              handleQuestionChange(qIndex, "text", e.target.value)
            }
            required
            className="w-full border border-gray-300 p-2 rounded"
          />

          <label className="block mb-1 font-medium mt-2">
            {t("Question Type")}
          </label>
          <select
            value={question.question_type}
            onChange={(e) =>
              handleQuestionChange(qIndex, "question_type", e.target.value)
            }
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="MC">{t("Multiple Choice")}</option>
            <option value="TF">{t("True/False")}</option>
          </select>

          <h4 className="font-medium mt-2">{t("Options")}</h4>
          {question.options.map((option, oIndex) => (
            <div key={oIndex} className="flex items-center mb-2">
              <input
                type="text"
                value={option.text}
                onChange={(e) =>
                  handleOptionChange(qIndex, oIndex, "text", e.target.value)
                }
                required
                className="flex-1 border border-gray-300 p-2 rounded mr-2"
                placeholder={`${t("Option")} ${oIndex + 1}`}
              />
              <label className="flex items-center mr-2">
                <input
                  type="checkbox"
                  checked={option.is_correct}
                  onChange={() =>
                    handleOptionChange(qIndex, oIndex, "is_correct", true)
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
      ))}
      <button
        type="button"
        onClick={handleAddQuestion}
        className="mt-2 text-green-500"
      >
        {t("Add Question")}
      </button>
    </div>
  );
};

export default QuizQuestions;
