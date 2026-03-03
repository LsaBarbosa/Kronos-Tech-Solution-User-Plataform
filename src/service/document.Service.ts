// src/services/documentService.ts

import { api } from "@/config/api";
import { Document, EmployeeListItem, MAX_UPLOAD_SIZE_BYTES } from "@/types/document";

interface EmployeeApiResponse {
  id: string;
  name: string;
}

interface EmployeesResponse {
  employees: EmployeeApiResponse[];
}

export const fetchUserDocuments = async (): Promise<Document[]> => {
  const { data } = await api.get<Document[]>("documents/me");
  return data;
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await api.delete(`documents/${documentId}`);
};

export const fetchEmployeesForSelection = async (): Promise<EmployeeListItem[]> => {
  const { data } = await api.get<EmployeesResponse>("employees?active=true");

  return data.employees.map((emp) => ({
    employeeId: emp.id,
    fullName: emp.name,
  }));
};

export const fetchEmployeeDocuments = async (employeeId: string): Promise<Document[]> => {
  const { data } = await api.get<Document[]>(`documents/employee/${employeeId}`);
  return data;
};

export const uploadDocument = async (file: File, employeeId: string): Promise<void> => {
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("O arquivo excede o limite de 5MB.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("employeeId", employeeId);

  await api.post("documents/upload", formData);
};
