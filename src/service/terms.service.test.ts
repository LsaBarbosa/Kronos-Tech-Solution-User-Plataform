import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import { acceptBiometricTerms, getBiometricTermStatus } from "./terms.service";

describe("terms.service", () => {
  it("interpreta status true do termo biométrico", async () => {
    server.use(
      http.get("*/terms/status", () => HttpResponse.json(true))
    );

    await expect(getBiometricTermStatus()).resolves.toEqual({
      accepted: true,
    });
  });

  it("interpreta status false do termo biométrico", async () => {
    server.use(
      http.get("*/terms/status", () => HttpResponse.json(false))
    );

    await expect(getBiometricTermStatus()).resolves.toEqual({
      accepted: false,
    });
  });

  it("aceita o termo biométrico e retorna o novo token", async () => {
    server.use(
      http.post("*/terms/accept-biometric", () =>
        HttpResponse.json({
          token: "new-token",
        })
      )
    );

    await expect(acceptBiometricTerms()).resolves.toEqual({
      accepted: true,
      token: "new-token",
    });
  });

  it("falha quando o aceite biométrico volta sem token", async () => {
    server.use(
      http.post("*/terms/accept-biometric", () => HttpResponse.json({}))
    );

    await expect(acceptBiometricTerms()).rejects.toThrow(
      "Resposta de aceite biométrico sem token."
    );
  });
});
