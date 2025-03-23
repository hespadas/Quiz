import React, { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      // Se rota for pública, não tenta autenticar
      const publicPaths = [
        "/login",
        "/register",
        "/confirm-email",
        "/forgot-password",
        "/",
        "/lobby/join/",
      ];

      const isResetPassword = location.pathname.startsWith("/reset-password");
      if (publicPaths.includes(location.pathname) || isResetPassword) {
        setIsAuth(false);
        setUser(null);
        return;
      }

      try {
        await authService.checkAuth();
        setIsAuth(true);

        const response = await authService.getUserInfo();
        setUser(response);

        const accessTokenExp = localStorage.getItem("access_token_exp");
        if (accessTokenExp) {
          setTokenExpiry(parseInt(accessTokenExp) * 1000);
        }
      } catch (error) {
        setIsAuth(false);
        setUser(null);
        navigate("/login");
      }
    };

    initializeAuth();
  }, [location.pathname, navigate]);

  useEffect(() => {
    const renewTokenIfNecessary = async () => {
      try {
        const response = await authService.refreshToken();
        const accessToken = response.data.access_token;
        const accessTokenExp = response.data.access_token_exp;
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("access_token_exp", accessTokenExp);
        setTokenExpiry(accessTokenExp * 1000);
        setIsAuth(true);
      } catch (error) {
        setIsAuth(false);
        setUser(null);
        navigate("/login");
      }
    };

    if (isAuth && tokenExpiry) {
      const currentTime = new Date().getTime();
      const timeUntilExpiry = tokenExpiry - currentTime - 5 * 1000;

      const timeoutId = setTimeout(renewTokenIfNecessary, timeUntilExpiry);
      return () => clearTimeout(timeoutId);
    }
  }, [isAuth, tokenExpiry, navigate]);

  return (
    <AuthContext.Provider value={{ isAuth, user, setIsAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
