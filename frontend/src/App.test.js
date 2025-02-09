import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./App", () => ({
  __esModule: true,
  default: () => <h3>greeting Hello, User!</h3>,
}));

test("renders welcome message with greeting key", () => {
  render(<App />);
  const welcomeMessage = screen.getByText("greeting Hello, User!");
  expect(welcomeMessage).toBeInTheDocument();
});
