import { describe, it, expect, vi, beforeEach } from "vitest";
import * as service from "./public-privacy.service";
import { api } from "@/config/api";

vi.mock("@/config/api");

describe("PublicPrivacyService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPublicProcessingCatalog", () => {
    it("should call the correct endpoint without authentication", async () => {
      const mockData = {
        version: "2026.05.1",
        effectiveDate: "2026-05-27",
        activities: [
          {
            code: "COMPANY_REGISTRATION",
            title: "Cadastro de Empresa",
            description: "Test",
            dataCategories: [],
            purposes: [],
            legalBases: [],
            retentionPolicy: "Test",
            dataSubjectRights: [],
          },
        ],
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockData });

      const result = await service.getPublicProcessingCatalog();

      expect(api.get).toHaveBeenCalledWith("/public/privacy/processing-catalog");
      expect(result).toEqual(mockData);
    });

    it("should have activities in response", async () => {
      const mockData = {
        version: "2026.05.1",
        effectiveDate: "2026-05-27",
        activities: [],
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockData });

      const result = await service.getPublicProcessingCatalog();

      expect(result.activities).toBeDefined();
    });
  });

  describe("getPublicPrivacyPolicy", () => {
    it("should call the correct endpoint without authentication", async () => {
      const mockData = {
        version: "2026.05.1",
        effectiveDate: "2026-05-27",
        title: "Política de Privacidade",
        sections: [],
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockData });

      const result = await service.getPublicPrivacyPolicy();

      expect(api.get).toHaveBeenCalledWith("/public/privacy/policy");
      expect(result).toEqual(mockData);
    });

    it("should have sections in response", async () => {
      const mockData = {
        version: "2026.05.1",
        effectiveDate: "2026-05-27",
        title: "Política de Privacidade",
        sections: [
          {
            title: "Test Section",
            content: "Test content",
          },
        ],
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockData });

      const result = await service.getPublicPrivacyPolicy();

      expect(result.sections).toHaveLength(1);
    });
  });

  describe("getPublicBiometricTerm", () => {
    it("should call the correct endpoint without authentication", async () => {
      const mockData = {
        version: "2026.05.1",
        effectiveDate: "2026-05-27",
        title: "Termo de Biometria",
        sections: [],
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockData });

      const result = await service.getPublicBiometricTerm();

      expect(api.get).toHaveBeenCalledWith("/public/privacy/biometric-term");
      expect(result).toEqual(mockData);
    });

    it("should have sections in response", async () => {
      const mockData = {
        version: "2026.05.1",
        effectiveDate: "2026-05-27",
        title: "Termo de Biometria",
        sections: [
          {
            title: "O que é biometria",
            content: "Test",
          },
        ],
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockData });

      const result = await service.getPublicBiometricTerm();

      expect(result.sections).toHaveLength(1);
    });
  });

  describe("response validation", () => {
    it("responses should have version and effectiveDate", async () => {
      const mockData = {
        version: "2026.05.1",
        effectiveDate: "2026-05-27",
        activities: [],
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockData });

      const result = await service.getPublicProcessingCatalog();

      expect(result.version).toBeDefined();
      expect(result.effectiveDate).toBeDefined();
      expect(typeof result.version).toBe("string");
      expect(typeof result.effectiveDate).toBe("string");
    });
  });
});
