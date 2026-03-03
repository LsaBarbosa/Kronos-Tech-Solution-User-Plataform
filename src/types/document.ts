// src/types/document.ts

export interface Document {
  id: string;
  name: string;
  createdAt: string;
  type: string;
}

export interface EmployeeListItem {
  employeeId: string;
  fullName: string;
}

export interface UploadData {
  file: File | null;
  selectedEmployeeId: string;
}

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.doc'] as const;
export const ALLOWED_ACCEPT_STRING = ALLOWED_MIME_TYPES.join(', ');

const INVALID_DATE_TEXT = 'Data Inválida';

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';

  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) {
    return INVALID_DATE_TEXT;
  }

  return parsedDate.toLocaleDateString('pt-BR');
};
