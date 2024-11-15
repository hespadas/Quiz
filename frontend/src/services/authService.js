import axios from "./axiosConfig";

const authService = {
  async login(username, password) {
    const user = { username, password };
    const response = await axios.post("/auth/token/", user, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const accessTokenExp = response.data.access_token_exp;
    localStorage.setItem("access_token_exp", accessTokenExp);
    return true;
  },

  async checkAuth() {
    try {
      const response = await axios.get("/auth/check/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async refreshToken() {
    try {
      return await axios.post("/auth/token/refresh/");
    } catch (error) {
      throw error;
    }
  },

  async getUserInfo() {
    try {
      const response = await axios.get("/user-info/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    await axios.post("/auth/logout/", {}, { withCredentials: true });
    return true;
  },
};

export default authService;
