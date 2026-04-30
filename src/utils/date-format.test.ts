import { describe, expect, it } from "vitest";
import {
  dateToBackendDatePattern,
  ensureBackendDatePattern,
  toBackendDatePattern,
} from "./date-format";

describe("date-format", () => {
  it("converte data ISO para o padrão dd-MM-yyyy do backend", () => {
    expect(toBackendDatePattern("2026-04-30")).toBe("30-04-2026");
  });

  it("preserva data que já está no padrão do backend", () => {
    expect(ensureBackendDatePattern("30-04-2026")).toBe("30-04-2026");
  });

  it("converte Date para o padrão do backend sem depender de timezone UTC", () => {
    expect(dateToBackendDatePattern(new Date(2026, 3, 30))).toBe("30-04-2026");
  });

  it("rejeita strings inválidas", () => {
    expect(() => toBackendDatePattern("30/04/2026")).toThrow("Data inválida.");
    expect(() => ensureBackendDatePattern("2026/04/30")).toThrow("Data inválida.");
  });
});
