import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import Register from "../../pages/Auth/Register/Register";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test("validates password mismatch", async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/^Username$/i), {
      target: { value: "testuser" },
    });

    fireEvent.change(screen.getByLabelText(/^Email$/i), {
      target: { value: "user@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText(/^Confirm password$/i), {
      target: { value: "password456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Passwords do not match")
    );
  });
  test("successful registration", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    jest.useFakeTimers();

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/^Username$/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/^Email$/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/^Confirm password$/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "User created successfully, confirm your email"
      )
    );

    jest.advanceTimersByTime(2500);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/home"));

    jest.useRealTimers();
  });

  test("handles API error gracefully", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        email: ["Email already exists"],
      }),
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/^Username$/i), {
      target: { value: "existinguser" },
    });

    fireEvent.change(screen.getByLabelText(/^Email$/i), {
      target: { value: "existing@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByLabelText(/^Confirm password$/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Email already exists")
    );
  });
});
