import { api } from "@/config/api";
import { UserAccountData, UserData, UserRole, UserSessionProfile } from "@/types/user";

interface OwnProfileResponse {
  userId?: string;
  username?: string;
  fullName?: string;
  role?: string;
  active?: boolean;
  employeeId?: string;
  companyId?: string;
  claims?: Record<string, unknown>;
}

interface EmployeeOwnProfileResponse {
  employeeId?: string;
  fullName?: string;
  maskedCpf?: string;
  jobPosition?: string;
  email?: string;
  salary?: number;
  phone?: string;
  address?: {
    street?: string;
    number?: string;
    postalCode?: string;
    city?: string;
    state?: string;
  };
  companyName?: string;
  lastSeenMessageTimestamp?: string | null;
  homeOffice?: boolean;
  lastLogin?: string | null;
}

const normalizeRole = (role?: string): UserRole => role ?? "PARTNER";

export const normalizeUserAccountData = (data: OwnProfileResponse): UserAccountData => ({
  userId: data.userId ?? "",
  username: data.username ?? data.fullName ?? "",
  role: normalizeRole(data.role),
  active: data.active ?? true,
  employeeId: data.employeeId ?? "",
  companyId: data.companyId ?? "",
  claims: data.claims ?? {},
});

export const normalizeUserData = (
  data: EmployeeOwnProfileResponse,
  role: UserRole,
): UserData => ({
  employeeId: data.employeeId ?? "",
  fullName: data.fullName ?? "",
  maskedCpf: data.maskedCpf ?? "",
  jobPosition: data.jobPosition ?? "",
  email: data.email ?? "",
  salary: data.salary ?? 0,
  phone: data.phone ?? "",
  address: {
    street: data.address?.street ?? "",
    number: data.address?.number ?? "",
    postalCode: data.address?.postalCode ?? "",
    city: data.address?.city ?? "",
    state: data.address?.state ?? "",
  },
  companyName: data.companyName ?? "",
  lastSeenMessageTimestamp: data.lastSeenMessageTimestamp ?? null,
  homeOffice: data.homeOffice ?? false,
  role,
  lastLogin: data.lastLogin ?? null,
});

export const fetchSessionProfile = async (): Promise<UserSessionProfile> => {
  const [{ data: sessionData }, { data: employeeData }] = await Promise.all([
    api.get<OwnProfileResponse>("users/own-profile"),
    api.get<EmployeeOwnProfileResponse>("employee/own-profile"),
  ]);

  const account = normalizeUserAccountData(sessionData);
  const profile = normalizeUserData(employeeData, account.role);

  return { account, profile };
};
