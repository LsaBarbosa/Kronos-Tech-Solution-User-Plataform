import { api } from "@/config/api";

interface Address {
  street: string;
  number: string;
  postalCode: string;
  city: string;
  state: string;
}

export interface EmployeeAdminData {
  employeeId: string;
  fullName: string;
  maskedCpf: string;
  pis: string;
  jobPosition: string;
  email: string;
  salary: number;
  phone: string;
  address: Address;
  companyId: string;
  active: boolean;
  homeOffice: boolean;
  workStartTime?: string;
  workEndTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  scheduleType?: string;
  scaleStartDate?: string;
  preferredDayOff?: string;
  weekendOffIndex?: number;
  fixedWorkDays?: string[];
}

export interface UserAdminData {
  userId: string;
  username: string;
  role: "PARTNER" | "MANAGER";
  active: boolean;
  enabled?: boolean;
  employeeId: string;
}

interface EmployeesResponse {
  employees: EmployeeAdminData[];
}

interface UsersResponse {
  users: UserAdminData[];
}

export const fetchEmployeesAdmin = async (active: boolean): Promise<EmployeeAdminData[]> => {
  const { data } = await api.get<EmployeesResponse>("employee", { params: { active } });
  return data.employees || [];
};

export const fetchUsersAdmin = async (): Promise<UserAdminData[]> => {
  const { data } = await api.get<UsersResponse>("users/search");
  return data.users || [];
};

export const updateEmployeeAdmin = async (employeeId: string, payload: Record<string, unknown>): Promise<void> => {
  await api.patch(`employee/manager/update-employee/${employeeId}`, payload);
};

export const updateUserAdmin = async (userId: string, payload: Record<string, unknown>): Promise<void> => {
  await api.patch(`users/search/${userId}`, payload);
};

export const toggleUserAdminStatus = async (userId: string): Promise<void> => {
  await api.patch(`users/toggle-activate/${userId}`);
};
