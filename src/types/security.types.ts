// Sprint 8 - Security Incident Risk Assessment Types

export type SecurityImpactLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface SecurityIncidentRiskAssessmentRequest {
  dataCategories: string
  incidentCause: string
  confidentialityImpact: SecurityImpactLevel
  integrityImpact: SecurityImpactLevel
  availabilityImpact: SecurityImpactLevel
  riskToSubjects: string
  communicationRequired: boolean
  anpdCommunicationDeadline: Date | null
  subjectsCommunicationDeadline: Date | null
}

export interface SecurityIncidentCorrectionPlanRequest {
  containmentActions: string
  correctiveActions: string
  evidenceLinks?: string
}

export interface SecurityIncidentReportResponse {
  reportId: string
  incidentId: string
  title: string
  description: string
  detectedAt: string
  confirmedAt: string | null
  severity: string
  personalDataInvolved: boolean
  sensitiveDataInvolved: boolean
  affectedSubjectsEstimate: number | null
  status: string
  dataCategories: string | null
  incidentCause: string | null
  confidentialityImpact: SecurityImpactLevel | null
  integrityImpact: SecurityImpactLevel | null
  availabilityImpact: SecurityImpactLevel | null
  riskToSubjects: string | null
  communicationRequired: boolean | null
  anpdCommunicationDeadline: string | null
  subjectsCommunicationDeadline: string | null
  containmentActions: string | null
  correctiveActions: string | null
  evidenceLinks: string | null
  notifiedAnpdAt: string | null
  notifiedSubjectsAt: string | null
  generatedAt: string
  generatedByUserId: string
}

export interface SecurityIncidentResponse {
  incidentId: string
  title: string
  description: string
  detectedAt: string
  confirmedAt: string | null
  severity: string
  personalDataInvolved: boolean
  sensitiveDataInvolved: boolean
  affectedSubjectsEstimate: number | null
  status: string
  notifiedAnpdAt: string | null
  notifiedSubjectsAt: string | null
  createdByUserId: string
  createdAt: string
  updatedAt: string
  incidentConfirmed: boolean
  dataCategories: string | null
  incidentCause: string | null
  confidentialityImpact: SecurityImpactLevel | null
  integrityImpact: SecurityImpactLevel | null
  availabilityImpact: SecurityImpactLevel | null
  riskToSubjects: string | null
  communicationRequired: boolean | null
  anpdCommunicationDeadline: string | null
  subjectsCommunicationDeadline: string | null
  containmentActions: string | null
  correctiveActions: string | null
  evidenceLinks: string | null
}
