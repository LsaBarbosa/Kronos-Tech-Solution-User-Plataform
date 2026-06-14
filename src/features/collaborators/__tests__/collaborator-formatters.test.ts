import { describe, expect, it } from "vitest";
import type { CollaboratorRecord } from "../types/collaborator-view.types";
import {
  buildCollaboratorSummary,
  createCollaboratorEditorDraft,
  formatAddress,
  formatPhone,
  formatScheduleLabel,
  getAccountLabel,
  getBiometricLabel,
  getInitials,
} from "../utils/collaborator-formatters";

const collaboratorRecord: CollaboratorRecord = {
  employeeId: "emp-1",
  fullName: "Maria da Silva",
  maskedCpf: "123.456.789-01",
  email: "maria.silva@kronos.com",
  phone: "11999999999",
  salary: 5200,
  jobPosition: "Analista de RH",
  pis: "12345678901",
  username: "maria.silva",
  address: {
    street: "Rua das Flores",
    number: "42",
    postalCode: "01001000",
    city: "São Paulo",
    state: "SP",
  },
  companyId: "company-1",
  role: "MANAGER",
  active: true,
  homeOffice: false,
  workStartTime: "08:00",
  workEndTime: "17:00",
  breakStartTime: "12:00",
  breakEndTime: "13:00",
  scheduleType: "TRADITIONAL_5X2",
  scaleStartDate: "2026-01-01",
  preferredDayOff: "MONDAY",
  weekendOffIndex: 1,
  fixedWorkDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  userId: "user-1",
  hasAccount: true,
  enabled: true,
  accountLabel: "maria.silva",
  roleLabel: "Administrador",
  scheduleLabel: "Tradicional 5x2 (Seg-Sex) · 08:00 - 17:00 · Folga Seg",
  homeOfficeLabel: "Presencial",
  biometricState: "registered",
  biometricLabel: "Biometria cadastrada",
  biometricTone: "success",
  statusTone: "success",
  initials: "MS",
  detailSummary: "Administrador · Conta maria.silva · Acesso ativo",
};

describe("collaborator-formatters", () => {
  it("formatta telefone e iniciais", () => {
    expect(formatPhone("11999999999")).toBe("(11) 99999-9999");
    expect(getInitials("Maria da Silva")).toBe("MS");
  });

  it("cria rascunho e rótulos operacionais", () => {
    const draft = createCollaboratorEditorDraft(collaboratorRecord);

    expect(draft.fullName).toBe("Maria da Silva");
    expect(draft.username).toBe("maria.silva");
    expect(formatScheduleLabel(collaboratorRecord)).toContain("Tradicional 5x2");
    expect(getAccountLabel(true, "maria.silva")).toBe("maria.silva");
    expect(getBiometricLabel("pending")).toBe("Biometria pendente");
  });

  it("lida com endereço ausente sem quebrar a tela", () => {
    expect(formatAddress(undefined)).toBe("Endereço não informado");
    expect(createCollaboratorEditorDraft({
      ...collaboratorRecord,
      address: undefined as never,
    }).postalCode).toBe("");
  });

  it("resume a base de colaboradores", () => {
    const summary = buildCollaboratorSummary([collaboratorRecord]);

    expect(summary).toMatchObject({
      active: 1,
      inactive: 0,
      managers: 1,
      homeOffice: 0,
      noAccount: 0,
      biometricPending: 0,
    });
  });
});
