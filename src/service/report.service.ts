import { api } from "@/config/api";
import { DetailedReportItem, Employee, Manager } from "@/utils/report-utils";

interface UsersSearchResponse {
  users: Array<{ userId: string; username: string; role: string }>;
}

interface EmployeesResponse {
  employees: Employee[];
}

interface ReportRequestPayload {
  reference: string;
  active: boolean;
  dates: string[];
  statuses?: string[];
}

interface UpdateTimeRecordPayload {
  startDate: string;
  endDate: string;
  startHour: string;
  endHour: string;
  managerId: string;
}

export const fetchEmployeesByActive = async (active?: boolean): Promise<Employee[]> => {
  const { data } = await api.get<EmployeesResponse>("employee", {
    params: active === undefined ? undefined : { active },
  });

  return data.employees || [];
};

export const fetchManagers = async (): Promise<Manager[]> => {
  const { data } = await api.get<UsersSearchResponse>("users/search");
  return (data.users || [])
    .filter((user) => user.role === "MANAGER")
    .map((user) => ({ id: user.userId, name: user.username }));
};

export const fetchDetailedReport = async (
  payload: ReportRequestPayload,
  employeeId?: string,
): Promise<DetailedReportItem[]> => {
  const { data } = await api.post<DetailedReportItem[]>("records/report", payload, {
    params: employeeId ? { employeeId } : undefined,
  });

  return data;
};

export const updateTimeRecord = async (timeRecordId: string, payload: UpdateTimeRecordPayload): Promise<void> => {
  await api.put(`records/update/time-record/${timeRecordId}`, payload);
};

export const updateRecordStatus = async (
  employeeId: string,
  timeRecordId: string,
  statusRecord: string,
): Promise<void> => {
  await api.put(`records/update/status/${employeeId}/${timeRecordId}`, { statusRecord });
};

export const toggleRecordActivate = async (employeeId: string, timeRecordId: string): Promise<void> => {
  await api.put(`records/toggle-activate/${employeeId}/${timeRecordId}`);
};
