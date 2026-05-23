export type ConsentType = 'BIOMETRIC_AUTHENTICATION' | 'SERVICE_TERMS' | 'PRIVACY_POLICY'

export type LegalBasis = 'CONSENT' | 'LEGAL_OBLIGATION' | 'LEGITIMATE_INTEREST'

export interface ConsentHistoryResponse {
  consentId: string
  type: ConsentType
  legalBasis: LegalBasis
  version: string
  purpose: string
  grantedAt: string
  revokedAt: string | null
  status: 'ATIVO' | 'REVOGADO'
  hasEvidenceDocument: boolean
  evidenceDocumentId: string | null
  acceptedFrom: string
  revokedFrom: string | null
}

export interface CurrentLegalTextResponse {
  documentType: string
  version: string
  title: string
  content: string
  contentHashSha256: string
  active: boolean
}
