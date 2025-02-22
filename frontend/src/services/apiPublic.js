// src/services/apiPublic.js
import axios from "axios";

const apiPublic = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
});

export default apiPublic;
