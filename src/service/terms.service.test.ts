import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import { acceptBiometricTerms, getBiometricTermStatus } from "./terms.service";

describe("terms.service", () => {
  it("consulta o status do termo biométrico", async () => {
    server.use(
      http.get("*/terms/status", () =>
        HttpResponse.json({
          accepted: false,
        })
      )
    );

    await expect(getBiometricTermStatus()).resolves.toEqual({
      accepted: false,
    });
  });

  it("aceita o termo biométrico", async () => {
    server.use(
      http.post("*/terms/accept-biometric", () =>
        HttpResponse.json({
          accepted: true,
          token: "new-token",
        })
      )
    );

    await expect(acceptBiometricTerms()).resolves.toEqual({
      accepted: true,
      token: "new-token",
    });
  });
});
