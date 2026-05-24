export type ConsentType = 'BIOMETRIC_AUTHENTICATION' | 'SERVICE_TERMS' | 'PRIVACY_POLICY'

export type LegalBasis = 'CONSENT' | 'LEGAL_OBLIGATION' | 'LEGITIMATE_INTEREST' | 'CONTRACT' | 'VITAL_INTERESTS' | 'PUBLIC_TASK' | 'LEGITIMATE_INTERESTS'

export type DataCategory = 'IDENTIFICATION' | 'CONTACT' | 'EMPLOYMENT' | 'PAYROLL' | 'WORK_SCHEDULE' | 'TIME_RECORD' | 'GEOLOCATION' | 'BIOMETRIC' | 'DOCUMENT' | 'MESSAGE' | 'SECURITY_LOG' | 'LEGAL_CONSENT' | 'LGPD_REQUEST' | 'COMPANY' | 'USER_ACCOUNT'

export interface DataProcessingPurpose {
  code: string
  dataCategory: DataCategory
  legalBasis: LegalBasis
  purpose: string
  retentionPolicyCode: string
  sensitive: boolean
  active: boolean
}

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

export interface LgpdExportManifest {
  exportId: string
  exportedAt: string
  requestedByUserId?: string
  targetEmployeeId?: string
  includePreciseGeolocation: boolean
  sections: string[]
  warnings?: string[]
}

export interface ExportedEmployee {
  employeeId: string
  fullName: string
  cpf?: string
  pis?: string
  jobPosition: string
  email: string
  salary?: number
  phone?: string
  birthDate?: string
  mothersName?: string
  nationality?: string
  maritalStatus?: string
  educationLevel?: string
  address?: ExportedAddress
  createdAt?: string
  updatedAt?: string
}

export interface ExportedAddress {
  street: string
  number: string
  zipCode: string
  city: string
  state: string
  country?: string
  complement?: string
}

export interface ExportedUser {
  userId: string
  username: string
  email: string
  role: string
  createdAt?: string
}

export interface ExportedCompany {
  companyId: string
  cnpj: string
  tradeName: string
  legalName?: string
  email?: string
  phone?: string
}

export interface ExportedDocumentMetadata {
  documentId: string
  type: string
  fileName: string
  contentType: string
  checksum: string
  uploadedAt: string
  sizeBytes?: number
}

export interface ExportedTimeRecord {
  recordId: string
  recordDate: string
  startTime: string
  endTime?: string
  breakDuration?: number
  status: string
  notes?: string
  latitude?: number
  longitude?: number
}

export interface ExportedMessage {
  messageId: string
  title: string
  priority: string
  sendDate: string
  readDate?: string
  senderName?: string
  content?: string
}

export interface ExportedAuditLog {
  logId: string
  action: string
  timestamp: string
  resourceType: string
  resourceId?: string
  details?: string
}

export interface ExportedLegalConsent {
  consentId: string
  type: ConsentType
  status: string
  grantedAt: string
  revokedAt?: string
  version?: string
  purpose?: string
}

export interface ExportedBiometricStatus {
  hasFaceImage: boolean
  hasActiveBiometricConsent: boolean
  biometricAuthenticationEnabled: boolean
  biometricConsentDocuments: number
}

export interface LgpdEmployeeExportResponse {
  manifest: LgpdExportManifest
  employee?: ExportedEmployee
  user?: ExportedUser
  company?: ExportedCompany
  documents?: ExportedDocumentMetadata[]
  timeRecords?: ExportedTimeRecord[]
  messages?: ExportedMessage[]
  auditLogs?: ExportedAuditLog[]
  legalConsents?: ExportedLegalConsent[]
  biometricStatus?: ExportedBiometricStatus
  exportedAt?: string
}
