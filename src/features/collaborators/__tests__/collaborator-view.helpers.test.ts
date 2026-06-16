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
  },
];

describe("collaborator-view.helpers", () => {
  it("mescla colaborador e usuario pelo employeeId", () => {
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
      biometricState: "pending",
    });
  });

  it("filtra por status, grupo e busca", () => {
    const records = mergeCollaborators(employees, users);

    expect(filterCollaborators(records, { search: "maria", status: "all", group: "all" })).toHaveLength(1);
    expect(filterCollaborators(records, { search: "", status: "inactive", group: "all" })).toHaveLength(1);
    expect(filterCollaborators(records, { search: "", status: "all", group: "managers" })).toHaveLength(1);
    expect(filterCollaborators(records, { search: "", status: "all", group: "noAccount" })).toHaveLength(1);
  });

  it("não vincula usuário quando o backend retorna response sem employeeId", () => {
    const usersSemEmployeeId: UserSearchListItem[] = [
      {
        userId: "user-1",
        employeeId: undefined as unknown as string,
        username: "maria.silva",
        role: "MANAGER",
        active: true,
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
