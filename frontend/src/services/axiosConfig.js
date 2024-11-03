// src/services/axiosConfig.js
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const csrfToken = localStorage.getItem("csrf_token");
  const accessToken = localStorage.getItem("access_token");

  if (csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return config;
});

export default api;
