import { describe, expect, it } from "vitest";
import type { RecordStatus, TimeRecordResponse } from "@/types/recordApproval";
import {
  buildApprovalViewModel,
  formatBackendDate,
  getInitials,
  getStatusTone,
  isApprovedStatus,
  isPendingStatus,
  isRejectedStatus,
} from "./timeOffApprovalFormatters";

const baseRecord: TimeRecordResponse = {
  timeRecordId: 1,
  startWork: "10/03/2026 08:00:00",
  startHour: "08:00",
  endWork: "10/03/2026 17:00:00",
  endHour: "17:00",
  hoursWork: "08:00",
  balance: "00:00",
  statusRecord: "TIME_OFF_REQUEST",
  edited: false,
  active: true,
  employeeId: "emp-1",
  employeeData: {
    employeeName: "Ana Souza",
    companyName: "Kronos",
  },
  documentId: null,
  documentDownloadUrl: null,
  documentDownloadPath: null,
};

describe("timeOffApprovalFormatters", () => {
  describe("status predicates", () => {
    it("classifica corretamente status pendentes", () => {
      expect(isPendingStatus("TIME_OFF_REQUEST")).toBe(true);
      expect(isPendingStatus("WORK_TIME_REQUEST")).toBe(true);
      expect(isPendingStatus("TIME_OFF")).toBe(false);
      expect(isPendingStatus(undefined)).toBe(false);
      expect(isPendingStatus(null)).toBe(false);
    });

    it("classifica corretamente status aprovados", () => {
      expect(isApprovedStatus("TIME_OFF")).toBe(true);
      expect(isApprovedStatus("UPDATED")).toBe(true);
      expect(isApprovedStatus("TIME_OFF_REQUEST")).toBe(false);
    });

    it("classifica corretamente status rejeitados", () => {
      expect(isRejectedStatus("TIME_OFF_REJECTED")).toBe(true);
      expect(isRejectedStatus("WORK_TIME_REJECTED")).toBe(true);
      expect(isRejectedStatus("UPDATE_REJECTED")).toBe(true);
      expect(isRejectedStatus("TIME_OFF")).toBe(false);
    });
  });

  describe("formatBackendDate", () => {
    it("formata data com hora para o padrao dd/MM/yy", () => {
      expect(formatBackendDate("10/03/2026 08:00:00")).toBe("10/03/26");
    });

    it("aceita separadores - e .", () => {
      expect(formatBackendDate("10-03-2026")).toBe("10/03/26");
      expect(formatBackendDate("10.03.2026")).toBe("10/03/26");
    });

    it("preserva anos curtos", () => {
      expect(formatBackendDate("10/03/26")).toBe("10/03/26");
    });

    it("retorna o valor original quando o formato e desconhecido e — quando ausente", () => {
      expect(formatBackendDate("nada")).toBe("nada");
      expect(formatBackendDate(null)).toBe("—");
      expect(formatBackendDate(undefined)).toBe("—");
    });
  });

  describe("getStatusTone", () => {
    it("aplica a paleta correta por status", () => {
      expect(getStatusTone("TIME_OFF_REQUEST").dotClass).toBe("bg-[#F59E0B]");
      expect(getStatusTone("TIME_OFF").dotClass).toBe("bg-[#16A34A]");
      expect(getStatusTone("TIME_OFF_REJECTED").dotClass).toBe("bg-[#DC2626]");
      expect(getStatusTone(undefined).dotClass).toBe("bg-[#94A3B8]");
    });
  });

  describe("buildApprovalViewModel", () => {
    it("monta view model para abono pendente (TIME_OFF_REQUEST)", () => {
      const vm = buildApprovalViewModel(baseRecord);

      expect(vm.employeeName).toBe("Ana Souza");
      expect(vm.companyName).toBe("Kronos");
      expect(vm.formattedStartDate).toBe("10/03/26");
      expect(vm.formattedEndDate).toBe("10/03/26");
      expect(vm.startHour).toBe("08:00");
      expect(vm.endHour).toBe("17:00");
      expect(vm.isPending).toBe(true);
      expect(vm.statusKind).toBe("pending");
      expect(vm.statusLabel).toBe("Abono pendente");
      expect(vm.kindLabel).toBe("Abono de horas");
      expect(vm.kindKey).toBe("time-off");
    });

    it("classifica esquecimento (WORK_TIME_REQUEST) como pendente do tipo work-time", () => {
      const vm = buildApprovalViewModel({
        ...baseRecord,
        statusRecord: "WORK_TIME_REQUEST",
      });
      expect(vm.kindKey).toBe("work-time");
      expect(vm.kindLabel).toBe("Esquecimento de ponto");
      expect(vm.statusLabel).toBe("Esquecimento pendente");
      expect(vm.statusKind).toBe("pending");
    });

    it("classifica ajuste UPDATED como aprovado do tipo update", () => {
      const vm = buildApprovalViewModel({
        ...baseRecord,
        statusRecord: "UPDATED",
      });
      expect(vm.kindKey).toBe("update");
      expect(vm.kindLabel).toBe("Ajuste de registro");
      expect(vm.statusLabel).toBe("Ajuste aprovado");
      expect(vm.isApproved).toBe(true);
      expect(vm.statusKind).toBe("approved");
    });

    it("classifica UPDATE_REJECTED como rejeitado", () => {
      const vm = buildApprovalViewModel({
        ...baseRecord,
        statusRecord: "UPDATE_REJECTED",
      });
      expect(vm.isRejected).toBe(true);
      expect(vm.statusKind).toBe("rejected");
      expect(vm.statusLabel).toBe("Ajuste rejeitado");
      expect(vm.kindKey).toBe("update");
    });

    it("classifica status desconhecido como other", () => {
      const vm = buildApprovalViewModel({
        ...baseRecord,
        statusRecord: "CREATED" as RecordStatus,
      });
      expect(vm.kindKey).toBe("other");
      expect(vm.kindLabel).toBe("Registro");
      expect(vm.statusKind).toBe("other");
      expect(vm.statusLabel).toBe("CREATED");
    });

    it("usa fallbacks — para nome e string vazia para empresa ausentes", () => {
      const vm = buildApprovalViewModel({
        ...baseRecord,
        employeeData: { employeeName: undefined as unknown as string, companyName: undefined as unknown as string },
      });
      expect(vm.employeeName).toBe("—");
      expect(vm.companyName).toBe("");
    });

    it("resolve documentId quando o campo direto esta presente", () => {
      const vm = buildApprovalViewModel({
        ...baseRecord,
        documentId: "doc-abc",
      });
      expect(vm.documentId).toBe("doc-abc");
    });

    it("resolve documentId a partir da URL legacy quando o campo direto e nulo", () => {
      const vm = buildApprovalViewModel({
        ...baseRecord,
        documentId: null,
        documentDownloadUrl: "http://kronos.local/documents/doc-from-url",
      });
      expect(vm.documentId).toBe("doc-from-url");
    });

    it("retorna documentId undefined quando nao ha nenhuma referencia", () => {
      const vm = buildApprovalViewModel({
        ...baseRecord,
        documentId: null,
        documentDownloadUrl: null,
        documentDownloadPath: null,
      });
      expect(vm.documentId).toBeUndefined();
    });
  });

  describe("getInitials", () => {
    it("usa primeira e ultima letras para nomes compostos", () => {
      expect(getInitials("Ana Maria Souza")).toBe("AS");
    });

    it("usa duas primeiras letras quando ha um unico nome", () => {
      expect(getInitials("Ana")).toBe("AN");
    });

    it("retorna ? para nome vazio", () => {
      expect(getInitials("")).toBe("?");
    });
  });
});
