import { describe, it, expect, beforeEach } from "vitest";
import * as termsService from "./terms.service";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

describe("terms.service", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe("checkTermsStatus", () => {
    it("retorna BiometricConsentStatus com accepted=true quando o termo ja foi aceito", async () => {
      server.use(
        http.get("*/terms/status", () => {
          return HttpResponse.json({
            biometricConsentAccepted: true,
            acceptedVersion: "2026.05.21",
            acceptedHash: "current-hash",
            currentVersion: "2026.05.21",
            currentHash: "current-hash",
            requiresNewAcceptance: false,
          });
        })
      );

      await expect(termsService.checkTermsStatus()).resolves.toEqual({
        biometricConsentAccepted: true,
        acceptedVersion: "2026.05.21",
        acceptedHash: "current-hash",
        currentVersion: "2026.05.21",
        currentHash: "current-hash",
        requiresNewAcceptance: false,
      });
    });

    it("retorna BiometricConsentStatus com accepted=false quando o termo esta pendente", async () => {
      server.use(
        http.get("*/terms/status", () => {
          return HttpResponse.json({
            biometricConsentAccepted: false,
            acceptedVersion: null,
            acceptedHash: null,
            currentVersion: "2026.05.21",
            currentHash: "current-hash",
            requiresNewAcceptance: true,
          });
        })
      );

      await expect(termsService.checkTermsStatus()).resolves.toEqual({
        biometricConsentAccepted: false,
        acceptedVersion: null,
        acceptedHash: null,
        currentVersion: "2026.05.21",
        currentHash: "current-hash",
        requiresNewAcceptance: true,
      });
    });

    it("trata erro de rede corretamente", async () => {
      server.use(
        http.get("*/terms/status", () => {
          return HttpResponse.json({ error: "Server error" }, { status: 500 });
        })
      );

      await expect(termsService.checkTermsStatus()).rejects.toThrow();
    });
  });

  describe("acceptBiometricTerms", () => {
    it("chama endpoint de aceite e retorna BiometricConsentStatus", async () => {
      let requestBody: unknown;

      server.use(
        http.post("*/terms/accept-biometric", async ({ request }) => {
          requestBody = await request.json();
          return HttpResponse.json({
            biometricConsentAccepted: true,
            acceptedVersion: "2026.05.21",
            acceptedHash: "current-hash",
            currentVersion: "2026.05.21",
            currentHash: "current-hash",
            requiresNewAcceptance: false,
          }, { status: 200 });
        })
      );

      await expect(
        termsService.acceptBiometricTerms({
          version: "2026.05.21",
          contentHashSha256: "current-hash",
        })
      ).resolves.toEqual({
        biometricConsentAccepted: true,
        acceptedVersion: "2026.05.21",
        acceptedHash: "current-hash",
        currentVersion: "2026.05.21",
        currentHash: "current-hash",
        requiresNewAcceptance: false,
      });
      expect(requestBody).toEqual({
        version: "2026.05.21",
        contentHashSha256: "current-hash",
      });
    });

    it("rejeita resposta com status de erro do backend", async () => {
      server.use(
        http.get("*/auth/csrf", () =>
          HttpResponse.json({
            headerName: "X-CSRF-TOKEN",
            parameterName: "_csrf",
            token: "csrf-token",
          })
        ),
        http.post("*/terms/accept-biometric", () => HttpResponse.json({ error: "Invalid request" }, { status: 400 }))
      );

      await expect(
        termsService.acceptBiometricTerms({
          version: "2026.05.21",
          contentHashSha256: "current-hash",
        })
      ).rejects.toThrow();
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
    it("chama endpoint de revogacao e retorna BiometricConsentStatus", async () => {
      server.use(
        http.delete("*/terms/revoke-biometric", () => {
          return HttpResponse.json({
            biometricConsentAccepted: false,
            acceptedVersion: null,
            acceptedHash: null,
            currentVersion: "2026.05.21",
            currentHash: "current-hash",
            requiresNewAcceptance: true,
          }, { status: 200 });
        })
      );

      await expect(termsService.revokeBiometricTerms()).resolves.toEqual({
        biometricConsentAccepted: false,
        acceptedVersion: null,
        acceptedHash: null,
        currentVersion: "2026.05.21",
        currentHash: "current-hash",
        requiresNewAcceptance: true,
      });
    });

    it("rejeita resposta com status de erro do backend na revogacao", async () => {
      server.use(
        http.get("*/auth/csrf", () =>
          HttpResponse.json({
            headerName: "X-CSRF-TOKEN",
            parameterName: "_csrf",
            token: "csrf-token",
          })
        ),
        http.delete("*/terms/revoke-biometric", () => HttpResponse.json({ error: "Invalid request" }, { status: 400 }))
      );

      await expect(termsService.revokeBiometricTerms()).rejects.toThrow();
    });
  });
});
