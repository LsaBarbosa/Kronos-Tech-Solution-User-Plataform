// src/services/recordApproval.service.ts

import { apiFetch, parseApiResponse } from '@/config/api';
import {
  ITimeRecordApprovalPageResponse,
  IPendingApprovalQueryParams,
  ITimeOffQueryParams,
  ITimeRecordPageResponse,
  IRequestTimeOffData,
} from '@/types/recordApproval';

const BASE_URL = 'records';

export const fetchPendingApprovals = async (
  params: IPendingApprovalQueryParams
): Promise<ITimeRecordApprovalPageResponse> => {
  const query = new URLSearchParams({
    page: params.page.toString(),
    ...(params.employeeName && { employeeName: params.employeeName }),
  }).toString();

  const response = await apiFetch(`${BASE_URL}/pending-approvals?${query}`);
  return parseApiResponse(response);
};

export const approveTimeRecordChange = async (timeRecordId: number): Promise<void> => {
  const response = await apiFetch(`${BASE_URL}/approve/${timeRecordId}`, { method: 'PATCH' });
  await parseApiResponse(response);
};

export const rejectTimeRecordChange = async (timeRecordId: number): Promise<void> => {
  const response = await apiFetch(`${BASE_URL}/reject/${timeRecordId}`, { method: 'PATCH' });
  await parseApiResponse(response);
};

export const requestTimeOff = async (requestData: IRequestTimeOffData, document?: File): Promise<number> => {
  const formData = new FormData();
  const jsonRequest = JSON.stringify(requestData);
  formData.append('request', new Blob([jsonRequest], { type: 'application/json' }), 'request.json');

  if (document) {
    formData.append('document', document, document.name);
  }

  const response = await apiFetch(`${BASE_URL}/time-off-request`, {
    method: 'POST',
    body: formData,
  });

  return parseApiResponse<number>(response);
};

export const listTimeOffRequests = async (params: ITimeOffQueryParams): Promise<ITimeRecordPageResponse> => {
  const query = new URLSearchParams({
    page: params.page.toString(),
    size: params.size.toString(),
    status: params.status,
    ...(params.employeeName && { employeeName: params.employeeName }),
  }).toString();

  const response = await apiFetch(`${BASE_URL}/time-off/requests?${query}`);
  return parseApiResponse(response);
};

export const approveTimeOff = async (timeRecordId: number): Promise<void> => {
  const response = await apiFetch(`${BASE_URL}/time-off/approve/${timeRecordId}`, { method: 'PATCH' });
  await parseApiResponse(response);
};

export const rejectTimeOff = async (timeRecordId: number): Promise<void> => {
  const response = await apiFetch(`${BASE_URL}/time-off/reject/${timeRecordId}`, { method: 'PATCH' });
  await parseApiResponse(response);
};
