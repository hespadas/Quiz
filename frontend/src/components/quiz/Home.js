import { useEffect, useState } from "react";
import axios from "../../services/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Home = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/home/");
        setMessage(data.message);
      } catch (e) {
        navigate("/login");
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <img
          src="/img/White_Rabbit_Alice_Wonderland.jpeg"
          alt="Profile"
          className="mt-4 mx-auto h-48 w-48 object-cover rounded-full shadow-lg"
        />
        <h3 className="text-2xl font-semibold">
          {t("greeting")} {message}
        </h3>
      </div>
    </div>
  );
};
