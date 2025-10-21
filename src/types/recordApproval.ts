// src/types/recordApproval.ts

/**
 * Interface para os dados da solicitação pendente.
 */
export interface PendingApproval {
  timeRecordId: number;
  partnerName: string;
  managerUsername: string;
  newStartWork: string;
  newEndWork: string;
  currentStartWork: string;
  currentEndWork: string;
}

/**
 * Interface para padronizar o objeto de erro da API.
 */
export interface ApiErrorResponse {
  status: number;
  title: string;
  detail: string;
  timestamp: string;
  message?: string;
}