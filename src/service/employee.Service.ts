import { EmployeeCreationPayload, CompanyListItem, EmployeeData, cleanNumberString } from "@/types/employee";
import { api } from "@/config/api";

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  if (username.length < 5) return false;
  const { data } = await api.get("auth/username-availability", { params: { username } });
  return data.available;
};

export const fetchCompanyList = async (): Promise<CompanyListItem[]> => {
  const { data } = await api.get("companies/list-basic");
  return data.map((item: any) => ({ companyId: item.id, name: item.name }));
};

const createApiPayload = (formData: EmployeeCreationPayload): Omit<EmployeeCreationPayload, 'confirmPassword'> => ({
  ...formData,
  homeOffice: formData.homeOffice,
  cpf: cleanNumberString(formData.cpf),
  pis: cleanNumberString(formData.pis),
  phoneNumber: cleanNumberString(formData.phoneNumber),
  salary: Number(formData.salary),
});

export const createPartner = async (formData: EmployeeCreationPayload): Promise<void> => {
  const finalPayload = createApiPayload(formData);
  (finalPayload as any).role = 'PARTNER';
  await api.post("employees/create-partner", finalPayload);
};

export const createManager = async (formData: EmployeeCreationPayload): Promise<void> => {
  const finalPayload = createApiPayload(formData);
  (finalPayload as any).role = 'MANAGER';
  await api.post("employees/create-manager", finalPayload);
};

export const fetchEmployeeList = async (): Promise<EmployeeData[]> => {
  const { data } = await api.get("employee");
  return data.employees as EmployeeData[];
};

export const toggleEmployeeStatus = async (employeeId: string, currentStatus: boolean): Promise<void> => {
  await api.patch(`employees/${employeeId}/toggle-status`, { active: !currentStatus });
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  await api.delete(`employees/${employeeId}`);
};
