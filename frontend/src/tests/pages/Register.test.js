import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "../../pages/Register/Register";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

global.fetch = jest.fn();

describe("Register component", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("renders register form and submits successfully", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "User created successfully" }),
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("password"), {
      target: { value: "!Password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("confirm password"), {
      target: { value: "!Password123" },
    });

    fireEvent.click(screen.getByText("submit"));

    await screen.findByText("User created");
  });

  test("displays error message on failed registration", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "User already exists" }),
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("username"), {
      target: { value: "existinguser" },
    });
    fireEvent.change(screen.getByPlaceholderText("email"), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("confirm password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("submit"));

    await screen.findByText(/error/);
  });

  test("displays error when passwords do not match", async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("username"), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("email"), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("confirm password"), {
      target: { value: "differentpassword" },
    });

    fireEvent.click(screen.getByText("submit"));

    await screen.findByText("passwords do not match");
  });

  test("displays error message when error lacks message property", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("username"), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("email"), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("confirm password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("submit"));

    const errorElement = await screen.findByText(
      (content, element) =>
        content.includes("error") ||
        element?.classList.contains("error-message")
    );

    expect(errorElement).toBeInTheDocument();
  });

  test("displays error message when fetch fails", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("username"), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("email"), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("confirm password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("submit"));

    await screen.findByText(/error: Network error/);
  });
});
