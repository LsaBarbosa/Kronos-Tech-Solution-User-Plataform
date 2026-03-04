import { api } from "@/config/api";
import { IVacationRequestResponse, IVacationQueryParams, RequestTimeOffRequestPayload, IVacationApprovalRequest, IRequestVacationRequest, IManagerOption } from "@/types/vacation";

const BASE_URL = "records";

export const requestVacation = async (data: IRequestVacationRequest): Promise<number[]> => {
  const response = await api.post(`${BASE_URL}/vacation-request`, data);
  return response.data as number[];
};

export const fetchVacationRequests = async (params: IVacationQueryParams): Promise<IVacationRequestResponse[]> => {
  const response = await api.get(`${BASE_URL}/vacation-request`, { params });
  return response.data as IVacationRequestResponse[];
};

export const approveVacationRequest = async (timeRecordIds: number[]): Promise<void> => {
  const body: IVacationApprovalRequest = { timeRecordIds };
  await api.patch(`${BASE_URL}/vacation-request/approve`, body);
};

export const rejectVacationRequest = async (timeRecordIds: number[]): Promise<void> => {
  const body: IVacationApprovalRequest = { timeRecordIds };
  await api.patch(`${BASE_URL}/vacation-request/reject`, body);
};

export const fetchManagerOptions = async (): Promise<IManagerOption[]> => {
  const response = await api.get("users/search", { params: { active: true } });
  const allUsers = response.data.users || [];
  return allUsers
    .filter((user: any) => user.role === 'MANAGER')
    .map((user: any) => ({ userId: user.userId, username: user.username })) as IManagerOption[];
};

export const fetchPendingVacationCount = async (): Promise<number> => {
  const response = await api.get(`${BASE_URL}/vacation-request`, {
    params: { page: 0, size: 500, status: 'PENDING' },
  });
  return Array.isArray(response.data) ? response.data.length : 0;
};

export const requestTimeOff = async (payload: RequestTimeOffRequestPayload, document: File | null): Promise<number> => {
  const formData = new FormData();
  formData.append("request", new Blob([JSON.stringify(payload)], { type: "application/json" }), "request.json");
  if (document) formData.append("document", document);

  const response = await api.post("records/time-off/request", formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data as number;
};
