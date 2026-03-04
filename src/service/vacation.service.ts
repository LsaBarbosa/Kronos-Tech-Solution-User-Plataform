import { apiFetch, parseApiResponse } from '@/config/api';
import {
  IVacationRequestResponse,
  IVacationQueryParams,
  RequestTimeOffRequestPayload,
  IVacationApprovalRequest,
  IRequestVacationRequest,
  IManagerOption,
} from '@/types/vacation';
import { format } from 'date-fns';

const BASE_URL = 'records';

export const requestVacation = async (data: IRequestVacationRequest): Promise<number[]> => {
  const response = await apiFetch(`${BASE_URL}/vacation-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseApiResponse(response);
};

export const fetchVacationRequests = async (params: IVacationQueryParams): Promise<IVacationRequestResponse[]> => {
  const query = new URLSearchParams({
    page: params.page.toString(),
    size: params.size.toString(),
    status: params.status,
    ...(params.employeeName && { employeeName: params.employeeName }),
  }).toString();

  const response = await apiFetch(`${BASE_URL}/vacation-request?${query}`);
  return parseApiResponse(response);
};

export const approveVacationRequest = async (timeRecordIds: number[]): Promise<void> => {
  const body: IVacationApprovalRequest = { timeRecordIds };

  const response = await apiFetch(`${BASE_URL}/vacation-request/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await parseApiResponse(response);
};

export const rejectVacationRequest = async (timeRecordIds: number[]): Promise<void> => {
  const body: IVacationApprovalRequest = { timeRecordIds };

  const response = await apiFetch(`${BASE_URL}/vacation-request/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  await parseApiResponse(response);
};

export const fetchManagerOptions = async (): Promise<IManagerOption[]> => {
  const response = await apiFetch('users/search?active=true');
  const data = await parseApiResponse<{ users: any[] }>(response);
  const allUsers = data.users || [];

  return allUsers
    .filter((user: any) => user.role === 'MANAGER')
    .map((user: any) => ({ userId: user.userId, username: user.username })) as IManagerOption[];
};

export const fetchPendingVacationCount = async (): Promise<number> => {
  const query = new URLSearchParams({ page: '0', size: '500', status: 'PENDING' }).toString();
  const response = await apiFetch(`${BASE_URL}/vacation-request?${query}`);
  const requests = await parseApiResponse<any[]>(response);
  return Array.isArray(requests) ? requests.length : 0;
};

export const requestTimeOff = async (
  payload: RequestTimeOffRequestPayload,
  document: File | null
): Promise<number> => {
  const formData = new FormData();
  const requestBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  formData.append('request', requestBlob, 'request.json');

  if (document) {
    formData.append('document', document);
  }

  const response = await apiFetch('records/time-off/request', {
    method: 'POST',
    body: formData,
  });

  return parseApiResponse<number>(response);
};

export const formatVacationDate = (date: string | Date): string => format(new Date(date), 'dd/MM/yyyy');
