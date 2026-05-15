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

      server.use(
        http.get("*/auth/csrf", () =>
          HttpResponse.json({
            headerName: "X-CSRF-TOKEN",
            parameterName: "_csrf",
            token: "csrf-token",
          })
        ),
        http.post("*/terms/accept-biometric", () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(termsService.acceptBiometricTerms()).resolves.toBeUndefined();
      expect(invalidateSpy).toHaveBeenCalled();
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

      await expect(termsService.acceptBiometricTerms()).rejects.toThrow(
        "Falha ao registrar o aceite do termo."
      );
    });
  });
});
