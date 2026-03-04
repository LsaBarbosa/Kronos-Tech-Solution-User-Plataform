// src/services/messageService.ts

import { apiFetch, parseApiResponse } from "@/config/api";
import { Message, MessagePayload } from "@/types/message";
import { EmployeeData } from "@/types/employee";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
});

export const fetchMessages = async (): Promise<Message[]> => {
  const headers = getAuthHeaders();
  const response = await apiFetch("messages", {
    method: "GET",
    headers,
  });

  return parseApiResponse<Message[]>(response);
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await apiFetch(`messages/${messageId}`, {
    method: "DELETE",
    headers,
  });

  await parseApiResponse<void>(response);
};

export const postMessage = async (payload: MessagePayload): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await apiFetch("messages", {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(payload),
    credentials: "include",
  });

  await parseApiResponse<void>(response);
};

export const fetchActiveEmployees = async (): Promise<EmployeeData[]> => {
  const headers = getAuthHeaders();
  const response = await apiFetch("employee?active=true", { headers });
  const data = await parseApiResponse<{ employees: EmployeeData[] }>(response);

  return data.employees.map((emp) => ({
    employeeId: emp.employeeId,
    fullName: emp.fullName,
  }));
};
