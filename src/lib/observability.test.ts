import { afterEach, describe, expect, it, vi } from "vitest";

describe("observability", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("mantem apenas chaves permitidas e redacta campos sensiveis", async () => {
    const { sanitizeObservabilityContext } = await import("./observability");
    expect(
      sanitizeObservabilityContext({
        domain: "api",
        operation: "http_failure",
        status: 503,
        token: "abc",
        email: "user@kronos.com",
        ignored: "value",
      })
    ).toEqual({
      domain: "api",
      operation: "http_failure",
      status: 503,
      token: "[REDACTED]",
      email: "[REDACTED]",
    });
  });

  it("envia payload sanitizado quando observabilidade esta habilitada", async () => {
    vi.stubEnv("VITE_OBSERVABILITY_ENABLED", "true");
    vi.stubEnv("VITE_OBSERVABILITY_ENDPOINT", "https://obs.kronos.test/observability/frontend/events");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("navigator", {});
    vi.stubGlobal("window", {
      location: {
        pathname: "/dashboard",
        search: "",
        hash: "",
      },
    });
    vi.stubGlobal("crypto", {
      randomUUID: () => "corr-id-123",
    });

    const { captureError } = await import("./observability");

    captureError(new Error("Falha controlada"), {
      domain: "api",
      operation: "http_failure",
      status: 503,
      token: "segredo",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(endpoint).toBe("https://obs.kronos.test/observability/frontend/events");
    const payload = JSON.parse(String(requestInit.body));
    expect(payload).toMatchObject({
      eventType: "http_failure",
      category: "api",
      result: "failure",
      route: "/dashboard",
      correlationId: "corr-id-123",
    });
    expect(payload.message).toContain("Falha controlada");
  });
});
