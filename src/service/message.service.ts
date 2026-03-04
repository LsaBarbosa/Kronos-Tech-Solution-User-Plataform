import { api } from "@/config/api";
import { Message, MessagePayload } from "@/types/message";
import { EmployeeData } from "@/types/employee";

export const fetchMessages = async (): Promise<Message[]> => {
  const { data } = await api.get("messages");
  return data;
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  await api.delete(`messages/${messageId}`);
};

export const postMessage = async (payload: MessagePayload): Promise<void> => {
  await api.post("messages", payload);
};

export const fetchActiveEmployees = async (): Promise<EmployeeData[]> => {
  const { data } = await api.get("employee", { params: { active: true } });
  return data.employees.map((emp: any) => ({ employeeId: emp.employeeId, fullName: emp.fullName })) as EmployeeData[];
};

export const getSessionRole = (role?: string): 'MANAGER' | 'PARTNER' | 'CTO' | '' => {
  if (role === 'MANAGER' || role === 'PARTNER' || role === 'CTO') return role;
  return '';
};
