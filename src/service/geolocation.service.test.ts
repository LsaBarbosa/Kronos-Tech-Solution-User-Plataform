import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveCompanyGeolocation } from "./geolocation.service";

describe("geolocation.service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falha quando o CEP é inválido", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ erro: true }),
    } as Response);

    await expect(
      resolveCompanyGeolocation("00000000", "10", "mock-key")
    ).rejects.toThrow("CEP não encontrado ou inválido.");
  });
});
