import { api } from "@/config/api";
import { downloadDocumentFile } from "@/service/document.Service";

export const fetchEmployeesForDocuments = async (activeEmployeeFilter: string) => {
  const { data } = await api.get("employee", { params: { active: activeEmployeeFilter } });
  return data.employees || [];
};

export const searchDocuments = async (employeeId: string, type: string) => {
  const { data } = await api.get("documents", { params: { employeeId, type } });
  return data.documents || [];
};

export const removeEmployeeDocument = async (documentId: string, employeeId: string) => {
  await api.delete(`documents/${documentId}`, { params: { employeeId } });
};

export const uploadEmployeeDocument = async (file: File, employeeId: string, type: string) => {
  const formData = new FormData();
  formData.append("file", file);

  await api.post("documents", formData, {
    params: { employeeId, type },
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const downloadEmployeeDocument = async (documentId: string, employeeId: string, fallbackFileName: string) => {
  await downloadDocumentFile(documentId, { employeeId, fallbackFileName });
};
