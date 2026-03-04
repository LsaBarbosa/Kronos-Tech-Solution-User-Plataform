import { api } from "@/config/api";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import { Document, EmployeeListItem, MAX_UPLOAD_SIZE_BYTES } from "@/types/document";

interface EmployeesResponse {
  employees: Array<{ employeeId?: string; id?: string; fullName?: string; name?: string }>;
}

interface DocumentsResponse {
  documents?: Array<{ id: string; fileName?: string; name?: string; createdAt?: string; uploadedAt?: string; type?: string }>;
}

export interface ListDocumentsParams {
  employeeId?: string;
  type?: string;
}

export interface UploadDocumentParams {
  employeeId: string;
  type?: string;
}

export interface DeleteDocumentParams {
  employeeId?: string;
}

export interface DownloadDocumentParams {
  employeeId?: string;
  fallbackFileName?: string;
}

export const listEmployeesForDocuments = async (active: string): Promise<Array<{ id: string; name: string }>> => {
  const { data } = await api.get<EmployeesResponse>("employee", { params: { active } });

  return (data.employees || []).map((emp) => ({
    id: emp.employeeId || emp.id || "",
    name: emp.fullName || emp.name || "",
  }));
};

interface EmployeeSelectionResponse {
  employees: Array<{ id: string; name: string }>;
}

export const fetchEmployeesForSelection = async (): Promise<EmployeeListItem[]> => {
  const { data } = await api.get<EmployeeSelectionResponse>("employees", { params: { active: true } });
  return data.employees.map((emp) => ({ employeeId: emp.id, fullName: emp.name }));
};

export const listDocuments = async ({ employeeId, type }: ListDocumentsParams = {}): Promise<Document[]> => {
  if (!employeeId && !type) {
    const { data } = await api.get<Document[]>("documents/me");
    return data;
  }

  const { data } = await api.get<DocumentsResponse>("documents", {
    params: {
      ...(employeeId ? { employeeId } : {}),
      ...(type ? { type } : {}),
    },
  });

  return (data.documents || []).map((doc) => ({
    id: doc.id,
    name: doc.fileName || doc.name || "Nome Desconhecido",
    createdAt: doc.createdAt || doc.uploadedAt || "",
    type: doc.type || type || "",
  }));
};

export const fetchUserDocuments = listDocuments;

export const fetchEmployeeDocuments = async (employeeId: string): Promise<Document[]> => {
  const { data } = await api.get<Document[]>(`documents/employee/${employeeId}`);
  return data;
};

export const deleteDocument = async (
  documentId: string,
  params?: DeleteDocumentParams,
): Promise<void> => {
  await api.delete(`documents/${documentId}`, {
    params: params?.employeeId ? { employeeId: params.employeeId } : undefined,
  });
};

export const uploadDocument = async (
  file: File,
  paramsOrEmployeeId: UploadDocumentParams | string,
  typeArg?: string,
): Promise<void> => {
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("O arquivo excede o limite de 5MB.");
  }

  const params: UploadDocumentParams =
    typeof paramsOrEmployeeId === "string"
      ? { employeeId: paramsOrEmployeeId, type: typeArg }
      : paramsOrEmployeeId;

  const formData = new FormData();
  formData.append("file", file);

  if (params.type) {
    await api.post("documents", formData, {
      params: { employeeId: params.employeeId, type: params.type },
      headers: { "Content-Type": "multipart/form-data" },
    });
    return;
  }

  formData.append("employeeId", params.employeeId);
  await api.post("documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

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

const triggerFileDownload = (blob: Blob, fileName: string): void => {
  const href = window.URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = href;
  link.download = fileName;

  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  window.URL.revokeObjectURL(href);
};

export const downloadDocument = async (
  documentId: string,
  { employeeId, fallbackFileName = "documento" }: DownloadDocumentParams = {},
): Promise<void> => {
  try {
    const response = await api.get<Blob>(`documents/${documentId}`, {
      params: employeeId ? { employeeId } : undefined,
      responseType: "blob",
    });

    const contentDisposition = response.headers["content-disposition"] || null;
    triggerFileDownload(response.data, resolveFileName(contentDisposition, fallbackFileName));
  } catch (error) {
    throw new Error(getServiceErrorMessage(error, "Não foi possível realizar o download."));
  }
};

export const downloadDocumentFile = downloadDocument;
