import { api } from '@/config/api'
import type { ConsentHistoryResponse, CurrentLegalTextResponse } from '@/types/legal'

const TERMS_BASE = 'terms'

export interface TermsStatusResponse {
  accepted: boolean;
}

export const getConsentHistory = async (): Promise<ConsentHistoryResponse[]> => {
  const response = await api.get<ConsentHistoryResponse[]>(
    `${TERMS_BASE}/consents/history`
  )
  return Array.isArray(response.data) ? response.data : []
}

export const getCurrentBiometricTerm = async (): Promise<CurrentLegalTextResponse> => {
  const response = await api.get<CurrentLegalTextResponse>(
    `${TERMS_BASE}/biometric/current`
  )
  return response.data
}

export const checkTermsStatus = async (): Promise<TermsStatusResponse> => {
  const response = await api.get<TermsStatusResponse>(
    `${TERMS_BASE}/status`
  )
  return response.data
}

export const acceptBiometricTerms = async (payload: {
  version: string
  contentHashSha256: string
}): Promise<void> => {
  const response = await api.post(`${TERMS_BASE}/accept-biometric`, payload)
  if (response.status !== 204) {
    throw new Error('Falha ao registrar o aceite do termo.')
  }
}

export const revokeBiometricTerms = async (): Promise<void> => {
  const response = await api.delete(`${TERMS_BASE}/revoke-biometric`)
  if (response.status !== 204) {
    throw new Error('Falha ao revogar o consentimento biométrico.')
  }
}
