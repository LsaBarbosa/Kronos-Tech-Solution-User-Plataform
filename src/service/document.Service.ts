// src/services/documentService.ts

import { apiFetch, parseApiResponse } from "@/config/api";
import { Document, EmployeeListItem, MAX_UPLOAD_SIZE_BYTES } from "@/types/document";
import { buildApiUrl, downloadFile } from "./fileDownload.service";

export interface DocumentSearchItem {
  id: string;
  fileName?: string;
  createdAt?: string;
  uploadedAt?: string;
}

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

export const fetchEmployeesByActiveStatus = async (active: string | boolean): Promise<EmployeeListItem[]> => {
  const normalizedActive = typeof active === 'boolean' ? active : active === 'true';
  const response = await apiFetch(`employee?active=${normalizedActive}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  const data = await parseApiResponse<{ employees: Array<{ employeeId: string; fullName: string }> }>(response);

  return (data.employees ?? []).map((employee) => ({
    employeeId: employee.employeeId,
    fullName: employee.fullName,
  }));
};

export const searchEmployeeDocuments = async (
  employeeId: string,
  type: string,
): Promise<DocumentSearchItem[]> => {
  const params = new URLSearchParams({ employeeId, type });
  const response = await apiFetch(`documents?${params.toString()}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  const data = await parseApiResponse<{ documents: DocumentSearchItem[] }>(response);

  return data.documents ?? [];
};

export const deleteEmployeeDocument = async (documentId: string, employeeId: string): Promise<void> => {
  const response = await apiFetch(`documents/${documentId}?employeeId=${encodeURIComponent(employeeId)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  await parseApiResponse(response);
};

export const uploadEmployeeDocument = async (
  file: File,
  employeeId: string,
  type: string,
): Promise<void> => {
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error('O arquivo excede o limite de 5MB.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const params = new URLSearchParams({ employeeId, type });
  const response = await apiFetch(`documents?${params.toString()}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  await parseApiResponse(response);
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
