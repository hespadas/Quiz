// src/services/__tests__/authService.test.js
import authService from "../../services/authService";
import axios from "../../services/axiosConfig";

jest.mock("../../services/axiosConfig");

describe("authService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("login - should return true when login is successful", async () => {
    axios.post.mockResolvedValueOnce({
      status: 200,
      data: {
        access_token_exp: Math.floor(Date.now() / 1000) + 5 * 60,
        access_token: "fake_access_token",
        refresh_token: "fake_refresh_token",
      },
    });

    const result = await authService.login("user", "password");

    expect(result).toBe(true);
    expect(axios.post).toHaveBeenCalledWith(
      "/auth/token/",
      { username: "user", password: "password" },
      { headers: { "Content-Type": "application/json" } }
    );
    expect(localStorage.getItem("access_token_exp")).toBeDefined();
  });

  test("login - should throw an error when login fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("Authentication error"));
    await expect(authService.login("user", "password")).rejects.toThrow(
      "Authentication error"
    );
  });

  test("checkAuth - should return authentication data when authenticated", async () => {
    const responseData = { isAuthenticated: true };
    axios.get.mockResolvedValueOnce({ data: responseData });
    const result = await authService.checkAuth();
    expect(result).toEqual(responseData);
    expect(axios.get).toHaveBeenCalledWith("/auth/check/");
  });

  test("checkAuth - should throw an error when authentication check fails", async () => {
    axios.get.mockRejectedValueOnce(
      new Error("Authentication verification failed")
    );
    await expect(authService.checkAuth()).rejects.toThrow(
      "Authentication verification failed"
    );
  });

  test("refreshToken - should return { status: 200 } when the token is refreshed successfully", async () => {
    axios.post.mockResolvedValueOnce({ status: 200 });
    const result = await authService.refreshToken();
    expect(result).toEqual({ status: 200 });
    expect(axios.post).toHaveBeenCalledWith("/auth/token/refresh/");
  });

  test("refreshToken - should throw an error when token refresh fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("Token refresh failed"));
    await expect(authService.refreshToken()).rejects.toThrow(
      "Token refresh failed"
    );
  });

  test("logout - should return true when logout is successful", async () => {
    axios.post.mockResolvedValueOnce({ status: 200 });
    const result = await authService.logout();
    expect(result).toBe(true);
    expect(axios.post).toHaveBeenCalledWith(
      "/auth/logout/",
      {},
      { withCredentials: true }
    );
  });

  test("logout - should throw an error when logout fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("logout Error"));
    await expect(authService.logout()).rejects.toThrow("logout Error");
  });
});
