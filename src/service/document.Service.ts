import { api } from "@/config/api";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
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
  let blob: Blob;
  let contentDisposition: string | null = null;

  try {
    const response = await api.get<Blob>(`documents/${documentId}`, {
      params: employeeId ? { employeeId } : undefined,
      responseType: "blob",
    });

    blob = response.data;
    contentDisposition = response.headers["content-disposition"] || null;
  } catch (error) {
    throw new Error(getServiceErrorMessage(error, "Não foi possível realizar o download."));
  }

  const href = window.URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = href;
  link.download = resolveFileName(contentDisposition, fallbackFileName);

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
