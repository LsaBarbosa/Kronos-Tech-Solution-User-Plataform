import { api } from "@/config/api";
import { mapArrayPayload } from "@/service/helpers/response-normalizer.helper";
import {
  Document,
  EmployeeListItem,
  MAX_UPLOAD_SIZE_BYTES,
} from "@/types/document";

export interface DocumentFilters {
  employeeId?: string;
  type?: string;
}

export interface DownloadedDocument {
  fileName: string;
  blob: Blob;
}

type DocumentApiRecord = {
  id?: string;
  name?: string;
  fileName?: string;
  createdAt?: string;
  uploadedAt?: string;
  type?: string;
};

const parseDownloadFileName = (
  contentDisposition: string | null,
  fallbackFileName: string
) => {
  if (!contentDisposition) {
    return fallbackFileName;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (filenameMatch?.[1]) {
    return filenameMatch[1];
  }

  return fallbackFileName;
};

const triggerBrowserDownload = (blob: Blob, fileName: string) => {
  const href = window.URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = href;
  link.download = fileName;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  window.URL.revokeObjectURL(href);
};

export const fetchDocuments = async (
  filters: DocumentFilters = {}
): Promise<Document[]> => {
  const response = await api.get("/documents", {
    params: Object.keys(filters).length > 0 ? filters : undefined,
  });

  return mapArrayPayload<DocumentApiRecord, Document>(
    response.data,
    (document) => ({
      id: document.id ?? "",
      name: document.name ?? document.fileName ?? "Nome Desconhecido",
      createdAt: document.createdAt ?? document.uploadedAt ?? "",
      type: document.type ?? "",
    }),
    ["documents"]
  );
};

export const fetchUserDocuments = async (): Promise<Document[]> => {
  return fetchDocuments();
};

export const fetchEmployeeDocuments = async (
  employeeId: string,
  filters: Omit<DocumentFilters, "employeeId"> = {}
): Promise<Document[]> => {
  return fetchDocuments({
    ...filters,
    employeeId,
  });
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await api.delete(`/documents/${documentId}`);
};

export const downloadDocument = async (
  documentId: string,
  fallbackFileName: string
): Promise<DownloadedDocument> => {
  const response = await api.get<Blob>(`/documents/${documentId}`, {
    responseType: "blob",
  });

  const contentDisposition =
    response.headers["content-disposition"] ??
    response.headers["Content-Disposition"] ??
    null;
  const fileName = parseDownloadFileName(contentDisposition, fallbackFileName);
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);

  triggerBrowserDownload(blob, fileName);

  return {
    fileName,
    blob,
  };
};

export const fetchEmployeesForSelection = async (
  active = true
): Promise<EmployeeListItem[]> => {
  const response = await api.get("/employee", {
    params: { active },
  });

  return mapArrayPayload<
    { employeeId?: string; fullName?: string; id?: string; name?: string },
    EmployeeListItem
  >(
    response.data,
    (employee) => ({
      employeeId: employee.employeeId ?? employee.id ?? "",
      fullName: employee.fullName ?? employee.name ?? "",
    }),
    ["employees"]
  );
};

export const uploadDocument = async (
  file: File,
  employeeId: string,
  type: string
): Promise<void> => {
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("O arquivo excede o limite de 5MB.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("employeeId", employeeId);
  formData.append("type", type);

  await api.post("/documents", formData);
};
