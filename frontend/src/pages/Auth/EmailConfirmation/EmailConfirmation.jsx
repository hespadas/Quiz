import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiPublic from "../../../services/apiPublic";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const confirmEmail = async (uidb64, token) => {
  try {
    const response = await apiPublic.get(
      `/accounts/confirm-email/${uidb64}/${token}/`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: "Unknown error" };
  }
};

const ConfirmEmail = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await confirmEmail(uidb64, token);
        setSuccess(true);
        toast.success(response.message);
        setTimeout(() => navigate("/login"), 5000); // Redirect to login after 5s
      } catch (error) {
        toast.error(error.error || t("Email confirmation failed."));
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [uidb64, token, navigate, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
          <h2 className="text-2xl font-bold text-white text-center">
            {t("Email Confirmation")}
          </h2>
        </div>

        <div className="p-8 text-center">
          <div className="mb-6">
            {loading ? (
              <svg
                className="animate-spin h-16 w-16 mx-auto text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : success ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {loading
              ? t("Confirming your email...")
              : success
              ? t("Email confirmed successfully!")
              : t("Email confirmation failed")}
          </h3>

          <p className="text-gray-600 mb-6">
            {loading
              ? t("Please wait while we verify your email address.")
              : success
              ? t(
                  "Your account is now active. You'll be redirected to the login page in a few seconds."
                )
              : t(
                  "We couldn't verify your email address. The confirmation link may be invalid or expired."
                )}
          </p>

          {!loading && (
            <div className="mt-6">
              <Link
                to="/login"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg
                  hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium inline-block"
              >
                {success ? t("Go to Login") : t("Back to Login")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmail;
