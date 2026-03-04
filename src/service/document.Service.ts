import { API_BASE_URL, api } from "@/config/api";
import { Document, EmployeeListItem, MAX_UPLOAD_SIZE_BYTES } from "@/types/document";

export const fetchUserDocuments = async (): Promise<Document[]> => {
  const { data } = await api.get("documents/me");
  return data;
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await api.delete(`documents/${documentId}`);
};

export const generateDownloadUrl = (documentId: string): string => {
  return `${API_BASE_URL}documents/${documentId}/download`;
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
