import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Home } from "../Home";
import axios from "../../../services/axiosConfig";
import { useNavigate } from "react-router-dom";

jest.mock("../../../services/axiosConfig");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe("Home Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it("Show message from API", async () => {
    const mockMessage = "Bem-vindo ao sistema!";
    axios.get.mockResolvedValueOnce({ data: { message: mockMessage } });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(`greeting ${mockMessage}`)).toBeInTheDocument();
    });
  });

  it("redirect to login after error", async () => {
    axios.get.mockRejectedValueOnce(new Error("Erro na API"));

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/login"));
  });
});
