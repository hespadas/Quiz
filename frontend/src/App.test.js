import React from "react"; // Adicione esta linha
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders welcome message", () => {
  render(<App />);
  const welcomeMessage = screen.getByText(/greeting/i);
  expect(welcomeMessage).toBeInTheDocument();
});
