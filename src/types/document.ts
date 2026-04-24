// src/types/document.ts

export type DocumentType =
  | "PAYSLIP"
  | "TIME_OFF"
  | "DOCUMENTS"
  | "EMPLOYEE_DOCUMENTS"
  | "POINT_RECORD_RECEIPT"
  | "BIOMETRIC_CONSENT_TERM"
  | "SERVICE_CONTRACT_TERMS";

export interface Document {
  id: string;
  name: string;
  createdAt: string;
  type: DocumentType;
}

/**
 * Interface para os dados resumidos do colaborador usados em listas de seleção (para DocumentoColaborador).
 */
export interface EmployeeListItem {
  employeeId: string;
  fullName: string;
}

/**
 * Interface para os dados de upload (usado no EnviarDocumentos).
 */
export interface UploadData {
  file: File | null;
  selectedEmployeeId: string;
}

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = [".pdf", ".jpg", ".jpeg", ".png", ".docx", ".doc"];
export const ALLOWED_ACCEPT_STRING = ALLOWED_MIME_TYPES.join(", ");

const ALLOWED_FILE_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

export const isAllowedDocumentFile = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const normalizedExtension = extension ? `.${extension}` : "";

  return (
    ALLOWED_MIME_TYPES.includes(normalizedExtension) ||
    ALLOWED_FILE_MIME_TYPES.includes(file.type)
  );
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";

  try {
    return new Date(dateString).toLocaleDateString("pt-BR");
  } catch {
    return "Data Inválida";
  }
};
