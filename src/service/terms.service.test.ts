import { describe, it, expect, beforeEach, vi } from "vitest";
import * as termsService from "./terms.service";
import * as csrfService from "@/service/csrf.service";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

describe("terms.service", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe("checkTermsStatus", () => {
    it("retorna true quando o termo ja foi aceito", async () => {
      server.use(
        http.get("*/terms/status", () => {
          return HttpResponse.json({ accepted: true });
        })
      );

      await expect(termsService.checkTermsStatus()).resolves.toBe(true);
    });

    it("retorna false quando o termo esta pendente", async () => {
      server.use(
        http.get("*/terms/status", () => {
          return HttpResponse.json({ accepted: false });
        })
      );

      await expect(termsService.checkTermsStatus()).resolves.toBe(false);
    });
  });

  describe("acceptBiometricTerms", () => {
    it("chama endpoint de aceite e invalida cache de CSRF", async () => {
      const invalidateSpy = vi.spyOn(csrfService, "invalidateCsrfToken");
      let requestBody: unknown;

      server.use(
        http.get("*/auth/csrf", () =>
          HttpResponse.json({
            headerName: "X-CSRF-TOKEN",
            parameterName: "_csrf",
            token: "csrf-token",
          })
        ),
        http.post("*/terms/accept-biometric", async ({ request }) => {
          requestBody = await request.json();
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(
        termsService.acceptBiometricTerms({
          version: "2026.05.21",
          contentHashSha256: "current-hash",
        })
      ).resolves.toBeUndefined();
      expect(invalidateSpy).toHaveBeenCalled();
      expect(requestBody).toEqual({
        version: "2026.05.21",
        contentHashSha256: "current-hash",
      });
    });

    it("rejeita resposta inesperada do backend", async () => {
      server.use(
        http.get("*/auth/csrf", () =>
          HttpResponse.json({
            headerName: "X-CSRF-TOKEN",
            parameterName: "_csrf",
            token: "csrf-token",
          })
        ),
        http.post("*/terms/accept-biometric", () => HttpResponse.json({}, { status: 200 }))
      );

      await expect(
        termsService.acceptBiometricTerms({
          version: "2026.05.21",
          contentHashSha256: "current-hash",
        })
      ).rejects.toThrow(
        "Falha ao registrar o aceite do termo."
      );
    });
  });

  describe("getCurrentBiometricTerm", () => {
    it("retorna o termo biométrico atual servido pelo backend", async () => {
      server.use(
        http.get("*/terms/biometric/current", () =>
          HttpResponse.json({
            type: "BIOMETRIC_CONSENT_TERM",
            version: "2026.05.21",
            title: "Termo de Consentimento Biométrico",
            content: "Conteúdo do termo",
            contentHashSha256: "current-hash",
            active: true,
          })
        )
      );

      await expect(termsService.getCurrentBiometricTerm()).resolves.toEqual({
        type: "BIOMETRIC_CONSENT_TERM",
        version: "2026.05.21",
        title: "Termo de Consentimento Biométrico",
        content: "Conteúdo do termo",
        contentHashSha256: "current-hash",
        active: true,
      });
    });
  });

  describe("revokeBiometricTerms", () => {
    it("chama endpoint de revogacao e invalida cache de CSRF", async () => {
      const invalidateSpy = vi.spyOn(csrfService, "invalidateCsrfToken");

      server.use(
        http.get("*/auth/csrf", () =>
          HttpResponse.json({
            headerName: "X-CSRF-TOKEN",
            parameterName: "_csrf",
            token: "csrf-token",
          })
        ),
        http.delete("*/terms/revoke-biometric", () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(termsService.revokeBiometricTerms()).resolves.toBeUndefined();
      expect(invalidateSpy).toHaveBeenCalled();
    });

    it("rejeita resposta inesperada do backend na revogacao", async () => {
      server.use(
        http.get("*/auth/csrf", () =>
          HttpResponse.json({
            headerName: "X-CSRF-TOKEN",
            parameterName: "_csrf",
            token: "csrf-token",
          })
        ),
        http.delete("*/terms/revoke-biometric", () => HttpResponse.json({}, { status: 200 }))
      );

      await expect(termsService.revokeBiometricTerms()).rejects.toThrow(
        "Falha ao revogar o consentimento biométrico."
      );
    });
  });
});
