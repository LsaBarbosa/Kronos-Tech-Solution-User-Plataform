import { api } from "@/config/api";
import { throwServiceError } from "@/service/helpers/service-error.helper";
import { mapUserProfile, unwrapList, unwrapObject } from "@/service/helpers/response-normalizer.helper";
import { ITimeRecordApprovalPageResponse } from "@/types/recordApproval";
import { WarningMessage } from "@/types/dashboard";
import { UserData } from "@/types/user";

const mapPendingApprovalsResponse = (payload: unknown): ITimeRecordApprovalPageResponse => {
  const data = unwrapObject(payload, "Aprovações pendentes");

  return {
    approvals: Array.isArray(data.approvals) ? (data.approvals as ITimeRecordApprovalPageResponse["approvals"]) : [],
    totalPages: typeof data.totalPages === "number" ? data.totalPages : 0,
    totalElements: typeof data.totalElements === "number" ? data.totalElements : 0,
    currentPage: typeof data.currentPage === "number" ? data.currentPage : 0,
    isFirst: typeof data.isFirst === "boolean" ? data.isFirst : true,
    isLast: typeof data.isLast === "boolean" ? data.isLast : true,
  };
};

const mapWarningMessage = (payload: unknown): WarningMessage => {
  const data = unwrapObject(payload, "Mensagem de aviso");

  return {
    ...data,
    messageId: typeof data.messageId === "string" ? data.messageId : "",
    createdAt: typeof data.createdAt === "string" ? data.createdAt : "",
    title: typeof data.title === "string" ? data.title : "",
    priority: typeof data.priority === "string" ? data.priority : "",
  } as WarningMessage;
};

export const fetchUserProfile = async (): Promise<UserData> => {
  try {
    const { data } = await api.get("employee/own-profile");
    return mapUserProfile(data);
  } catch (error) {
    throwServiceError(error, "Não foi possível carregar o perfil do usuário.");
  }
};

export const fetchPendingApprovalsCount = async (): Promise<ITimeRecordApprovalPageResponse> => {
  try {
    const { data } = await api.get("records/pending-approvals");
    return mapPendingApprovalsResponse(data);
  } catch (error) {
    throwServiceError(error, "Não foi possível carregar as aprovações pendentes.");
  }
};

export const fetchAllWarnings = async (): Promise<WarningMessage[]> => {
  try {
    const { data } = await api.get("messages");
    const warnings = unwrapList(data, ["messages", "warnings"], "Avisos do dashboard");
    return warnings.map((warning) => mapWarningMessage(warning));
  } catch (error) {
    throwServiceError(error, "Não foi possível carregar os avisos.");
  }
};

export const updateLastSeenMessageTimestamp = async (): Promise<void> => {
  try {
    await api.post("employee/mark-messages-seen", {});
  } catch (error) {
    throwServiceError(error, "Não foi possível atualizar a leitura dos avisos.");
  }
};
