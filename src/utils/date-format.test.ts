import { describe, expect, it } from "vitest";
import {
  dateToBackendDatePattern,
  ensureBackendDatePattern,
  toBackendDatePattern,
} from "./date-format";

describe("date-format", () => {
  it("preserva data ISO yyyy-MM-dd do backend", () => {
    expect(toBackendDatePattern("2026-04-30")).toBe("2026-04-30");
  });

  it("converte data do padrão dd-MM-yyyy para ISO yyyy-MM-dd", () => {
    expect(ensureBackendDatePattern("30-04-2026")).toBe("2026-04-30");
  });

  it("preserva data que já está no padrão ISO do backend", () => {
    expect(ensureBackendDatePattern("2026-04-30")).toBe("2026-04-30");
  });

  it("converte Date para o padrão ISO yyyy-MM-dd do backend sem depender de timezone UTC", () => {
    expect(dateToBackendDatePattern(new Date(2026, 3, 30))).toBe("2026-04-30");
  });

  it("rejeita strings inválidas", () => {
    expect(() => toBackendDatePattern("30/04/2026")).toThrow("Data inválida.");
    expect(() => toBackendDatePattern("2026/04/30")).toThrow("Data inválida.");
  });
});
