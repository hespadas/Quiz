import "@testing-library/jest-dom";

// Mock de window.location
const mockWindowLocation = () => {
  const location = {
    ...window.location,
    assign: jest.fn(),
    reload: jest.fn(),
    replace: jest.fn(),
    origin: "http://localhost", // Defina um origin padrão
    href: "http://localhost/", // Defina um href padrão
  };

  delete window.location;
  window.location = location;
};

mockWindowLocation();
