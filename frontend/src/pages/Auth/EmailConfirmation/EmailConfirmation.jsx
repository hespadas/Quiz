import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiPublic from "../../../services/apiPublic";

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

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await confirmEmail(uidb64, token);
        toast.success(response.message);
        setTimeout(() => navigate("/login"), 3000); // Redireciona para login após 3s
      } catch (error) {
        toast.error(error.error || "Email confirmation failed.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [uidb64, token, navigate]);

  return (
    <div>
      <h2>Email Confirmation</h2>
      {loading ? <p>Confirming your email...</p> : <p>Redirecting...</p>}
    </div>
  );
};

export default ConfirmEmail;
