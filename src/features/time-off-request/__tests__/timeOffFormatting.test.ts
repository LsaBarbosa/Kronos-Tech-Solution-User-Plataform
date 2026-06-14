import { describe, expect, it } from "vitest";
import {
  formatTimeOffDate,
  formatTimeOffDurationLabel,
  formatTimeOffFileSize,
  formatTimeOffFileTypeLabel,
  formatTimeOffShortDate,
  formatTimeOffTypeDescription,
  formatTimeOffTypeLabel,
  getTimeOffPeriodSummary,
} from "../utils/timeOffFormatting";

describe("timeOffFormatting", () => {
  it("formats request type labels and descriptions", () => {
    expect(formatTimeOffTypeLabel("TIME_OFF_REQUEST")).toBe("Abono de horas");
    expect(formatTimeOffTypeLabel("FORGOTTEN_REGISTRATION")).toBe("Esquecimento de ponto");
    expect(formatTimeOffTypeDescription("TIME_OFF_REQUEST")).toContain("Atestado");
  });

  it("formats file size and type labels", () => {
    expect(formatTimeOffFileSize(512)).toBe("512 B");
    expect(formatTimeOffFileSize(1536)).toBe("1.5 KB");
    expect(formatTimeOffFileSize(2 * 1024 * 1024)).toBe("2.0 MB");

    expect(formatTimeOffFileTypeLabel(new File(["x"], "anexo.pdf", { type: "application/pdf" }))).toBe("PDF");
    expect(formatTimeOffFileTypeLabel(new File(["x"], "comprovante.png", { type: "image/png" }))).toBe("PNG");
  });

  it("summarizes the requested period", () => {
    const summary = getTimeOffPeriodSummary(new Date(2026, 0, 10), new Date(2026, 0, 12), "09:00", "18:00");

    expect(summary.startLabel).toBe(formatTimeOffDate(new Date(2026, 0, 10)));
    expect(summary.endLabel).toBe(formatTimeOffDate(new Date(2026, 0, 12)));
    expect(summary.periodLabel).toBe(`${formatTimeOffShortDate(new Date(2026, 0, 10))} → ${formatTimeOffShortDate(new Date(2026, 0, 12))}`);
    expect(summary.dayCount).toBe(3);
    expect(summary.isValid).toBe(true);
    expect(formatTimeOffDurationLabel(summary)).toBe("9h");
  });
});
