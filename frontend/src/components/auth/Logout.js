// src/component/Logout.js
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import authService from "../../services/authService";

export const Logout = () => {
  const navigate = useNavigate();
  const { setIsAuth } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      await authService.logout();
      setIsAuth(false);
      navigate("/login");
    })();
  }, [navigate, setIsAuth]);
};
