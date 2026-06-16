import { describe, expect, it } from "vitest";
import type { EmployeeData } from "@/types/employee";
import type { UserSearchListItem } from "@/types/user";
import { filterCollaborators, mergeCollaborators } from "../utils/collaborator-view.helpers";

const employees: EmployeeData[] = [
  {
    employeeId: "emp-1",
    fullName: "Maria da Silva",
    maskedCpf: "12345678901",
    email: "maria@kronos.com",
    phone: "11999999999",
    salary: 5200,
    jobPosition: "Analista",
    pis: "12345678901",
    address: {
      street: "Rua A",
      number: "10",
      postalCode: "01001000",
      city: "São Paulo",
      state: "SP",
    },
    companyId: "company-1",
    role: "PARTNER",
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
  },
  {
    employeeId: "emp-2",
    fullName: "João Pereira",
    maskedCpf: "98765432100",
    email: "joao@kronos.com",
    phone: "11988887777",
    salary: 4800,
    jobPosition: "Técnico",
    pis: "98765432100",
    address: {
      street: "Rua B",
      number: "20",
      postalCode: "02002000",
      city: "Campinas",
      state: "SP",
    },
    companyId: "company-1",
    active: false,
    homeOffice: true,
    scheduleType: "SIX_BY_ONE_FIXED",
  } as EmployeeData,
];

const users: UserSearchListItem[] = [
  {
    userId: "user-1",
    employeeId: "emp-1",
    username: "maria.silva",
    role: "MANAGER",
    active: true,
    biometricConsentAccepted: true,
  },
];

describe("collaborator-view.helpers", () => {
  it("mescla colaborador e usuario pelo employeeId e propaga biometricConsentAccepted", () => {
    const records = mergeCollaborators(employees, users);

    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({
      employeeId: "emp-1",
      userId: "user-1",
      username: "maria.silva",
      role: "MANAGER",
      hasAccount: true,
      active: true,
      biometricState: "registered",
    });
    expect(records[1]).toMatchObject({
      employeeId: "emp-2",
      userId: null,
      username: "",
      hasAccount: false,
      biometricState: "unknown",
    });
  });

  it("marca biometricState=pending quando o usuário existe mas biometricConsentAccepted=false", () => {
    const usersWithoutConsent: UserSearchListItem[] = [
      {
        userId: "user-1",
        employeeId: "emp-1",
        username: "maria.silva",
        role: "PARTNER",
        active: true,
        biometricConsentAccepted: false,
      },
    ];

    const records = mergeCollaborators(employees, usersWithoutConsent);

    expect(records[0]).toMatchObject({
      hasAccount: true,
      biometricState: "pending",
    });
  });

  it("filtra por PARTNER, MANAGER e Biometria", () => {
    const partnerEmployee: EmployeeData = {
      ...employees[0],
      employeeId: "emp-3",
      fullName: "Ana Lima",
      email: "ana@kronos.com",
      maskedCpf: "11122233300",
      pis: "11122233300",
    };
    const employeesExt = [...employees, partnerEmployee];
    const usersExt: UserSearchListItem[] = [
      {
        userId: "user-1",
        employeeId: "emp-1",
        username: "maria.silva",
        role: "MANAGER",
        active: true,
        biometricConsentAccepted: true,
      },
      {
        userId: "user-3",
        employeeId: "emp-3",
        username: "ana.lima",
        role: "PARTNER",
        active: true,
        biometricConsentAccepted: false,
      },
    ];
    const records = mergeCollaborators(employeesExt, usersExt);

    expect(filterCollaborators(records, { search: "", status: "all", group: "managers" }))
      .toHaveLength(1);
    expect(filterCollaborators(records, { search: "", status: "all", group: "partners" }))
      .toHaveLength(1);
    // Biometria: somente quem tem consentimento aceito (registered)
    expect(filterCollaborators(records, { search: "", status: "all", group: "biometric" }))
      .toHaveLength(1);
    // Busca por nome continua funcionando
    expect(filterCollaborators(records, { search: "maria", status: "all", group: "all" }))
      .toHaveLength(1);
    // Status preservado
    expect(filterCollaborators(records, { search: "", status: "inactive", group: "all" }))
      .toHaveLength(1);
  });

  it("não vincula usuário quando o backend retorna response sem employeeId", () => {
    const usersSemEmployeeId: UserSearchListItem[] = [
      {
        userId: "user-1",
        employeeId: undefined as unknown as string,
        username: "maria.silva",
        role: "MANAGER",
        active: true,
        biometricConsentAccepted: true,
      },
    ];

    const records = mergeCollaborators(employees, usersSemEmployeeId);

    // Sem employeeId no payload do backend o front não tem como linkar.
    // Regra "Não corrigir via comparação de nomes": match permanece estrito por employeeId.
    expect(records[0]).toMatchObject({
      employeeId: "emp-1",
      userId: null,
      hasAccount: false,
    });
  });
});
