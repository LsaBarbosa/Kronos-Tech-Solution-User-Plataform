import { api } from '@/config/api';
import { ITimeRecordApprovalPageResponse } from '@/types/recordApproval';
import { WarningMessage } from '@/types/dashboard';
import { UserData } from '@/types/user';

export const fetchUserProfile = async (): Promise<UserData> => {
  const { data } = await api.get<UserData>('employee/own-profile');
  return data;
};

export const fetchPendingApprovalsCount = async (): Promise<ITimeRecordApprovalPageResponse> => {
  const { data } = await api.get<ITimeRecordApprovalPageResponse>('records/pending-approvals');
  return data;
};

export const fetchAllWarnings = async (): Promise<WarningMessage[]> => {
  const { data } = await api.get<WarningMessage[]>('messages');
  return data;
};

export const updateLastSeenMessageTimestamp = async (): Promise<void> => {
  await api.post('employee/mark-messages-seen', {});
};
