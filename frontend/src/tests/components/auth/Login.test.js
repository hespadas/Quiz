import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../../components/auth/AuthContext";

import authService from "../../../services/authService";
import { Login } from "../../../components/auth/Login";

jest.mock("../../../services/authService");

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

test("submits login form with correct credentials", async () => {
  authService.login.mockResolvedValueOnce(true);

  render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: "testuser" },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: "testpassword" },
  });

  fireEvent.click(screen.getByText(/submit/i));

  await waitFor(() =>
    expect(authService.login).toHaveBeenCalledWith("testuser", "testpassword")
  );
  expect(authService.login).toHaveBeenCalledTimes(1);
});

test("displays specific error message on login failure with detail", async () => {
  authService.login.mockRejectedValueOnce({
    response: { data: { detail: "Invalid user credentials" } },
  });

  render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: "wronguser" },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: "wrongpassword" },
  });
  fireEvent.click(screen.getByText(/submit/i));

  await screen.findByText("Invalid user credentials");
});

test("displays generic error message on login failure without detail", async () => {
  authService.login.mockRejectedValueOnce(new Error("Network Error"));

  render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: "wronguser" },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: "wrongpassword" },
  });
  fireEvent.click(screen.getByText(/submit/i));

  await screen.findByText(/invalid_credentials/i);
});
