import { API_BASE_URL, api } from "@/config/api";
import { Document, EmployeeListItem, MAX_UPLOAD_SIZE_BYTES } from "@/types/document";

export const fetchUserDocuments = async (): Promise<Document[]> => {
  const { data } = await api.get("documents/me");
  return data;
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await api.delete(`documents/${documentId}`);
};

interface DownloadDocumentParams {
  employeeId?: string;
  fallbackFileName?: string;
}

const resolveFileName = (contentDisposition: string | null, fallbackFileName: string): string => {
  if (!contentDisposition) return fallbackFileName;

  const utf8FileNameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8FileNameMatch?.[1]) {
    return decodeURIComponent(utf8FileNameMatch[1]);
  }

  const fileNameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (fileNameMatch?.[1]) {
    return fileNameMatch[1];
  }

  return fallbackFileName;
};

export const downloadDocumentFile = async (
  documentId: string,
  { employeeId, fallbackFileName = "documento" }: DownloadDocumentParams = {},
): Promise<void> => {
  const query = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : "";
  const response = await fetch(`${API_BASE_URL}documents/${documentId}${query}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Não foi possível realizar o download.");
  }

  const blob = await response.blob();
  const href = window.URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = href;
  link.download = resolveFileName(response.headers.get("Content-Disposition"), fallbackFileName);

  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  window.URL.revokeObjectURL(href);
};

export const fetchEmployeesForSelection = async (): Promise<EmployeeListItem[]> => {
  const { data } = await api.get("employees", { params: { active: true } });
  return data.employees.map((emp: any) => ({ employeeId: emp.id, fullName: emp.name })) as EmployeeListItem[];
};

export const fetchEmployeeDocuments = async (employeeId: string): Promise<Document[]> => {
  const { data } = await api.get(`documents/employee/${employeeId}`);
  return data;
};

export const uploadDocument = async (file: File, employeeId: string): Promise<void> => {
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("O arquivo excede o limite de 5MB.");
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('employeeId', employeeId);

  await api.post("documents/upload", formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
