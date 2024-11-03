import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import authService from "../../../services/authService";
import { AuthContext } from "../AuthContext";
import { Logout } from "../Logout";

jest.mock("../../../services/authService", () => ({
  logout: jest.fn(),
}));

describe("Logout Component", () => {
  it("should call authService.logout and redirect to /login", async () => {
    const setIsAuth = jest.fn();

    render(
      <AuthContext.Provider value={{ setIsAuth }}>
        <MemoryRouter>
          <Logout />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => expect(authService.logout).toHaveBeenCalled());
    await waitFor(() => expect(setIsAuth).toHaveBeenCalledWith(false));
  });
});
