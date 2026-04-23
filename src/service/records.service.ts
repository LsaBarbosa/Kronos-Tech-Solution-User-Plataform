import { api } from "@/config/api";
import { extractArray, extractObject } from "@/service/helpers/response-normalizer.helper";
import {
  IManagerOption,
  IRequestTimeOffData,
  ITimeOffQueryParams,
  ITimeRecordApprovalPageResponse,
  ITimeRecordPageResponse,
  IPendingApprovalQueryParams,
} from "@/types/recordApproval";
import {
  IRequestVacationRequest,
  IVacationApprovalRequest,
  IVacationQueryParams,
  IVacationRequestResponse,
} from "@/types/vacation";

const RECORDS_BASE_URL = "/records";

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

export const approveTimeRecordChange = async (timeRecordId: number): Promise<void> => {
  await api.patch(`${RECORDS_BASE_URL}/approve/${timeRecordId}`);
};

export const rejectTimeRecordChange = async (timeRecordId: number): Promise<void> => {
  await api.patch(`${RECORDS_BASE_URL}/reject/${timeRecordId}`);
};

export const requestTimeOff = async (
  requestData: IRequestTimeOffData,
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
  const response = await api.get<{ users?: any[] }>("/users/search", {
    params: { active: true },
  });

  return extractArray<any>(response.data, ["users"])
    .filter((user: any) => user.role === "MANAGER")
    .map((user: any) => ({
      userId: user.userId,
      username: user.username,
    })) as IManagerOption[];
};

export const fetchPendingVacationCount = async (): Promise<number> => {
  const response = await api.get(`${RECORDS_BASE_URL}/vacation-request`, {
    params: {
      page: 0,
      size: 500,
      status: "PENDING",
    },
  });

  return extractArray(response.data).length;
};
