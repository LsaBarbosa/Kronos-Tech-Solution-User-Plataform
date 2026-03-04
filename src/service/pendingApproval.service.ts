import { api } from "@/config/api";
import {
  ITimeRecordApprovalPageResponse,
  IPendingApprovalQueryParams,
  ITimeOffQueryParams,
  ITimeRecordPageResponse,
  IRequestTimeOffData,
} from "@/types/recordApproval";

const BASE_URL = "records";

export const fetchPendingApprovals = async (params: IPendingApprovalQueryParams): Promise<ITimeRecordApprovalPageResponse> => {
  const response = await api.get(`${BASE_URL}/pending-approvals`, { params });
  return response.data;
};

export const approveTimeRecordChange = async (timeRecordId: number): Promise<void> => {
  await api.patch(`${BASE_URL}/approve/${timeRecordId}`);
};

export const rejectTimeRecordChange = async (timeRecordId: number): Promise<void> => {
  await api.patch(`${BASE_URL}/reject/${timeRecordId}`);
};

export const requestTimeOff = async (requestData: IRequestTimeOffData, document?: File): Promise<number> => {
  const formData = new FormData();
  formData.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }), 'request.json');
  if (document) formData.append('document', document, document.name);

  const response = await api.post(`${BASE_URL}/time-off-request`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

export const listTimeOffRequests = async (params: ITimeOffQueryParams): Promise<ITimeRecordPageResponse> => {
  const response = await api.get(`${BASE_URL}/time-off/requests`, { params });
  return response.data;
};

export const approveTimeOff = async (timeRecordId: number): Promise<void> => {
  await api.patch(`${BASE_URL}/time-off/approve/${timeRecordId}`);
};

export const rejectTimeOff = async (timeRecordId: number): Promise<void> => {
  await api.patch(`${BASE_URL}/time-off/reject/${timeRecordId}`);
};
