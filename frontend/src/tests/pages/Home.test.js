import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import apiPublic from "../../services/apiPublic";
import { useNavigate } from "react-router-dom";
import Home from "../../pages/Home/Home";

jest.mock("../../services/apiPublic", () => ({
  get: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key, // returns the translation key directly for testing
  }),
}));

describe("Home", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it("renders profile image and greeting", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByAltText("Profile")).toBeInTheDocument();
    expect(
      screen.getByText("Greeting, Welcome to the Quiz Platform")
    ).toBeInTheDocument();
  });

  it("renders all navigation buttons", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText("Join Game")).toBeInTheDocument();
    expect(screen.getByText("Create Game")).toBeInTheDocument();
    expect(screen.getByText("Create Quiz")).toBeInTheDocument();
    expect(screen.getByText("Edit Quiz")).toBeInTheDocument();
  });

  it("calls API on mount", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(apiPublic.get).toHaveBeenCalledWith("/home/");
    });
  });

  it("navigates to correct path when button is clicked", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Join Game"));
    expect(mockNavigate).toHaveBeenCalledWith("/lobby/join/");
  });
});
