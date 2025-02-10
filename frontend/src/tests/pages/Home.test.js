import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "../../services/axiosConfig";

import { useNavigate } from "react-router-dom";
import Home from "../../pages/Home/Home";

jest.mock("../../services/axiosConfig");
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
