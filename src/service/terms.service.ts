import { api } from '@/config/api'
import type { BiometricConsentStatus, ConsentHistoryResponse, CurrentLegalTextResponse } from '@/types/legal'

const TERMS_BASE = 'terms'

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

export const checkTermsStatus = async (): Promise<BiometricConsentStatus> => {
  const response = await api.get<BiometricConsentStatus>(
    `${TERMS_BASE}/status`
  )
  return response.data
}

export const acceptBiometricTerms = async (payload: {
  version: string
  contentHashSha256: string
}): Promise<BiometricConsentStatus> => {
  const response = await api.post<BiometricConsentStatus>(`${TERMS_BASE}/accept-biometric`, payload)
  if (response.status !== 200) {
    throw new Error('Falha ao registrar o aceite do termo.')
  }
  return response.data
}

export const revokeBiometricTerms = async (): Promise<BiometricConsentStatus> => {
  const response = await api.delete<BiometricConsentStatus>(`${TERMS_BASE}/revoke-biometric`)
  if (response.status !== 200) {
    throw new Error('Falha ao revogar o consentimento biométrico.')
  }
  return response.data
}
