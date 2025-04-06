import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import authService from "../../services/authService";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = () => {
  const { isAuth, setIsAuth } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [checkComplete, setCheckComplete] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const tokenExp = localStorage.getItem("access_token_exp");
        const currentTime = Math.floor(Date.now() / 1000);

        if (tokenExp && parseInt(tokenExp, 10) > currentTime) {
          await authService.checkAuth();
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      } catch (error) {
        setIsAuth(false);
      } finally {
        setIsLoading(false);
        setCheckComplete(true);
      }
    };

    if (!isAuth) {
      checkAuthentication();
    } else {
      setIsLoading(false);
      setCheckComplete(true);
    }
  }, [isAuth, setIsAuth]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    checkComplete && (isAuth ? <Outlet /> : <Navigate to="/login" replace />)
  );
};

export default ProtectedRoute;
