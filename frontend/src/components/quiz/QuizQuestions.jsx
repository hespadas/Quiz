import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

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
      <h3 className="text-xl font-semibold mb-4 text-indigo-800">
        {t("Questions")}
      </h3>
      {questions.map((question, qIndex) => (
        <div
          key={qIndex}
          className="mb-6 p-5 border border-gray-200 rounded-lg shadow-sm bg-white/50 hover:bg-white/80 transition-all duration-200"
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-lg text-indigo-700">{`${t(
              "Question"
            )} ${qIndex + 1}`}</h4>
            <button
              type="button"
              onClick={() => handleRemoveQuestion(qIndex)}
              className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded-md px-2 py-1 transition-colors duration-200"
              aria-label={`${t("Remove Question")} ${qIndex + 1}`}
            >
              {t("Remove Question")}
            </button>
          </div>

          <label
            htmlFor={`question-text-${qIndex}`}
            className="block mb-1 font-medium text-gray-700"
          >
            {t("Question Text")}
          </label>
          <input
            id={`question-text-${qIndex}`}
            type="text"
            value={question.text}
            onChange={(e) =>
              handleQuestionChange(qIndex, "text", e.target.value)
            }
            required
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />

          <label
            htmlFor={`question-type-${qIndex}`}
            className="block mb-1 font-medium text-gray-700 mt-3"
          >
            {t("Question Type")}
          </label>
          <select
            id={`question-type-${qIndex}`}
            value={question.question_type}
            onChange={(e) =>
              handleQuestionChange(qIndex, "question_type", e.target.value)
            }
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          >
            <option value="MC">{t("Multiple Choice")}</option>
            <option value="TF">{t("True/False")}</option>
          </select>

          <h5 className="font-medium mt-4 mb-2 text-indigo-700">
            {t("Options")}
          </h5>
          <div className="space-y-3">
            {question.options.map((option, oIndex) => (
              <div key={oIndex} className="flex items-center gap-2">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) =>
                    handleOptionChange(qIndex, oIndex, "text", e.target.value)
                  }
                  required
                  className="flex-1 border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={`${t("Option")} ${oIndex + 1}`}
                  aria-label={`${t("Option")} ${oIndex + 1}`}
                />
                <label className="flex items-center whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={option.is_correct}
                    onChange={() =>
                      handleOptionChange(qIndex, oIndex, "is_correct", true)
                    }
                    className="mr-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    aria-label={`${t("Correct answer")}`}
                  />
                  {t("Correct")}
                </label>
                {question.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(qIndex, oIndex)}
                    className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
                    aria-label={`${t("Remove")} ${t("Option")} ${oIndex + 1}`}
                  >
                    {t("Remove")}
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => handleAddOption(qIndex)}
            className="mt-3 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            {t("Add Option")}
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddQuestion}
        className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
      >
        {t("Add Question")}
      </button>
    </div>
  );
};

QuizQuestions.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      text: PropTypes.string.isRequired,
      order: PropTypes.number,
      question_type: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number,
          text: PropTypes.string.isRequired,
          is_correct: PropTypes.bool.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  setQuestions: PropTypes.func.isRequired,
};

export default QuizQuestions;
