import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatLgpdDate,
  getInitials,
  getSlaTone,
  getStatusLabel,
  getStatusTone,
  getTypeLabel,
  getTypeTone,
  isSensitiveType,
} from "../utils/lgpd-formatters";

describe("lgpd-formatters", () => {
  describe("getStatusTone / getStatusLabel", () => {
    it("returns canonical labels for each known status", () => {
      expect(getStatusLabel("OPEN")).toBe("Aberto");
      expect(getStatusLabel("IN_ANALYSIS")).toBe("Em análise");
      expect(getStatusLabel("WAITING_LEGAL_REVIEW")).toBe("Aguardando revisão legal");
      expect(getStatusLabel("APPROVED_FOR_EXPORT")).toBe("Aprovado para exportação");
      expect(getStatusLabel("COMPLETED")).toBe("Concluído");
      expect(getStatusLabel("REJECTED")).toBe("Rejeitado");
      expect(getStatusLabel("CANCELLED")).toBe("Cancelado");
    });

    it("echoes raw status for unknown values and — for empty", () => {
      expect(getStatusLabel("WHATEVER")).toBe("WHATEVER");
      expect(getStatusLabel(null)).toBe("—");
      expect(getStatusLabel(undefined)).toBe("—");
    });

    it("paints overdue-friendly tones (yellow/blue/red/green/neutral) per status", () => {
      expect(getStatusTone("OPEN").dot).toBe("bg-[#F59E0B]");
      expect(getStatusTone("IN_ANALYSIS").dot).toBe("bg-[#2563EB]");
      expect(getStatusTone("REJECTED").dot).toBe("bg-[#DC2626]");
      expect(getStatusTone("COMPLETED").dot).toBe("bg-[#16A34A]");
      expect(getStatusTone("CANCELLED").dot).toBe("bg-[#94A3B8]");
      expect(getStatusTone(undefined).dot).toBe("bg-[#94A3B8]");
    });
  });

  describe("getTypeTone / isSensitiveType / getTypeLabel", () => {
    it("flags ANONYMIZATION/DELETION/BLOCKING as sensitive (purple)", () => {
      expect(isSensitiveType("ANONYMIZATION")).toBe(true);
      expect(isSensitiveType("DELETION")).toBe(true);
      expect(isSensitiveType("BLOCKING")).toBe(true);
      expect(getTypeTone("ANONYMIZATION").kind).toBe("sensitive");
      expect(getTypeTone("ANONYMIZATION").dot).toBe("bg-[#7C3AED]");
    });

    it("flags consent/sharing types as privacy (teal)", () => {
      expect(getTypeTone("CONSENT_REVOCATION").kind).toBe("privacy");
      expect(getTypeTone("CONSENT_INFORMATION").kind).toBe("privacy");
      expect(getTypeTone("SHARING_INFORMATION").kind).toBe("privacy");
      expect(getTypeTone("CONSENT_REVOCATION").dot).toBe("bg-[#0D9488]");
    });

    it("uses standard tone for the remaining catalogued types", () => {
      expect(getTypeTone("ACCESS").kind).toBe("standard");
      expect(getTypeTone("CORRECTION").kind).toBe("standard");
      expect(isSensitiveType("ACCESS")).toBe(false);
    });

    it("resolves Portuguese labels for catalogued types and falls back to raw value", () => {
      expect(getTypeLabel("ACCESS")).toBe("Acesso aos meus dados");
      expect(getTypeLabel("ANONYMIZATION")).toBe("Anonimização");
      expect(getTypeLabel("UNKNOWN_TYPE")).toBe("UNKNOWN_TYPE");
      expect(getTypeLabel(null)).toBe("—");
    });
  });

  describe("formatLgpdDate", () => {
    it("formats valid ISO strings into dd/mm/yyyy pt-BR", () => {
      expect(formatLgpdDate("2026-06-01T18:20:35.123Z")).toBe("01/06/2026");
    });

    it("returns — for null/undefined/invalid", () => {
      expect(formatLgpdDate(null)).toBe("—");
      expect(formatLgpdDate(undefined)).toBe("—");
      expect(formatLgpdDate("invalid-date")).toBe("—");
    });
  });

  describe("getInitials", () => {
    it("uses first + last name initials when name is composed", () => {
      expect(getInitials("Bianca Ramos")).toBe("BR");
      expect(getInitials("Ana Maria Souza")).toBe("AS");
    });

    it("uses first two letters for single names and ? for empty", () => {
      expect(getInitials("Ana")).toBe("AN");
      expect(getInitials("")).toBe("?");
      expect(getInitials(null)).toBe("?");
    });
  });

  describe("getSlaTone", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-06-10T12:00:00Z"));
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns an overdue tone when isOverdue is true (red)", () => {
      const tone = getSlaTone("2026-06-01T00:00:00Z", true);
      expect(tone.isOverdue).toBe(true);
      expect(tone.label).toBe("Atraso");
      expect(tone.badge).toContain("text-[#B91C1C]");
    });

    it("returns OK when same day and not overdue", () => {
      const tone = getSlaTone("2026-06-10T08:00:00Z", false);
      expect(tone.isOverdue).toBe(false);
      expect(tone.label).toBe("OK");
      expect(tone.daysSinceCreation).toBe(0);
    });

    it("returns D+N when not overdue and N days elapsed", () => {
      const tone = getSlaTone("2026-06-05T08:00:00Z", false);
      expect(tone.isOverdue).toBe(false);
      expect(tone.label).toBe("D+5");
      expect(tone.daysSinceCreation).toBe(5);
    });

    it("falls back to zero days when createdAt is missing/invalid", () => {
      expect(getSlaTone(null, false).daysSinceCreation).toBe(0);
      expect(getSlaTone("invalid", false).daysSinceCreation).toBe(0);
    });
  });
});
