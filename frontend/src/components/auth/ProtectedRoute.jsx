import React, { useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import authService from "../../services/authService";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = () => {
  const { isAuth, setIsAuth } = useContext(AuthContext);

  useEffect(() => {
    const checkAuthentication = async () => {
      const tokenExp = localStorage.getItem("access_token_exp");
      if (tokenExp) {
        await authService.checkAuth();
        setIsAuth(true);
      }
    };
    if (!isAuth) {
      checkAuthentication();
    }
  }, [isAuth, setIsAuth]);

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
