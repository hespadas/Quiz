// src/services/__tests__/axiosConfig.test.js
import axios from "../axiosConfig";
import MockAdapter from "axios-mock-adapter";

describe("Axios Configuration", () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    localStorage.clear();
  });

  afterEach(() => {
    mock.reset();
  });

  test("should not intercept 401 error from excluded endpoints", async () => {
    mock
      .onPost("/auth/token/")
      .replyOnce(401, { detail: "Invalid credentials" });

    await expect(axios.post("/auth/token/")).rejects.toMatchObject({
      response: {
        status: 401,
        data: { detail: "Invalid credentials" },
      },
    });
  });

  test("should add CSRF token to request headers if present", async () => {
    localStorage.setItem("csrf_token", "test_csrf_token");

    mock.onGet("/test").reply((config) => {
      expect(config.headers["X-CSRF-Token"]).toBe("test_csrf_token");
      return [200, {}];
    });

    await axios.get("/test");
  });

  test("should add Authorization header if access token is present", async () => {
    localStorage.setItem("access_token", "test_access_token");

    mock.onGet("/test").reply((config) => {
      expect(config.headers["Authorization"]).toBe("Bearer test_access_token");
      return [200, {}];
    });
    await axios.get("/test");
  });
});
