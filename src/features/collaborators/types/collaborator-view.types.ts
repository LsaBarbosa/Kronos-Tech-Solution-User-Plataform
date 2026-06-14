import type { EmployeeData } from "@/types/employee";
import type { UserSearchListItem } from "@/types/user";

export type CollaboratorStatusFilter = "all" | "active" | "inactive";

export type CollaboratorGroupFilter =
  | "all"
  | "managers"
  | "homeOffice"
  | "biometricPending"
  | "noAccount";

export type CollaboratorBiometricState = "registered" | "pending" | "unknown";

export type CollaboratorTone = "success" | "warning" | "danger" | "neutral";

export type CollaboratorEditorDraft = {
  fullName: string;
  maskedCpf: string;
  pis: string;
  jobPosition: string;
  email: string;
  salary: string;
  phone: string;
  postalCode: string;
  number: string;
  username: string;
  role: "MANAGER" | "PARTNER" | "";
  homeOffice: boolean;
  workStartTime: string;
  workEndTime: string;
  breakStartTime: string;
  breakEndTime: string;
  scheduleType: string;
  scaleStartDate: string;
  preferredDayOff: string;
  weekendOffIndex: string;
  fixedWorkDays: string[];
};

export type CollaboratorSummary = {
  active: number;
  inactive: number;
  managers: number;
  homeOffice: number;
  noAccount: number;
  biometricPending: number;
};

export type CollaboratorFilters = {
  search: string;
  status: CollaboratorStatusFilter;
  group: CollaboratorGroupFilter;
};

export type CollaboratorRecord = EmployeeData & {
  userId: string | null;
  username: string;
  role: UserSearchListItem["role"] | null;
  hasAccount: boolean;
  active: boolean;
  enabled: boolean;
  accountLabel: string;
  roleLabel: string;
  scheduleLabel: string;
  homeOfficeLabel: string;
  biometricState: CollaboratorBiometricState;
  biometricLabel: string;
  biometricTone: CollaboratorTone;
  statusTone: CollaboratorTone;
  initials: string;
  detailSummary: string;
};

export type CollaboratorMutationTarget = {
  employeeId: string;
  userId: string | null;
  fullName: string;
  username: string;
  active: boolean;
};

export type CollaboratorFilterPreset = {
  id: CollaboratorGroupFilter;
  label: string;
  description: string;
};

export type CollaboratorStatusPreset = {
  id: CollaboratorStatusFilter;
  label: string;
};

export type CollaboratorSchedulePreset = {
  value: string;
  label: string;
};

