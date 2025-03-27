import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { AuthContext } from "../../../components/auth/AuthContext";
import { Navigation } from "../../../components/layout/Navigation";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

function renderWithRouterAndContext(ui, { route = "/", isAuth = false } = {}) {
  window.history.pushState({}, "Test page", route);

  return render(
    <AuthContext.Provider value={{ isAuth }}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="*" element={ui} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("Navigation component", () => {
  test("renders Home and Logout links when authenticated", () => {
    renderWithRouterAndContext(<Navigation />, { isAuth: true });

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
    expect(screen.queryByText("Register")).not.toBeInTheDocument();
  });

  test("renders Login and Register links when not authenticated", () => {
    renderWithRouterAndContext(<Navigation />, { isAuth: false });

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  test("does not show Login link if already on the login page", () => {
    renderWithRouterAndContext(<Navigation />, {
      isAuth: false,
      route: "/login",
    });

    expect(screen.queryByText("Login")).not.toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  test("does not show Register link if already on the register page", () => {
    renderWithRouterAndContext(<Navigation />, {
      isAuth: false,
      route: "/register",
    });

    expect(screen.queryByText("Register")).not.toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});
