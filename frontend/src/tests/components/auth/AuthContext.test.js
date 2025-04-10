// AuthProvider.test.js
import React, { useEffect } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import {
  AuthContext,
  AuthProvider,
} from "../../../components/auth/AuthContext";
import authService from "../../../services/authService";

jest.mock("../../../services/authService");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const ConsumerComponent = () => {
  const { isAuth, user, setIsAuth } = React.useContext(AuthContext);

  useEffect(() => {
    if (!isAuth) {
      setIsAuth(true);
    }
  }, [isAuth, setIsAuth]);

  return (
    <div data-testid="consumer">
      {isAuth ? "Authenticated" : "Not Authenticated"} -{" "}
      {user ? user.name : "No User"}
    </div>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("exibe Loading inicialmente e renderiza os filhos após a inicialização", async () => {
    authService.getUserInfo.mockResolvedValue({ name: "John Doe" });

    render(
      <BrowserRouter>
        <AuthProvider>
          <div data-testid="child">Child Component</div>
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });

  test("navega para /login se a renovação do token falhar", async () => {
    jest.useFakeTimers();

    const futureTimestamp = Math.floor(Date.now() / 1000) + 6; // token expira em 6 segundos
    localStorage.setItem("access_token_exp", futureTimestamp.toString());

    authService.getUserInfo.mockResolvedValue({ name: "John Doe" });

    authService.refreshToken.mockRejectedValue(
      new Error("Refresh token error")
    );

    render(
      <BrowserRouter>
        <AuthProvider>
          <ConsumerComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("consumer")).toBeInTheDocument();
    });

    jest.advanceTimersByTime(1500); // tempo suficiente para disparar o timeout

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    jest.useRealTimers();
  });
});
