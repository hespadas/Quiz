import "@testing-library/jest-dom";

const mockWindowLocation = () => {
  const location = {
    ...window.location,
    assign: jest.fn(),
    reload: jest.fn(),
    replace: jest.fn(),
    origin: "http://localhost",
    href: "http://localhost/",
  };

  delete window.location;
  window.location = location;
};

mockWindowLocation();
