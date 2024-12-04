import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Navigation } from "../Navigation";
import { AuthContext } from "../../auth/AuthContext";

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

    expect(screen.getByText("home")).toBeInTheDocument();
    expect(screen.getByText("logout")).toBeInTheDocument();
    expect(screen.queryByText("login")).not.toBeInTheDocument();
    expect(screen.queryByText("register")).not.toBeInTheDocument();
  });

  test("renders Login and Register links when not authenticated", () => {
    renderWithRouterAndContext(<Navigation />, { isAuth: false });

    expect(screen.getByText("login")).toBeInTheDocument();
    expect(screen.getByText("register")).toBeInTheDocument();
    expect(screen.queryByText("home")).not.toBeInTheDocument();
    expect(screen.queryByText("logout")).not.toBeInTheDocument();
  });

  test("does not show Login link if already on the login page", () => {
    renderWithRouterAndContext(<Navigation />, {
      isAuth: false,
      route: "/login",
    });

    expect(screen.queryByText("login")).not.toBeInTheDocument();
    expect(screen.getByText("register")).toBeInTheDocument();
  });

  test("does not show Register link if already on the register page", () => {
    renderWithRouterAndContext(<Navigation />, {
      isAuth: false,
      route: "/register",
    });

    expect(screen.queryByText("register")).not.toBeInTheDocument();
    expect(screen.getByText("login")).toBeInTheDocument();
  });
});
