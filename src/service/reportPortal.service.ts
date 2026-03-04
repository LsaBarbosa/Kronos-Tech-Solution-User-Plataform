import { api } from "@/config/api";

export const fetchEmployeesForReport = async (activeStatus?: boolean) => {
  const params = typeof activeStatus === "boolean" ? { active: activeStatus } : undefined;
  const { data } = await api.get("employee", { params });
  return data.employees || [];
};

export const fetchManagersForReport = async () => {
  const { data } = await api.get("users/search");
  return data.users || [];
};

export const fetchRecordsReport = async (requestBody: any, employeeId?: string) => {
  const params = employeeId ? { employeeId } : undefined;
  const { data } = await api.post("records/report", requestBody, { params });
  return data;
};

export const requestTimeRecordUpdate = async (timeRecordId: string, payload: any) => {
  await api.put(`records/update/time-record/${timeRecordId}`, payload);
};

export const updateStatusRecord = async (employeeId: string, timeRecordId: string, statusRecord: string) => {
  await api.put(`records/update/status/${employeeId}/${timeRecordId}`, { statusRecord });
};

export const toggleStatusRecordActivation = async (employeeId: string, timeRecordId: string) => {
  await api.put(`records/toggle-activate/${employeeId}/${timeRecordId}`);
};
