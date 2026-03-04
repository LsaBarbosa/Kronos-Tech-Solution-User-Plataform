import { api } from "@/config/api";
import { Message, MessagePayload } from "@/types/message";
import { EmployeeData } from "@/types/employee";

const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = decodeURIComponent(atob(base64).split('').map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`).join(''));
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

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

export const getUserRoleFromToken = (): 'MANAGER' | 'PARTNER' | 'CTO' | '' => {
  const token = localStorage.getItem("token");
  if (!token) return '';
  const decoded = decodeToken(token);
  const role = decoded?.role;
  return role === 'MANAGER' || role === 'PARTNER' || role === 'CTO' ? role : '';
};
