import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import apiPublic from "../../services/apiPublic";
import Home from "../../pages/Home/Home";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

jest.mock("../../services/apiPublic", () => ({
  get: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Home component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls /home/ endpoint on mount and displays main heading", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(apiPublic.get).toHaveBeenCalledWith("/home/");
    });

    expect(screen.getByText("Welcome to Rabbit Quiz")).toBeInTheDocument();
  });

  test("navigates when a button is clicked", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Join Game"));

    expect(mockNavigate).toHaveBeenCalledWith("/lobby/join/");
  });
});
