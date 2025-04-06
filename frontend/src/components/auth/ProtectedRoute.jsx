import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import authService from "../../services/authService";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = () => {
  const { isAuth, setIsAuth, user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        await authService.checkAuth();
        setIsAuth(true);
      } catch (error) {
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuth) {
      checkAuthentication();
    } else {
      setIsLoading(false);
    }
  }, [isAuth, setIsAuth]);

  return isAuth ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
