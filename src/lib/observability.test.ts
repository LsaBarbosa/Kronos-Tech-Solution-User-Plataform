import { afterEach, describe, expect, it, vi } from "vitest";
import { captureError, sanitizeObservabilityContext } from "./observability";

describe("observability", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("remove dados sensiveis do contexto", () => {
    expect(
      sanitizeObservabilityContext({
        operation: "download",
        token: "abc",
        nested: {
          email: "user@kronos.com",
          status: 503,
        },
      })
    ).toEqual({
      operation: "download",
      token: "[REDACTED]",
      nested: {
        email: "[REDACTED]",
        status: 503,
      },
    });
  });

  it("envia evento apenas quando observabilidade esta habilitada e endpoint existe", () => {
    vi.stubEnv("VITE_OBSERVABILITY_ENABLED", "true");
    vi.stubEnv("VITE_OBSERVABILITY_ENDPOINT", "https://obs.kronos.test/events");
    const sendBeacon = vi.fn();
    vi.stubGlobal("navigator", { sendBeacon });

    captureError(new Error("Falha controlada"), {
      domain: "api",
      token: "segredo",
      status: 503,
    });

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const [endpoint, blob] = sendBeacon.mock.calls[0];
    expect(endpoint).toBe("https://obs.kronos.test/events");
    expect(blob).toBeInstanceOf(Blob);
  });
});
