import type { EmployeeData } from "@/types/employee";
import type { UserSearchListItem } from "@/types/user";
import type { CollaboratorRecord, CollaboratorFilters, CollaboratorGroupFilter, CollaboratorStatusFilter } from "../types/collaborator-view.types";
import {
  buildCollaboratorSummary,
  buildDetailSummary,
  createCollaboratorTitle,
  formatScheduleLabel,
  getAccountLabel,
  getBiometricLabel,
  getBiometricTone,
  getInitials,
  getRoleLabel,
  getStatusTone,
  matchesCollaboratorFilters,
} from "./collaborator-formatters";

const inferBiometricState = (
  hasAccount: boolean,
  biometricConsentAccepted: boolean | undefined
): CollaboratorRecord["biometricState"] => {
  if (!hasAccount) return "unknown";
  return biometricConsentAccepted ? "registered" : "pending";
};

export const mergeCollaborators = (
  employees: EmployeeData[],
  users: UserSearchListItem[]
): CollaboratorRecord[] => {
  const usersByEmployeeId = new Map<string, UserSearchListItem>();

  users.forEach((user) => {
    if (user.employeeId) {
      usersByEmployeeId.set(user.employeeId, user);
    }
  });

  return employees.map((employee) => {
    const matchedUser = employee.employeeId
      ? usersByEmployeeId.get(employee.employeeId)
      : undefined;
    const hasAccount = Boolean(matchedUser);
    const username = matchedUser?.username ?? "";
    const role = matchedUser?.role ?? null;
    const active = typeof matchedUser?.active === "boolean" ? matchedUser.active : employee.active;
    const biometricState = inferBiometricState(hasAccount, matchedUser?.biometricConsentAccepted);

    const collaborator: CollaboratorRecord = {
      ...employee,
      userId: matchedUser?.userId ?? null,
      username,
      role,
      hasAccount,
      active,
      enabled: active,
      accountLabel: getAccountLabel(hasAccount, username),
      roleLabel: getRoleLabel(role ?? undefined),
      scheduleLabel: formatScheduleLabel(employee),
      homeOfficeLabel: employee.homeOffice ? "Home office" : "Presencial",
      biometricState,
      biometricLabel: getBiometricLabel(biometricState),
      biometricTone: getBiometricTone(biometricState),
      statusTone: getStatusTone(active),
      initials: getInitials(employee.fullName),
      detailSummary: buildDetailSummary({
        ...(employee as CollaboratorRecord),
        userId: matchedUser?.userId ?? null,
        username,
        role,
        hasAccount,
        active,
        enabled: active,
        accountLabel: getAccountLabel(hasAccount, username),
        roleLabel: getRoleLabel(role ?? undefined),
        scheduleLabel: formatScheduleLabel(employee),
        homeOfficeLabel: employee.homeOffice ? "Home office" : "Presencial",
        biometricState,
        biometricLabel: getBiometricLabel(biometricState),
        biometricTone: getBiometricTone(biometricState),
        statusTone: getStatusTone(active),
        initials: getInitials(employee.fullName),
        detailSummary: "",
      }),
    };

    return collaborator;
  });
};

export const filterCollaborators = (
  records: CollaboratorRecord[],
  filters: CollaboratorFilters
) => {
  return records.filter((record) => {
    if (!matchesCollaboratorFilters(record, filters.search)) {
      return false;
    }

    if (filters.status === "active" && !record.active) {
      return false;
    }

    if (filters.status === "inactive" && record.active) {
      return false;
    }

    if (filters.group === "partners" && record.role !== "PARTNER") {
      return false;
    }

    if (filters.group === "managers" && record.role !== "MANAGER") {
      return false;
    }

    if (filters.group === "biometric" && record.biometricState !== "registered") {
      return false;
    }

    return true;
  });
};

export const summarizeCollaborators = buildCollaboratorSummary;

export const defaultCollaboratorFilters: CollaboratorFilters = {
  search: "",
  status: "all",
  group: "all",
};

export const filterStatusOptions: Array<{ id: CollaboratorStatusFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "active", label: "Ativos" },
  { id: "inactive", label: "Inativos" },
];

export const filterGroupOptions: Array<{ id: CollaboratorGroupFilter; label: string; description: string }> = [
  { id: "all", label: "Todos", description: "Todos os colaboradores" },
  { id: "partners", label: "Somente colaboradores (PARTNER)", description: "Filtra contas com role PARTNER" },
  { id: "managers", label: "Administradores (MANAGER)", description: "Filtra contas com role MANAGER" },
  { id: "biometric", label: "Biometria", description: "Colaboradores com consentimento biométrico aceito" },
];

export const isFilterActive = (records: CollaboratorRecord[], filters: CollaboratorFilters) =>
  filters.search.trim().length > 0 || filters.status !== "all" || filters.group !== "all";

export const findRecordById = (records: CollaboratorRecord[], employeeId: string | null) =>
  records.find((record) => record.employeeId === employeeId) ?? null;

export const buildReadOnlySummary = (record: CollaboratorRecord) => createCollaboratorTitle(record);

