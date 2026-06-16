import { describe, expect, it } from "vitest";
import {
  canRoleCancel,
  filterAdvancedTransitions,
  formatLgpdDate,
  formatLgpdDateTime,
  getInitials,
  getPrimaryAction,
  getShortRequestCode,
  getWorkflowSteps,
  isClosedStatus,
  isExportableType,
  isSensitiveType,
} from "../utils/lgpdCaseFormatters";

describe("lgpdCaseFormatters", () => {
  describe("isExportableType", () => {
    it("flags ACCESS / PORTABILITY / SHARING_INFORMATION / CONFIRM_PROCESSING as exportable", () => {
      expect(isExportableType("ACCESS")).toBe(true);
      expect(isExportableType("PORTABILITY")).toBe(true);
      expect(isExportableType("SHARING_INFORMATION")).toBe(true);
      expect(isExportableType("CONFIRM_PROCESSING")).toBe(true);
    });

    it("does not flag sensitive operations or null", () => {
      expect(isExportableType("ANONYMIZATION")).toBe(false);
      expect(isExportableType("DELETION")).toBe(false);
      expect(isExportableType("OPPOSITION")).toBe(false);
      expect(isExportableType(null)).toBe(false);
      expect(isExportableType(undefined)).toBe(false);
    });
  });

  describe("isClosedStatus", () => {
    it("recognises terminal statuses", () => {
      expect(isClosedStatus("COMPLETED")).toBe(true);
      expect(isClosedStatus("REJECTED")).toBe(true);
      expect(isClosedStatus("PARTIALLY_COMPLETED")).toBe(true);
      expect(isClosedStatus("CANCELLED")).toBe(true);
    });

    it("does not flag in-progress statuses or null", () => {
      expect(isClosedStatus("OPEN")).toBe(false);
      expect(isClosedStatus("IN_ANALYSIS")).toBe(false);
      expect(isClosedStatus(null)).toBe(false);
    });
  });

  describe("isSensitiveType", () => {
    it("flags ANONYMIZATION / DELETION / BLOCKING as sensitive", () => {
      expect(isSensitiveType("ANONYMIZATION")).toBe(true);
      expect(isSensitiveType("DELETION")).toBe(true);
      expect(isSensitiveType("BLOCKING")).toBe(true);
    });

    it("does not flag ACCESS or null", () => {
      expect(isSensitiveType("ACCESS")).toBe(false);
      expect(isSensitiveType(null)).toBe(false);
    });
  });

  describe("getPrimaryAction", () => {
    it("returns 'Iniciar análise' for OPEN regardless of type", () => {
      const action = getPrimaryAction("OPEN", "ACCESS");
      expect(action?.label).toBe("Iniciar análise");
      expect(action?.nextStatus).toBe("IN_ANALYSIS");
      expect(action?.requiresJustification).toBe(false);
    });

    it("returns 'Enviar para revisão do controlador' for IN_ANALYSIS", () => {
      expect(getPrimaryAction("IN_ANALYSIS", "ACCESS")?.label).toBe(
        "Enviar para revisão do controlador"
      );
    });

    it("returns 'Enviar para revisão legal' for WAITING_CONTROLLER", () => {
      expect(getPrimaryAction("WAITING_CONTROLLER", "ACCESS")?.label).toBe(
        "Enviar para revisão legal"
      );
    });

    it("returns 'Aprovar exportação' for WAITING_LEGAL_REVIEW with exportable type", () => {
      const action = getPrimaryAction("WAITING_LEGAL_REVIEW", "ACCESS");
      expect(action?.label).toBe("Aprovar exportação");
      expect(action?.nextStatus).toBe("APPROVED_FOR_EXPORT");
      expect(action?.requiresJustification).toBe(true);
    });

    it("returns 'Concluir solicitação' for WAITING_LEGAL_REVIEW with non-exportable type", () => {
      const action = getPrimaryAction("WAITING_LEGAL_REVIEW", "ANONYMIZATION");
      expect(action?.label).toBe("Concluir solicitação");
      expect(action?.nextStatus).toBe("COMPLETED");
    });

    it("returns null for terminal/awaiting statuses", () => {
      expect(getPrimaryAction("COMPLETED", "ACCESS")).toBeNull();
      expect(getPrimaryAction("REJECTED", "ACCESS")).toBeNull();
      expect(getPrimaryAction("APPROVED_FOR_EXPORT", "ACCESS")).toBeNull();
    });
  });

  describe("getWorkflowSteps", () => {
    it("uses the 6-step flow for exportable types", () => {
      const steps = getWorkflowSteps("WAITING_LEGAL_REVIEW", "ACCESS");
      expect(steps.map((s) => s.label)).toEqual([
        "Aberta",
        "Em análise",
        "Controlador",
        "Revisão legal",
        "Exportação",
        "Conclusão",
      ]);
      const current = steps.find((s) => s.current);
      expect(current?.label).toBe("Revisão legal");
      expect(steps.slice(0, 3).every((s) => s.completed)).toBe(true);
    });

    it("uses the 4-step simplified flow for non-exportable types", () => {
      const steps = getWorkflowSteps("IN_ANALYSIS", "ANONYMIZATION");
      expect(steps.map((s) => s.label)).toEqual([
        "Aberta",
        "Em análise",
        "Revisão",
        "Conclusão",
      ]);
      expect(steps.find((s) => s.current)?.label).toBe("Em análise");
    });
  });

  describe("canRoleCancel", () => {
    it("only allows CTO to cancel", () => {
      expect(canRoleCancel("CTO")).toBe(true);
      expect(canRoleCancel("MANAGER")).toBe(false);
      expect(canRoleCancel("PARTNER")).toBe(false);
      expect(canRoleCancel(null)).toBe(false);
    });
  });

  describe("filterAdvancedTransitions", () => {
    it("filters out CANCELLED for non-CTO roles", () => {
      expect(
        filterAdvancedTransitions(["IN_ANALYSIS", "REJECTED", "CANCELLED"], "MANAGER")
      ).toEqual(["IN_ANALYSIS", "REJECTED"]);
    });

    it("keeps CANCELLED for CTO", () => {
      expect(
        filterAdvancedTransitions(["IN_ANALYSIS", "REJECTED", "CANCELLED"], "CTO")
      ).toEqual(["IN_ANALYSIS", "REJECTED", "CANCELLED"]);
    });
  });

  describe("formatters", () => {
    it("formatLgpdDate returns dd/mm/yyyy pt-BR or — when invalid", () => {
      expect(formatLgpdDate("2026-06-15T08:00:00Z")).toBe("15/06/2026");
      expect(formatLgpdDate(null)).toBe("—");
      expect(formatLgpdDate("invalid")).toBe("—");
    });

    it("formatLgpdDateTime returns dd/mm/yyyy hh:mm pt-BR or — when invalid", () => {
      const result = formatLgpdDateTime("2026-06-15T08:30:00Z");
      expect(result).toMatch(/15\/06\/2026/);
      expect(formatLgpdDateTime(undefined)).toBe("—");
    });

    it("getInitials returns first+last for composed, two letters for single, ? for empty", () => {
      expect(getInitials("Mariana Costa")).toBe("MC");
      expect(getInitials("Ana")).toBe("AN");
      expect(getInitials("")).toBe("?");
    });

    it("getShortRequestCode returns first 8 chars in uppercase", () => {
      expect(getShortRequestCode("2a56db47-3817-44e7-9f92-f25aa8b745fa")).toBe("2A56DB47");
      expect(getShortRequestCode("")).toBe("—");
    });
  });
});
