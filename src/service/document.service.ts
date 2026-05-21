import { api } from "@/config/api";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import { mapArrayPayload } from "@/service/helpers/response-normalizer.helper";
import type {
  Document,
  DocumentType,
  EmployeeListItem,
} from "@/types/document";
import {
  isAllowedDocumentFile,
  MAX_UPLOAD_SIZE_BYTES,
} from "@/types/document";

export interface DocumentFilters {
  type: DocumentType;
  employeeId?: string;
  date?: string;
}

export interface DownloadedDocument {
  fileName: string;
  blob: Blob;
}

type DocumentApiRecord = {
  documentId?: string;
  id?: string;
  fileName?: string;
  name?: string;
  uploadedAt?: string;
  createdAt?: string;
  documentType?: string;
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
  filters: DocumentFilters
): Promise<Document[]> => {
  const response = await api.get(`/${API_ROUTES.DOCUMENTS}`, {
      params: filters,
  });

  return mapArrayPayload<DocumentApiRecord, Document>(
    response.data,
    (document) => ({
      id: document.documentId ?? document.id ?? "",
      name: document.fileName ?? document.name ?? "Nome Desconhecido",
      createdAt: document.uploadedAt ?? document.createdAt ?? "",
      type: (document.documentType ?? document.type ?? "DOCUMENTS") as DocumentType,
    }),
    ["documents"]
  );
};

export const fetchUserDocuments = async (type: DocumentType): Promise<Document[]> => {
  return fetchDocuments({ type });
};

export const fetchEmployeeDocuments = async (
  employeeId: string,
  filters: Omit<DocumentFilters, "employeeId">
): Promise<Document[]> => {
  return fetchDocuments({
    ...filters,
    employeeId,
  });
};

export const deleteDocument = async (
  documentId: string,
  employeeId?: string
): Promise<void> => {
  await api.delete(buildRoute(API_ROUTES.DOCUMENTS, documentId), {
    params: employeeId ? { employeeId } : undefined,
  });
};

export const downloadDocument = async (
  documentId: string,
  fallbackFileName: string,
  employeeId?: string
): Promise<DownloadedDocument> => {
  const response = await api.get<Blob>(buildRoute(API_ROUTES.DOCUMENTS, documentId), {
    responseType: "blob",
    params: employeeId ? { employeeId } : undefined,
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
  const response = await api.get(`/${API_ROUTES.EMPLOYEE}`, {
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
  type: DocumentType
): Promise<void> => {
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("O arquivo excede o limite de 5MB.");
  }

  if (!isAllowedDocumentFile(file)) {
    throw new Error("Tipo de arquivo não permitido.");
  }

  const formData = new FormData();
  formData.append("file", file);

  await api.post(`/${API_ROUTES.DOCUMENTS}`, formData, {
    params: { employeeId, type },
  });
};
