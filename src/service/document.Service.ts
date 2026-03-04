// src/services/documentService.ts

import { API_BASE_URL } from "@/config/api"; 
import { Document, EmployeeListItem, MAX_UPLOAD_SIZE_BYTES } from "@/types/document";
import { getAuthToken } from "./company.Service";
import { buildApiUrl, downloadFile } from "./fileDownload.service";

export const fetchUserDocuments = async (): Promise<Document[]> => {
  const response = await apiFetch('documents/me');
  return parseApiResponse(response);
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  const response = await apiFetch(`documents/${documentId}`, { method: 'DELETE' });
  await parseApiResponse(response);
};

/**
 * Realiza o download de um documento específico.
 */
export const downloadDocument = async (documentId: string, employeeId?: string, filename?: string): Promise<void> => {
    const url = buildApiUrl(`documents/${documentId}`, { employeeId });
    await downloadFile(url, { filename });
};

export const fetchEmployeesForSelection = async (): Promise<EmployeeListItem[]> => {
  const response = await apiFetch('employees?active=true');
  const data = await parseApiResponse<{ employees: any[] }>(response);
  return data.employees.map((emp: any) => ({
    employeeId: emp.id,
    fullName: emp.name,
  })) as EmployeeListItem[];
};

export const fetchEmployeeDocuments = async (employeeId: string): Promise<Document[]> => {
  const response = await apiFetch(`documents/employee/${employeeId}`);
  return parseApiResponse(response);
};

export const uploadDocument = async (file: File, employeeId: string): Promise<void> => {
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error('O arquivo excede o limite de 5MB.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('employeeId', employeeId);

  const response = await apiFetch('documents/upload', {
    method: 'POST',
    body: formData,
  });

  await parseApiResponse(response);
};
