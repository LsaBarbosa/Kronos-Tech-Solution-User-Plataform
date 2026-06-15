import { describe, expect, it } from "vitest";
import type { VacationRequestResponse } from "@/types/vacation";
import {
  buildVacationViewModel,
  computeVacationSpan,
  formatVacationDate,
  formatVacationDateLong,
  formatVacationPeriod,
  getInitials,
  getVacationStatusLabel,
  getVacationStatusTone,
  isApprovedVacation,
  isPendingVacation,
  isRejectedVacation,
  parseVacationDate,
} from "./vacationApprovalFormatters";

describe("vacationApprovalFormatters", () => {
  describe("status predicates", () => {
    it("reconhece PENDING e seus aliases como pendente", () => {
      expect(isPendingVacation("REQUEST_VACATION")).toBe(true);
      expect(isPendingVacation("PENDING")).toBe(true);
      expect(isPendingVacation("PENDING_APPROVAL")).toBe(true);
      expect(isPendingVacation("  request_vacation  ")).toBe(true);
    });

    it("reconhece APPROVED e seu alias como aprovada", () => {
      expect(isApprovedVacation("VACATION")).toBe(true);
      expect(isApprovedVacation("APPROVED")).toBe(true);
      expect(isApprovedVacation("approved")).toBe(true);
    });

    it("reconhece REJECTED e seu alias como rejeitada", () => {
      expect(isRejectedVacation("VACATION_REJECTED")).toBe(true);
      expect(isRejectedVacation("REJECTED")).toBe(true);
    });

    it("trata valores nulos/undefined/desconhecidos como falsos", () => {
      expect(isPendingVacation(undefined)).toBe(false);
      expect(isPendingVacation(null)).toBe(false);
      expect(isPendingVacation("UNKNOWN")).toBe(false);
      expect(isApprovedVacation("")).toBe(false);
      expect(isRejectedVacation("DAY_OFF")).toBe(false);
    });
  });

  describe("getVacationStatusLabel", () => {
    it("retorna labels canonicas para cada categoria", () => {
      expect(getVacationStatusLabel("REQUEST_VACATION")).toBe("Aguardando aprovação");
      expect(getVacationStatusLabel("PENDING")).toBe("Aguardando aprovação");
      expect(getVacationStatusLabel("VACATION")).toBe("Aprovada");
      expect(getVacationStatusLabel("APPROVED")).toBe("Aprovada");
      expect(getVacationStatusLabel("VACATION_REJECTED")).toBe("Rejeitada");
      expect(getVacationStatusLabel("REJECTED")).toBe("Rejeitada");
    });

    it("ecoa o status bruto para valores desconhecidos e mostra — para vazios", () => {
      expect(getVacationStatusLabel("OTHER")).toBe("OTHER");
      expect(getVacationStatusLabel(null)).toBe("—");
      expect(getVacationStatusLabel(undefined)).toBe("—");
    });
  });

  describe("getVacationStatusTone", () => {
    it("aplica a paleta correta por status", () => {
      const pending = getVacationStatusTone("REQUEST_VACATION");
      const approved = getVacationStatusTone("VACATION");
      const rejected = getVacationStatusTone("REJECTED");
      const neutral = getVacationStatusTone("UNKNOWN");

      expect(pending.dotClass).toBe("bg-[#F59E0B]");
      expect(approved.dotClass).toBe("bg-[#16A34A]");
      expect(rejected.dotClass).toBe("bg-[#DC2626]");
      expect(neutral.dotClass).toBe("bg-[#94A3B8]");
      expect(pending.badgeClass).toContain("text-[#92400E]");
      expect(approved.badgeClass).toContain("text-[#15803D]");
      expect(rejected.badgeClass).toContain("text-[#B91C1C]");
      expect(neutral.badgeClass).toContain("text-[#475569]");
    });
  });

  describe("parseVacationDate", () => {
    it("aceita diferentes formatos de data", () => {
      expect(parseVacationDate("2026-03-10")?.getDate()).toBe(10);
      expect(parseVacationDate("10-03-2026")?.getDate()).toBe(10);
      expect(parseVacationDate("10/03/2026")?.getDate()).toBe(10);
      expect(parseVacationDate("2026/03/10")?.getDate()).toBe(10);
    });

    it("retorna null para valores invalidos ou ausentes", () => {
      expect(parseVacationDate(null)).toBeNull();
      expect(parseVacationDate(undefined)).toBeNull();
      expect(parseVacationDate("")).toBeNull();
      expect(parseVacationDate("nada-aqui")).toBeNull();
    });
  });

  describe("formatVacationDate / formatVacationDateLong / formatVacationPeriod", () => {
    it("formata datas no padrao curto pt-BR", () => {
      expect(formatVacationDate("2026-03-10")).toBe("10/03/2026");
    });

    it("formata datas no padrao longo pt-BR", () => {
      const longLabel = formatVacationDateLong("2026-03-10");
      expect(longLabel.toLowerCase()).toContain("março");
      expect(longLabel).toContain("2026");
    });

    it("formata periodo concatenando inicio e fim", () => {
      expect(formatVacationPeriod("2026-03-10", "2026-03-20")).toBe(
        "10/03/2026 → 20/03/2026"
      );
    });

    it("ecoa o valor original em caso de data invalida e usa — quando nulo", () => {
      expect(formatVacationDate("data-invalida")).toBe("data-invalida");
      expect(formatVacationDate(null)).toBe("—");
      expect(formatVacationDateLong(undefined)).toBe("—");
    });
  });

  describe("computeVacationSpan", () => {
    it("calcula totalDays inclusivo e weekendDays corretos", () => {
      const span = computeVacationSpan("2026-03-09", "2026-03-15");
      expect(span.totalDays).toBe(7);
      expect(span.weekendDays).toBe(2);
    });

    it("normaliza datas invertidas (fim antes do inicio)", () => {
      const span = computeVacationSpan("2026-03-15", "2026-03-09");
      expect(span.totalDays).toBe(7);
      expect(span.weekendDays).toBe(2);
    });

    it("retorna zeros quando alguma data e invalida", () => {
      expect(computeVacationSpan("", "2026-03-10")).toEqual({ totalDays: 0, weekendDays: 0 });
      expect(computeVacationSpan("2026-03-10", "data-invalida")).toEqual({
        totalDays: 0,
        weekendDays: 0,
      });
    });
  });

  describe("getInitials", () => {
    it("usa primeira e ultima letras de nomes compostos", () => {
      expect(getInitials("Ana Maria Souza")).toBe("AS");
    });

    it("usa as duas primeiras letras quando ha um unico nome", () => {
      expect(getInitials("Ana")).toBe("AN");
    });

    it("retorna ? quando o nome esta vazio ou nulo", () => {
      expect(getInitials("")).toBe("?");
      expect(getInitials(null)).toBe("?");
      expect(getInitials(undefined)).toBe("?");
    });
  });

  describe("buildVacationViewModel", () => {
    const baseRequest: VacationRequestResponse = {
      employeeId: "emp-1",
      employeeName: "Ana Souza",
      startDate: "2026-03-09",
      endDate: "2026-03-15",
      status: "REQUEST_VACATION",
      timeRecordIdsForApproval: [10, 11, 12],
    };

    it("monta view model completo para solicitacao pendente", () => {
      const vm = buildVacationViewModel(baseRequest);

      expect(vm.employeeName).toBe("Ana Souza");
      expect(vm.employeeId).toBe("emp-1");
      expect(vm.startDateLabel).toBe("09/03/2026");
      expect(vm.endDateLabel).toBe("15/03/2026");
      expect(vm.periodLabel).toBe("09/03/2026 → 15/03/2026");
      expect(vm.totalDays).toBe(7);
      expect(vm.weekendDays).toBe(2);
      expect(vm.recordsCount).toBe(3);
      expect(vm.recordIds).toEqual([10, 11, 12]);
      expect(vm.isPending).toBe(true);
      expect(vm.isApproved).toBe(false);
      expect(vm.isRejected).toBe(false);
      expect(vm.statusKind).toBe("pending");
      expect(vm.statusLabel).toBe("Aguardando aprovação");
      expect(vm.key).toBe("emp-1:2026-03-09:2026-03-15:10,11,12");
    });

    it("marca aprovada quando status e VACATION", () => {
      const vm = buildVacationViewModel({ ...baseRequest, status: "VACATION" });
      expect(vm.isApproved).toBe(true);
      expect(vm.statusKind).toBe("approved");
      expect(vm.statusLabel).toBe("Aprovada");
    });

    it("marca rejeitada quando status e VACATION_REJECTED", () => {
      const vm = buildVacationViewModel({ ...baseRequest, status: "VACATION_REJECTED" });
      expect(vm.isRejected).toBe(true);
      expect(vm.statusKind).toBe("rejected");
      expect(vm.statusLabel).toBe("Rejeitada");
    });

    it("usa fallback — para nome ausente", () => {
      const vm = buildVacationViewModel({
        ...baseRequest,
        employeeName: undefined as unknown as string,
      });
      expect(vm.employeeName).toBe("—");
    });
  });
});
