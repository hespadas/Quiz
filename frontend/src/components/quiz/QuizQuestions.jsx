import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

const QuizQuestions = ({ questions, setQuestions }) => {
  const { t } = useTranslation();

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) => {
        if (i === index) {
          let updatedQuestion = { ...q, [field]: value };

          if (field === "question_type" && value === "TF") {
            updatedQuestion.options = [
              { text: "True", is_correct: true },
              { text: "False", is_correct: false },
            ];
          } else if (field === "question_type" && value === "MC") {
            updatedQuestion.options = [
              { text: "", is_correct: false },
              { text: "", is_correct: false },
            ];
          }

          return updatedQuestion;
        }
        return q;
      })
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
      {questions.map((question, qIndex) => {
        const isTF = question.question_type === "TF";
        return (
          <div
            key={qIndex}
            className="mb-4 border border-gray-200 rounded-lg overflow-hidden"
          >
            <details className="group">
              <summary className="bg-indigo-100 px-4 py-2 cursor-pointer font-medium text-indigo-800 group-open:bg-indigo-200 transition-colors duration-200">
                {t("Question")} {qIndex + 1}:{" "}
                {question.text || t("Untitled Question")}
              </summary>

              <div className="p-4 bg-white space-y-4">
                <label className="block font-medium text-gray-700">
                  {t("Question Text")}
                </label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "text", e.target.value)
                  }
                  required
                  className="w-full border border-gray-300 p-2 rounded-md"
                />

                <label className="block font-medium text-gray-700">
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
                  className="w-full border border-gray-300 p-2 rounded-md"
                >
                  <option value="MC">{t("Multiple Choice")}</option>
                  <option value="TF">{t("True/False")}</option>
                </select>

                <h5 className="text-indigo-700 font-medium mt-2">
                  {t("Options")}
                </h5>

                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={isTF ? t(option.text) : option.text}
                      onChange={(e) =>
                        handleOptionChange(
                          qIndex,
                          oIndex,
                          "text",
                          e.target.value
                        )
                      }
                      disabled={isTF}
                      required
                      className={`flex-1 border border-gray-300 p-2 rounded-md ${
                        isTF ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                    <label className="flex items-center">
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
                    {!isTF && question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(qIndex, oIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        {t("Remove")}
                      </button>
                    )}
                  </div>
                ))}

                {!isTF && (
                  <button
                    type="button"
                    onClick={() => handleAddOption(qIndex)}
                    className="mt-2 text-sm text-indigo-700 hover:underline"
                  >
                    {t("Add Option")}
                  </button>
                )}

                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    {t("Remove Question")}
                  </button>
                </div>
              </div>
            </details>
          </div>
        );
      })}
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
