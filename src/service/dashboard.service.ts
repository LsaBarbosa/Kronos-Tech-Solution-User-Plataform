import { api } from "@/config/api";
import { ITimeRecordApprovalPageResponse } from "@/types/recordApproval";
import { WarningMessage } from "@/types/dashboard";

export const fetchPendingApprovalsCount = async (): Promise<ITimeRecordApprovalPageResponse> => {
  const { data } = await api.get("records/pending-approvals");
  return data as ITimeRecordApprovalPageResponse;
};

export const fetchAllWarnings = async (): Promise<WarningMessage[]> => {
  const { data } = await api.get("messages");
  return data as WarningMessage[];
};

export const updateLastSeenMessageTimestamp = async (): Promise<void> => {
  await api.post("employee/mark-messages-seen", {});
};
