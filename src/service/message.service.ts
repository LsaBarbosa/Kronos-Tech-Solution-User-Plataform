// src/services/messageService.ts

import { API_BASE_URL } from "@/config/api";
import { Message, MessagePayload } from "@/types/message";
import { EmployeeData } from "@/types/employee";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
});

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData.detail || errorData.message || `Erro de API (${response.status})`;
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return {};
};

export const fetchMessages = async (): Promise<Message[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}messages`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  return handleResponse(response);
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}messages/${messageId}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  await handleResponse(response);
};

export const postMessage = async (payload: MessagePayload): Promise<void> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}messages`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  await handleResponse(response);
};

export const fetchActiveEmployees = async (): Promise<EmployeeData[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}employee?active=true`, { headers, credentials: "include" });
  const data = await handleResponse(response);

  return data.employees.map((emp: any) => ({
    employeeId: emp.employeeId,
    fullName: emp.fullName,
  })) as EmployeeData[];
};
