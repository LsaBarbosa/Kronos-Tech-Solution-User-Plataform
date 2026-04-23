// src/services/dashboardService.ts

import { api } from "@/config/api";
import { ITimeRecordApprovalPageResponse } from "@/types/recordApproval";
import { WarningMessage } from "@/types/dashboard"; 
// 💡 CORREÇÃO 6: Importando UserData do local correto
import { UserData } from "@/types/user";
import { extractArray, extractObject } from "@/service/helpers/response-normalizer.helper";

// --- Serviços Corrigidos ---

/**
 * Busca o perfil completo do usuário logado.
 * 💡 CORREÇÃO 7: Usando UserData como tipo de retorno.
 */
export const fetchUserProfile = async (): Promise<UserData> => {
    const response = await api.get<UserData>("/employee/own-profile");
    return extractObject<UserData>(response.data) as UserData;
};

/**
 * Busca a lista de aprovações pendentes (e retorna o array).
 * Endpoint corrigido para 'records/pending-approvals'
 */
export const fetchPendingApprovalsCount = async (): Promise<ITimeRecordApprovalPageResponse> => { // ✅ CORREÇÃO: Retorna o objeto de páginação
    const response = await api.get<ITimeRecordApprovalPageResponse>("/records/pending-approvals");
    return extractObject<ITimeRecordApprovalPageResponse>(response.data) as ITimeRecordApprovalPageResponse;
};

/**
 * Busca todos os avisos (mensagens) visíveis.
 * Endpoint corrigido para 'messages'
 */
export const fetchAllWarnings = async (): Promise<WarningMessage[]> => {
    const response = await api.get<WarningMessage[]>("/messages");
    return extractArray<WarningMessage>(response.data, ["messages"]); 
};

/**
 * Atualiza o timestamp de última visualização de avisos.
 * Endpoint corrigido para 'employee/mark-messages-seen'
 */
export const updateLastSeenMessageTimestamp = async (): Promise<void> => {
    // A API de produção usa POST para marcar como visto: employee/mark-messages-seen.
    await api.post("/employee/mark-messages-seen", {});
};
