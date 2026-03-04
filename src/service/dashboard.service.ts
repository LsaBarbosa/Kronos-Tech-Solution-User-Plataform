// src/services/dashboardService.ts

import { apiFetch, parseApiResponse } from '@/config/api';
import { ITimeRecordApprovalPageResponse } from '@/types/recordApproval';
import { WarningMessage } from '@/types/dashboard';
import { UserData } from '@/types/user';

export const fetchUserProfile = async (): Promise<UserData> => {
  const response = await apiFetch('employee/own-profile');
  return parseApiResponse<UserData>(response);
};

export const fetchPendingApprovalsCount = async (): Promise<ITimeRecordApprovalPageResponse> => {
  const response = await apiFetch('records/pending-approvals');
  return parseApiResponse<ITimeRecordApprovalPageResponse>(response);
};

export const fetchAllWarnings = async (): Promise<WarningMessage[]> => {
  const response = await apiFetch('messages');
  return parseApiResponse<WarningMessage[]>(response);
};

export const updateLastSeenMessageTimestamp = async (): Promise<void> => {
  const response = await apiFetch('employee/mark-messages-seen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  await parseApiResponse(response);
};
