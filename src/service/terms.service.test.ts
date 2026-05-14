import { describe, it, expect, beforeEach, vi } from "vitest";
import * as termsService from "./terms.service";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

describe("terms.service", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe("checkBiometricTermsStatus", () => {
    it("retorna status aceito como true", async () => {
      server.use(
        http.get("*/terms/status", () => {
          return HttpResponse.json({ accepted: true });
        })
      );

      const result = await termsService.checkBiometricTermsStatus();
      expect(result).toEqual({ accepted: true });
    });

    it("retorna status aceito como false", async () => {
      server.use(
        http.get("*/terms/status", () => {
          return HttpResponse.json({ accepted: false });
        })
      );

      const result = await termsService.checkBiometricTermsStatus();
      expect(result).toEqual({ accepted: false });
    });
  });

  describe("acceptBiometricTerms", () => {
    it("chama endpoint de aceite com sucesso", async () => {
      server.use(
        http.post("*/terms/accept-biometric", () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(termsService.acceptBiometricTerms()).resolves.toBeUndefined();
    });
  });

  describe("revokeBiometricTerms", () => {
    it("chama endpoint de revogação com sucesso", async () => {
      server.use(
        http.delete("*/terms/revoke-biometric", () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(termsService.revokeBiometricTerms()).resolves.toBeUndefined();
    });
  });
});
