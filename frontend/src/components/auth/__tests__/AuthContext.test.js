// src/components/auth/__tests__/AuthContext.test.js

import React from "react";
import { render, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import authService from "../../../services/authService";
import { AuthContext, AuthProvider } from "../AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

jest.mock("../../../services/authService", () => ({
  checkAuth: jest.fn(),
  getUserInfo: jest.fn(),
  refreshToken: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

describe("AuthContext", () => {
  const mockNavigate = jest.fn();
  const mockLocation = { pathname: "/login" };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue(mockLocation);
  });

  it("sets isAuth to false if pathname is /login", async () => {
    let contextValue;

    render(
      <MemoryRouter>
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              contextValue = value;
              return null;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(contextValue.isAuth).toBe(false));
    expect(contextValue.user).toBe(null); // Ensure user is null
  });

  it("sets isAuth to false and redirects to /login if checkAuth fails", async () => {
    useLocation.mockReturnValue({ pathname: "/some-other-path" });
    authService.checkAuth.mockRejectedValueOnce(new Error("Auth error"));

    let contextValue;
    render(
      <MemoryRouter>
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              contextValue = value;
              return null;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(contextValue.isAuth).toBe(false));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
    expect(contextValue.user).toBe(null); // Ensure user is null
  });

  it("sets isAuth to false and redirects to /login if refreshToken fails", async () => {
    useLocation.mockReturnValue({ pathname: "/some-other-path" });
    authService.checkAuth.mockResolvedValueOnce(); // checkAuth succeeds
    authService.getUserInfo.mockResolvedValueOnce({
      // Mock getUserInfo
      username: "testuser",
      email: "testuser@example.com",
    });
    authService.refreshToken.mockRejectedValueOnce(
      new Error("Token refresh error")
    );

    let contextValue;
    jest.useFakeTimers();

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const accessTokenExp = currentTimeInSeconds + 60;
    localStorage.setItem("access_token_exp", accessTokenExp.toString());

    render(
      <MemoryRouter>
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              contextValue = value;
              return null;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(contextValue.isAuth).toBe(true));
    expect(contextValue.user).toEqual({
      username: "testuser",
      email: "testuser@example.com",
    });

    act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });

    await waitFor(() => expect(authService.refreshToken).toHaveBeenCalled());
    await waitFor(() => expect(contextValue.isAuth).toBe(false));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
    expect(contextValue.user).toBe(null); // Ensure user is null after failure

    jest.useRealTimers();
  });

  it("renews token near expiration", async () => {
    useLocation.mockReturnValue({ pathname: "/some-other-path" });
    authService.checkAuth.mockResolvedValueOnce(); // checkAuth succeeds
    authService.getUserInfo.mockResolvedValueOnce({
      username: "testuser",
      email: "testuser@example.com",
    });
    authService.refreshToken.mockResolvedValueOnce({
      data: { access_token_exp: Math.floor(Date.now() / 1000) + 60 },
    });

    let contextValue;
    jest.useFakeTimers();

    localStorage.setItem(
      "access_token_exp",
      (Math.floor(Date.now() / 1000) + 10).toString()
    );

    render(
      <MemoryRouter>
        <AuthProvider>
          <AuthContext.Consumer>
            {(value) => {
              contextValue = value;
              return null;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(contextValue.isAuth).toBe(true));
    expect(contextValue.user).toEqual({
      username: "testuser",
      email: "testuser@example.com",
    });
    act(() => {
      jest.advanceTimersByTime(5 * 1000);
    });
    await waitFor(() => expect(authService.refreshToken).toHaveBeenCalled());
    await waitFor(() =>
      expect(localStorage.getItem("access_token_exp")).toBeTruthy()
    );

    jest.useRealTimers();
  });
});
