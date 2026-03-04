import { api } from "@/config/api";

export interface EmployeeDocumentFilterItem {
  id: string;
  name: string;
}

export interface AdminDocument {
  id: string;
  name: string;
  createdAt: string;
  type: string;
}

interface EmployeesResponse {
  employees: Array<{ employeeId: string; fullName: string }>;
}

interface DocumentsResponse {
  documents: Array<{ id: string; fileName?: string; createdAt?: string; uploadedAt?: string }>;
}

export const fetchEmployeesForDocuments = async (active: string): Promise<EmployeeDocumentFilterItem[]> => {
  const { data } = await api.get<EmployeesResponse>("employee", { params: { active } });
  return (data.employees || []).map((emp) => ({ id: emp.employeeId, name: emp.fullName }));
};

export const fetchDocumentsByEmployeeAndType = async (
  employeeId: string,
  type: string,
): Promise<AdminDocument[]> => {
  const { data } = await api.get<DocumentsResponse>("documents", { params: { employeeId, type } });
  return (data.documents || []).map((doc) => ({
    id: doc.id,
    name: doc.fileName || "Nome Desconhecido",
    createdAt: doc.createdAt || doc.uploadedAt || "",
    type,
  }));
};

export const deleteDocumentByEmployee = async (documentId: string, employeeId: string): Promise<void> => {
  await api.delete(`documents/${documentId}`, { params: { employeeId } });
};

export const uploadEmployeeDocument = async (
  file: File,
  employeeId: string,
  type: string,
): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);

  await api.post(`documents`, formData, {
    params: { employeeId, type },
    headers: { "Content-Type": "multipart/form-data" },
  });
};
