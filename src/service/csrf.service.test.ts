import { describe, it, expect, beforeEach, vi } from "vitest";
import { fetchCsrfToken, invalidateCsrfToken, getCachedCsrfToken } from "./csrf.service";
import { api } from "@/config/api";
import { HttpResponse, http } from "msw";
import { server } from "@/test/msw/server";

const MOCK_CSRF_TOKEN_RESPONSE = {
  headerName: "X-CSRF-TOKEN",
  parameterName: "_csrf",
  token: "test-csrf-token-123",
};

describe("CSRF Service", () => {
  beforeEach(() => {
    invalidateCsrfToken();
  });

  it("should fetch CSRF token from backend", async () => {
    server.use(
      http.get("*/auth/csrf", () => HttpResponse.json(MOCK_CSRF_TOKEN_RESPONSE))
    );

    const token = await fetchCsrfToken();
    expect(token.token).toBe("test-csrf-token-123");
    expect(token.headerName).toBe("X-CSRF-TOKEN");
    expect(token.parameterName).toBe("_csrf");
  });

  it("should cache CSRF token after first fetch", async () => {
    server.use(
      http.get("*/auth/csrf", () => HttpResponse.json(MOCK_CSRF_TOKEN_RESPONSE))
    );

    const token1 = await fetchCsrfToken();
    const token2 = await fetchCsrfToken();

    expect(token1).toBe(token2);
  });

  it("should return cached token without making another request", async () => {
    const fetchSpy = vi.spyOn(api, "get");
    server.use(
      http.get("*/auth/csrf", () => HttpResponse.json(MOCK_CSRF_TOKEN_RESPONSE))
    );

    await fetchCsrfToken();
    fetchSpy.mockClear();

    // Second call should use cache
    await fetchCsrfToken();
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it("should handle parallel fetch requests", async () => {
    server.use(
      http.get("*/auth/csrf", () => HttpResponse.json(MOCK_CSRF_TOKEN_RESPONSE))
    );

    const promise1 = fetchCsrfToken();
    const promise2 = fetchCsrfToken();

    const result1 = await promise1;
    const result2 = await promise2;

    expect(result1).toEqual(result2);
  });

  it("should invalidate cached token", async () => {
    server.use(
      http.get("*/auth/csrf", () => HttpResponse.json(MOCK_CSRF_TOKEN_RESPONSE))
    );

    await fetchCsrfToken();
    expect(getCachedCsrfToken()).not.toBeNull();

    invalidateCsrfToken();
    expect(getCachedCsrfToken()).toBeNull();
  });

  it("should get cached token without fetching", async () => {
    server.use(
      http.get("*/auth/csrf", () => HttpResponse.json(MOCK_CSRF_TOKEN_RESPONSE))
    );

    await fetchCsrfToken();
    const cached = getCachedCsrfToken();

    expect(cached).not.toBeNull();
    expect(cached?.token).toBe("test-csrf-token-123");
  });
});
