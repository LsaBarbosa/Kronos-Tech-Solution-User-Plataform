// src/services/documentService.ts

import { API_BASE_URL, apiFetch, parseApiResponse } from '@/config/api';
import { Document, EmployeeListItem, MAX_UPLOAD_SIZE_BYTES } from '@/types/document';

export const fetchUserDocuments = async (): Promise<Document[]> => {
  const response = await apiFetch('documents/me');
  return parseApiResponse(response);
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  const response = await apiFetch(`documents/${documentId}`, { method: 'DELETE' });
  await parseApiResponse(response);
};

export const generateDownloadUrl = (documentId: string): string => `${API_BASE_URL}documents/${documentId}/download`;

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
