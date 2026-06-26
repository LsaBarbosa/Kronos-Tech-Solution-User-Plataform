import { describe, it, expect, beforeEach, vi } from "vitest";
import { api } from "./api";
import { HttpResponse, http } from "msw";
import { server } from "@/test/msw/server";
import { invalidateCsrfToken } from "@/service/csrf.service";

const MOCK_CSRF_RESPONSE = {
  headerName: "X-CSRF-TOKEN",
  parameterName: "_csrf",
  token: "test-token-xyz",
};

describe("API Interceptor - CSRF Injection", () => {
  beforeEach(() => {
    invalidateCsrfToken();
  });

  it("should inject CSRF token in POST requests", async () => {
    let capturedRequest: any = null;

    server.use(
      http.get("*/auth/csrf", () => HttpResponse.json(MOCK_CSRF_RESPONSE)),
      http.post("*/test/mutation", async ({ request }) => {
        capturedRequest = {
          headers: Object.fromEntries(request.headers.entries()),
        };
        return HttpResponse.json({ success: true });
      })
    );

    await api.post("/test/mutation", { data: "test" });

    expect(capturedRequest?.headers["x-csrf-token"]).toBe("test-token-xyz");
  });

  it("should inject CSRF token in PATCH requests", async () => {
    let capturedRequest: any = null;

    server.use(
      http.get("*/auth/csrf", () => HttpResponse.json(MOCK_CSRF_RESPONSE)),
      http.patch("*/test/mutation", async ({ request }) => {
        capturedRequest = {
          headers: Object.fromEntries(request.headers.entries()),
        };
        return HttpResponse.json({ success: true });
      })
    );

    await api.patch("/test/mutation", { data: "test" });

    expect(capturedRequest?.headers["x-csrf-token"]).toBe("test-token-xyz");
  });

  it("should inject CSRF token in DELETE requests", async () => {
    let capturedRequest: any = null;

    server.use(
      http.get("*/auth/csrf", () => HttpResponse.json(MOCK_CSRF_RESPONSE)),
      http.delete("*/test/mutation", async ({ request }) => {
        capturedRequest = {
          headers: Object.fromEntries(request.headers.entries()),
        };
        return HttpResponse.json({ success: true });
      })
    );

    await api.delete("/test/mutation");

    expect(capturedRequest?.headers["x-csrf-token"]).toBe("test-token-xyz");
  });

  it("should inject CSRF token in PUT requests", async () => {
    let capturedRequest: any = null;

    server.use(
      http.get("*/auth/csrf", () => HttpResponse.json(MOCK_CSRF_RESPONSE)),
      http.put("*/test/mutation", async ({ request }) => {
        capturedRequest = {
          headers: Object.fromEntries(request.headers.entries()),
        };
        return HttpResponse.json({ success: true });
      })
    );

    await api.put("/test/mutation", { data: "test" });

    expect(capturedRequest?.headers["x-csrf-token"]).toBe("test-token-xyz");
  });

  it("should NOT inject CSRF in GET requests", async () => {
    let capturedRequest: any = null;

    server.use(
      http.get("*/test/query", async ({ request }) => {
        capturedRequest = {
          headers: Object.fromEntries(request.headers.entries()),
        };
        return HttpResponse.json({ success: true });
      })
    );

    await api.get("/test/query");

    expect(capturedRequest?.headers["x-csrf-token"]).toBeUndefined();
  });

  it("should NOT require CSRF for login endpoint", async () => {
    let csrfFetched = false;

    server.use(
      http.get("*/auth/csrf", () => {
        csrfFetched = true;
        return HttpResponse.json(MOCK_CSRF_RESPONSE);
      }),
      http.post("*/auth/login", () => HttpResponse.json({ success: true }, { status: 204 }))
    );

    await api.post("/auth/login", { username: "test", password: "test" });

    // CSRF should not be fetched for login
    expect(csrfFetched).toBe(false);
  });

  it("should NOT require CSRF for public terminal checkin endpoint", async () => {
    let csrfFetched = false;

    server.use(
      http.get("*/auth/csrf", () => {
        csrfFetched = true;
        return HttpResponse.json(MOCK_CSRF_RESPONSE);
      }),
      http.post("*/auth/checkin-face", () =>
        HttpResponse.json({
          loginMessage: "Login realizado com sucesso.",
          recordMessage: "Entrada às 08:01! (NSR: 123)",
          actionType: "CHECKIN",
          autoLogoutAfterSeconds: 10,
          recordedAt: "2026-06-26T08:01:00-03:00",
        })
      )
    );

    await api.post("/auth/checkin-face", {
      faceImageBase64: "imagem-base64",
      latitude: -22.9,
      longitude: -43.2,
    });

    expect(csrfFetched).toBe(false);
  });

  it("should require CSRF for logout endpoint", async () => {
    let csrfFetched = false;

    server.use(
      http.get("*/auth/csrf", () => {
        csrfFetched = true;
        return HttpResponse.json(MOCK_CSRF_RESPONSE);
      }),
      http.post("*/auth/logout", () => HttpResponse.json({ success: true }, { status: 204 }))
    );

    await api.post("/auth/logout");

    // Logout changes authenticated session state and must carry CSRF protection.
    expect(csrfFetched).toBe(true);
  });

  it("should require CSRF for authenticated geolocation resolve endpoint", async () => {
    let csrfFetched = false;

    server.use(
      http.get("*/auth/csrf", () => {
        csrfFetched = true;
        return HttpResponse.json(MOCK_CSRF_RESPONSE);
      }),
      http.post("*/geolocation/resolve", () => HttpResponse.json({ latitude: -23.5, longitude: -46.6 }))
    );

    await api.post("/geolocation/resolve", { postalCode: "01001000", number: "100" });

    expect(csrfFetched).toBe(true);
  });

  it("should send withCredentials for authenticated requests", async () => {
    server.use(
      http.post("*/test/auth-required", () => HttpResponse.json({ success: true }))
    );

    // Verify that the API is configured with withCredentials
    expect(api.defaults.withCredentials).toBe(true);
  });

  it("should include Correlation-Id header", async () => {
    let capturedRequest: any = null;

    server.use(
      http.get("*/test/query", async ({ request }) => {
        capturedRequest = {
          headers: Object.fromEntries(request.headers.entries()),
        };
        return HttpResponse.json({ success: true });
      })
    );

    await api.get("/test/query");

    expect(capturedRequest?.headers["x-correlation-id"]).toBeDefined();
  });

  it("should reject mutation when CSRF fetch fails", async () => {
    let mutationReached = false;

    server.use(
      http.get("*/auth/csrf", () => new HttpResponse(null, { status: 500 })),
      http.post("*/test/mutation", () => {
        mutationReached = true;
        return HttpResponse.json({ success: true });
      })
    );

    await expect(api.post("/test/mutation", { data: "test" })).rejects.toMatchObject({
      kind: "http",
      status: 500,
    });
    expect(mutationReached).toBe(false);
  });
});
