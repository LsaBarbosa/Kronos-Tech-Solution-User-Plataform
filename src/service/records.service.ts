import { api } from "@/config/api";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import { extractArray, extractObject } from "@/service/helpers/response-normalizer.helper";
import { DetailedReportItem, Employee } from "@/utils/report-utils";
import {
  IRequestTimeOffData,
  ITimeOffQueryParams,
  ITimeRecordApprovalPageResponse,
  ITimeRecordPageResponse,
  IPendingApprovalQueryParams,
} from "@/types/recordApproval";
import {
  IManagerOption,
  IRequestVacationRequest,
  RequestTimeOffRequestPayload,
  IVacationApprovalRequest,
  IVacationQueryParams,
  IVacationRequestPageResponse,
  IVacationRequestResponse,
} from "@/types/vacation";
import { UserSearchData } from "@/types/user";

const RECORDS_BASE_URL = `/${API_ROUTES.RECORDS}`;

export interface DetailedReportQueryParams {
  reference: string;
  active: boolean;
  dates: string[];
  statuses?: string[];
  employeeId?: string;
}

export interface RecordStatusUpdatePayload {
  statusRecord: string;
}

export interface TimeRecordUpdatePayload {
  startDate: string;
  endDate: string;
  startHour: string;
  endHour: string;
  managerId: string;
}

export const fetchPendingApprovals = async (
  params: IPendingApprovalQueryParams
): Promise<ITimeRecordApprovalPageResponse> => {
  const response = await api.get<ITimeRecordApprovalPageResponse>(
    `${RECORDS_BASE_URL}/pending-approvals`,
    {
      params: {
        page: params.page,
        ...(params.employeeName && { employeeName: params.employeeName }),
      },
    }
  );

  return extractObject<ITimeRecordApprovalPageResponse>(response.data) as ITimeRecordApprovalPageResponse;
};

export const fetchDetailedReport = async (
  params: DetailedReportQueryParams
): Promise<DetailedReportItem[]> => {
  const { employeeId, ...body } = params;
  const response = await api.post<DetailedReportItem[]>(
    `${RECORDS_BASE_URL}/report`,
    body,
    {
      params: employeeId ? { employeeId } : undefined,
    }
  );

  return extractArray<DetailedReportItem>(response.data, ["report", "records", "timeRecords"]);
};

export const approveTimeRecordChange = async (timeRecordId: number): Promise<void> => {
  await api.patch(`${RECORDS_BASE_URL}/approve/${timeRecordId}`);
};

export const rejectTimeRecordChange = async (timeRecordId: number): Promise<void> => {
  await api.patch(`${RECORDS_BASE_URL}/reject/${timeRecordId}`);
};

export const updateRecordStatus = async (
  employeeId: string,
  timeRecordId: string,
  payload: RecordStatusUpdatePayload
): Promise<void> => {
  await api.put(`${RECORDS_BASE_URL}/update/status/${employeeId}/${timeRecordId}`, payload);
};

export const toggleRecordActivate = async (
  employeeId: string,
  timeRecordId: string
): Promise<void> => {
  await api.put(`${RECORDS_BASE_URL}/toggle-activate/${employeeId}/${timeRecordId}`);
};

export const updateTimeRecord = async (
  timeRecordId: number | string,
  payload: TimeRecordUpdatePayload
): Promise<void> => {
  await api.put(`${RECORDS_BASE_URL}/update/time-record/${timeRecordId}`, payload);
};

export const requestTimeOff = async (
  requestData: RequestTimeOffRequestPayload,
  document?: File | null
): Promise<number> => {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(requestData)], { type: "application/json" }),
    "request.json"
  );

  if (document) {
    formData.append("document", document, document.name);
  }

  const response = await api.post<number>(`${RECORDS_BASE_URL}/time-off/request`, formData);
  return response.data;
};

export const listTimeOffRequests = async (
  params: ITimeOffQueryParams
): Promise<ITimeRecordPageResponse> => {
  const response = await api.get<ITimeRecordPageResponse>(`${RECORDS_BASE_URL}/time-off/requests`, {
    params: {
      page: params.page,
      size: params.size,
      status: params.status,
      ...(params.employeeName && { employeeName: params.employeeName }),
    },
  });

  return extractObject<ITimeRecordPageResponse>(response.data) as ITimeRecordPageResponse;
};

export const approveTimeOff = async (timeRecordId: number): Promise<void> => {
  await api.patch(`${RECORDS_BASE_URL}/time-off/approve/${timeRecordId}`);
};

export const rejectTimeOff = async (timeRecordId: number): Promise<void> => {
  await api.patch(`${RECORDS_BASE_URL}/time-off/reject/${timeRecordId}`);
};

export const requestVacation = async (data: IRequestVacationRequest): Promise<number[]> => {
  const response = await api.post<number[]>(`${RECORDS_BASE_URL}/vacation-request`, data);
  return extractArray<number>(response.data);
};

export const fetchVacationRequests = async (
  params: IVacationQueryParams
): Promise<IVacationRequestResponse[]> => {
  const response = await api.get<IVacationRequestResponse[]>(`${RECORDS_BASE_URL}/vacation-request`, {
    params: {
      page: params.page,
      size: params.size,
      status: params.status,
      ...(params.employeeName && { employeeName: params.employeeName }),
    },
  });

  return extractArray<IVacationRequestResponse>(response.data, ["requests", "vacationRequests", "content"]);
};

export const approveVacationRequest = async (timeRecordIds: number[]): Promise<void> => {
  const body: IVacationApprovalRequest = { timeRecordIds };
  await api.patch(`${RECORDS_BASE_URL}/vacation-request/approve`, body);
};

export const rejectVacationRequest = async (timeRecordIds: number[]): Promise<void> => {
  const body: IVacationApprovalRequest = { timeRecordIds };
  await api.patch(`${RECORDS_BASE_URL}/vacation-request/reject`, body);
};

export const fetchManagerOptions = async (): Promise<IManagerOption[]> => {
  const response = await api.get<{ users?: UserSearchData[] }>(buildRoute(API_ROUTES.USERS, "search"), {
    params: { active: true },
  });

  return extractArray<UserSearchData>(response.data, ["users"])
    .filter((user) => user.role === "MANAGER")
    .map((user): IManagerOption => ({
      userId: user.userId,
      username: user.username,
    }));
};

export const fetchPendingVacationCount = async (): Promise<number> => {
  const response = await api.get<IVacationRequestPageResponse>(`${RECORDS_BASE_URL}/vacation-request`, {
    params: {
      page: 0,
      size: 1,
      status: "PENDING",
    },
  });

  const pageData = extractObject<IVacationRequestPageResponse>(response.data) as IVacationRequestPageResponse;
  return pageData.totalElements ?? extractArray(response.data).length;
};

export const fetchReportEmployees = async (active = true): Promise<Employee[]> => {
  const response = await api.get<{ employees?: Employee[] }>(`/${API_ROUTES.EMPLOYEE}`, {
    params: { active },
  });

  return extractArray<Employee>(response.data, ["employees"]);
};
