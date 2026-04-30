import { api } from "@/config/api";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import { extractArray, extractObject } from "@/service/helpers/response-normalizer.helper";
import type { DetailedReportItem, Employee } from "@/utils/report-utils";
import type {
  PendingApprovalQueryParams,
  TimeOffQueryParams,
  TimeRecordApprovalPageResponse,
  TimeRecordPageResponse,
} from "@/types/recordApproval";
import type {
  ManagerOption,
  VacationRequestPayload,
  RequestTimeOffRequestPayload,
  VacationApprovalRequest,
  VacationQueryParams,
  VacationRequestPageResponse,
  VacationRequestResponse,
} from "@/types/vacation";
import {
  EMPTY_VACATION_REQUEST_PAGE
} from "@/types/vacation";
import type { UserSearchListItem, UserSearchListResponse } from "@/types/user";

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

const REPORT_REFERENCE_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const validateReportParams = (params: DetailedReportQueryParams) => {
  if (!REPORT_REFERENCE_REGEX.test(params.reference)) {
    throw new Error("O campo reference deve estar no formato HH:mm.");
  }

  if (!Array.isArray(params.dates) || params.dates.length === 0) {
    throw new Error("Informe pelo menos uma data para gerar o relatório.");
  }

  if (params.dates.some((date) => typeof date !== "string" || !date.trim())) {
    throw new Error("As datas do relatório são inválidas.");
  }
};

const extractVacationRequestPage = (
  payload: unknown
): VacationRequestPageResponse => {
  const pageData = extractObject<Partial<VacationRequestPageResponse>>(payload);
  const requests = Array.isArray(pageData.requests)
    ? (pageData.requests as VacationRequestResponse[])
    : [];

  return {
    requests,
    totalPages: pageData.totalPages ?? 0,
    totalElements: pageData.totalElements ?? requests.length,
    currentPage: pageData.currentPage ?? 0,
    isFirst: pageData.isFirst ?? true,
    isLast: pageData.isLast ?? true,
  };
};

export const fetchPendingApprovals = async (
  params: PendingApprovalQueryParams
): Promise<TimeRecordApprovalPageResponse> => {
  const response = await api.get<TimeRecordApprovalPageResponse>(
    `${RECORDS_BASE_URL}/pending-approvals`,
    {
      params: {
        page: params.page,
        ...(params.employeeName && { employeeName: params.employeeName }),
      },
    }
  );

  return extractObject<TimeRecordApprovalPageResponse>(response.data) as TimeRecordApprovalPageResponse;
};

export const fetchDetailedReport = async (
  params: DetailedReportQueryParams
): Promise<DetailedReportItem[]> => {
  validateReportParams(params);
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
  params: TimeOffQueryParams
): Promise<TimeRecordPageResponse> => {
  const response = await api.get<TimeRecordPageResponse>(`${RECORDS_BASE_URL}/time-off/requests`, {
    params: {
      page: params.page,
      size: params.size,
      status: params.status,
      ...(params.employeeName && { employeeName: params.employeeName }),
    },
  });

  return extractObject<TimeRecordPageResponse>(response.data) as TimeRecordPageResponse;
};

export const approveTimeOff = async (timeRecordId: number): Promise<void> => {
  await api.patch(`${RECORDS_BASE_URL}/time-off/approve/${timeRecordId}`);
};

export const rejectTimeOff = async (timeRecordId: number): Promise<void> => {
  await api.patch(`${RECORDS_BASE_URL}/time-off/reject/${timeRecordId}`);
};

export const requestVacation = async (data: VacationRequestPayload): Promise<number[]> => {
  const response = await api.post<number[]>(`${RECORDS_BASE_URL}/vacation-request`, data);
  return extractArray<number>(response.data);
};

export const fetchVacationRequests = async (
  params: VacationQueryParams
): Promise<VacationRequestPageResponse> => {
  const response = await api.get<unknown>(`${RECORDS_BASE_URL}/vacation-request`, {
    params: {
      page: params.page,
      size: params.size,
      status: params.status,
      ...(params.employeeName && { employeeName: params.employeeName }),
    },
  });

  return extractVacationRequestPage(response.data);
};

export const approveVacationRequest = async (timeRecordIds: number[]): Promise<void> => {
  const body: VacationApprovalRequest = { timeRecordIds };
  await api.patch(`${RECORDS_BASE_URL}/vacation-request/approve`, body);
};

export const rejectVacationRequest = async (timeRecordIds: number[]): Promise<void> => {
  const body: VacationApprovalRequest = { timeRecordIds };
  await api.patch(`${RECORDS_BASE_URL}/vacation-request/reject`, body);
};

export const fetchManagerOptions = async (): Promise<ManagerOption[]> => {
  const response = await api.get<UserSearchListResponse>(buildRoute(API_ROUTES.USERS, "search"), {
    params: { active: true },
  });

  return extractArray<UserSearchListItem>(response.data, ["users"])
    .filter((user) => user.role === "MANAGER")
    .map((user): ManagerOption => ({
      userId: user.userId,
      username: user.username,
    }));
};

export const fetchPendingVacationCount = async (): Promise<number> => {
  const response = await api.get<unknown>(`${RECORDS_BASE_URL}/vacation-request`, {
    params: {
      page: 0,
      size: 1,
      status: "PENDING",
    },
  });

  const pageData = extractVacationRequestPage(response.data);
  return pageData.totalElements ?? EMPTY_VACATION_REQUEST_PAGE.totalElements;
};

export const fetchReportEmployees = async (active = true): Promise<Employee[]> => {
  const response = await api.get<{ employees?: Employee[] }>(`/${API_ROUTES.EMPLOYEE}`, {
    params: { active },
  });

  return extractArray<Employee>(response.data, ["employees"]);
};
