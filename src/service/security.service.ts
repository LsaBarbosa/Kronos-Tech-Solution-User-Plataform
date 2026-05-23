import api from '@/config/api'
import { SecurityIncidentRiskAssessmentRequest, SecurityIncidentCorrectionPlanRequest, SecurityIncidentReportResponse, SecurityIncidentResponse } from '@/types/security.types'

const API_BASE = '/security-incidents'

export type { SecurityIncidentRiskAssessmentRequest, SecurityIncidentCorrectionPlanRequest, SecurityIncidentReportResponse, SecurityIncidentResponse }

export const securityService = {
  /**
   * Evaluates risk for a security incident
   */
  evaluateRisk: async (incidentId: string, request: SecurityIncidentRiskAssessmentRequest): Promise<SecurityIncidentResponse> => {
    const response = await api.post<SecurityIncidentResponse>(
      `${API_BASE}/${incidentId}/evaluate-risk`,
      {
        dataCategories: request.dataCategories,
        incidentCause: request.incidentCause,
        confidentialityImpact: request.confidentialityImpact,
        integrityImpact: request.integrityImpact,
        availabilityImpact: request.availabilityImpact,
        riskToSubjects: request.riskToSubjects,
        communicationRequired: request.communicationRequired,
        anpdCommunicationDeadline: request.anpdCommunicationDeadline,
        subjectsCommunicationDeadline: request.subjectsCommunicationDeadline,
      }
    )
    return response.data
  },

  /**
   * Submits a correction plan for a security incident
   */
  submitCorrectionPlan: async (incidentId: string, request: SecurityIncidentCorrectionPlanRequest): Promise<SecurityIncidentResponse> => {
    const response = await api.post<SecurityIncidentResponse>(
      `${API_BASE}/${incidentId}/correction-plan`,
      {
        containmentActions: request.containmentActions,
        correctiveActions: request.correctiveActions,
        evidenceLinks: request.evidenceLinks,
      }
    )
    return response.data
  },

  /**
   * Generates a report for a security incident
   */
  generateReport: async (incidentId: string): Promise<SecurityIncidentReportResponse> => {
    const response = await api.get<SecurityIncidentReportResponse>(
      `${API_BASE}/${incidentId}/report`
    )
    return response.data
  },

  /**
   * Downloads incident report as PDF
   */
  downloadReportPdf: async (incidentId: string): Promise<Blob> => {
    const response = await api.get<Blob>(
      `${API_BASE}/${incidentId}/report/pdf`,
      { responseType: 'blob' }
    )
    return response.data
  },
}
