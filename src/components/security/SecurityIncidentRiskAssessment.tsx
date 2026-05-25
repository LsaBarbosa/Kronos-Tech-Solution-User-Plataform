import React, { useState } from 'react'
import type { SecurityIncidentRiskAssessmentRequest } from '@/service/security.service'
import type { SecurityImpactLevel } from '@/types/security.types'

interface SecurityIncidentRiskAssessmentProps {
  incidentId: string
  onRiskEvaluated: (assessment: SecurityIncidentRiskAssessmentRequest) => Promise<void>
  loading?: boolean
}

export const SecurityIncidentRiskAssessment: React.FC<SecurityIncidentRiskAssessmentProps> = ({
  incidentId,
  onRiskEvaluated,
  loading = false,
}) => {
  const [dataCategories, setDataCategories] = useState('')
  const [incidentCause, setIncidentCause] = useState('')
  const [confidentialityImpact, setConfidentialityImpact] = useState<SecurityImpactLevel>('MEDIUM')
  const [integrityImpact, setIntegrityImpact] = useState<SecurityImpactLevel>('MEDIUM')
  const [availabilityImpact, setAvailabilityImpact] = useState<SecurityImpactLevel>('MEDIUM')
  const [riskToSubjects, setRiskToSubjects] = useState('')
  const [communicationRequired, setCommunicationRequired] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const impactLevels: SecurityImpactLevel[] = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!dataCategories.trim()) {
      setError('Categorias de dados são obrigatórias')
      return
    }

    if (!incidentCause.trim()) {
      setError('Causa do incidente é obrigatória')
      return
    }

    if (!riskToSubjects.trim()) {
      setError('Risco aos titulares é obrigatório')
      return
    }

    try {
      setSubmitting(true)
      const assessment: SecurityIncidentRiskAssessmentRequest = {
        dataCategories: dataCategories.trim(),
        incidentCause: incidentCause.trim(),
        confidentialityImpact,
        integrityImpact,
        availabilityImpact,
        riskToSubjects: riskToSubjects.trim(),
        communicationRequired,
        anpdCommunicationDeadline: null,
        subjectsCommunicationDeadline: null,
      }

      await onRiskEvaluated(assessment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao avaliar risco')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg">Avaliação de Risco</h3>

      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block font-medium mb-2">Categorias de Dados Envolvidas</label>
        <input
          type="text"
          value={dataCategories}
          onChange={(e) => setDataCategories(e.target.value)}
          placeholder="Ex: Dados Pessoais, Dados Sensíveis, Dados Financeiros"
          className="w-full p-2 border rounded"
          disabled={submitting || loading}
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Causa do Incidente</label>
        <textarea
          value={incidentCause}
          onChange={(e) => setIncidentCause(e.target.value)}
          placeholder="Descrição detalhada da causa do incidente"
          rows={3}
          className="w-full p-2 border rounded"
          disabled={submitting || loading}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block font-medium mb-2">Impacto Confidencialidade</label>
          <select
            value={confidentialityImpact}
            onChange={(e) => setConfidentialityImpact(e.target.value as SecurityImpactLevel)}
            className="w-full p-2 border rounded"
            disabled={submitting || loading}
          >
            {impactLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-2">Impacto Integridade</label>
          <select
            value={integrityImpact}
            onChange={(e) => setIntegrityImpact(e.target.value as SecurityImpactLevel)}
            className="w-full p-2 border rounded"
            disabled={submitting || loading}
          >
            {impactLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-2">Impacto Disponibilidade</label>
          <select
            value={availabilityImpact}
            onChange={(e) => setAvailabilityImpact(e.target.value as SecurityImpactLevel)}
            className="w-full p-2 border rounded"
            disabled={submitting || loading}
          >
            {impactLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2">Risco aos Titulares de Dados</label>
        <textarea
          value={riskToSubjects}
          onChange={(e) => setRiskToSubjects(e.target.value)}
          placeholder="Descrição do risco potencial aos indivíduos afetados"
          rows={3}
          className="w-full p-2 border rounded"
          disabled={submitting || loading}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="communicationRequired"
          checked={communicationRequired}
          onChange={(e) => setCommunicationRequired(e.target.checked)}
          disabled={submitting || loading}
          className="w-4 h-4"
        />
        <label htmlFor="communicationRequired" className="font-medium">
          Comunicação com ANPD necessária
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting || loading}
        className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? 'Avaliando risco...' : 'Avaliar Risco'}
      </button>
    </form>
  )
}
