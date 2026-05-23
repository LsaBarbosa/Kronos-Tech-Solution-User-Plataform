import React, { useState } from 'react'
import { SecurityIncidentReportResponse } from '@/service/security.service'

interface SecurityIncidentReportViewerProps {
  report: SecurityIncidentReportResponse
  onDownloadPdf?: () => Promise<void>
  loading?: boolean
}

export const SecurityIncidentReportViewer: React.FC<SecurityIncidentReportViewerProps> = ({
  report,
  onDownloadPdf,
  loading = false,
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const handleDownloadPdf = async () => {
    if (!onDownloadPdf) return

    try {
      setDownloadingPdf(true)
      await onDownloadPdf()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao baixar PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('pt-BR')
  }

  const formatImpact = (impact: string | null | undefined) => {
    if (!impact) return '-'
    const levels: Record<string, string> = {
      NONE: 'Sem impacto',
      LOW: 'Baixo',
      MEDIUM: 'Médio',
      HIGH: 'Alto',
      CRITICAL: 'Crítico',
    }
    return levels[impact] || impact
  }

  return (
    <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatório de Incidente</h2>
        {onDownloadPdf && (
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf || loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {downloadingPdf ? 'Baixando...' : 'Baixar PDF'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>ID do Incidente:</strong>
          <p>{report.incidentId}</p>
        </div>
        <div>
          <strong>Título:</strong>
          <p>{report.title}</p>
        </div>
      </div>

      <div>
        <strong>Descrição:</strong>
        <p className="mt-1 p-3 bg-white border rounded">{report.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Severidade:</strong>
          <p>{report.severity}</p>
        </div>
        <div>
          <strong>Status:</strong>
          <p>{report.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <strong>Data Detectada:</strong>
          <p>{formatDate(report.detectedAt as any)}</p>
        </div>
        <div>
          <strong>Data Confirmada:</strong>
          <p>{formatDate(report.confirmedAt as any)}</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-bold text-lg mb-3">Avaliação de Risco</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Categorias de Dados:</strong>
            <p className="mt-1 p-2 bg-white border rounded text-sm">{report.dataCategories || '-'}</p>
          </div>
          <div>
            <strong>Causa:</strong>
            <p className="mt-1 p-2 bg-white border rounded text-sm">{report.incidentCause || '-'}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <strong>Impacto Confidencialidade:</strong>
            <p className="text-red-600 font-semibold">
              {formatImpact(report.confidentialityImpact as any)}
            </p>
          </div>
          <div>
            <strong>Impacto Integridade:</strong>
            <p className="text-orange-600 font-semibold">
              {formatImpact(report.integrityImpact as any)}
            </p>
          </div>
          <div>
            <strong>Impacto Disponibilidade:</strong>
            <p className="text-yellow-600 font-semibold">
              {formatImpact(report.availabilityImpact as any)}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <strong>Risco aos Titulares:</strong>
          <p className="mt-1 p-3 bg-white border rounded text-sm">
            {report.riskToSubjects || '-'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <strong>Comunicação ANPD Necessária:</strong>
            <p className={report.communicationRequired ? 'text-red-600 font-bold' : 'text-green-600'}>
              {report.communicationRequired ? 'SIM' : 'NÃO'}
            </p>
          </div>
          <div>
            <strong>Sujeitos Afetados (Estimativa):</strong>
            <p>{report.affectedSubjectsEstimate || '-'}</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-bold text-lg mb-3">Ações de Correção</h3>

        <div>
          <strong>Ações de Contenção:</strong>
          <p className="mt-1 p-3 bg-white border rounded text-sm whitespace-pre-wrap">
            {report.containmentActions || '-'}
          </p>
        </div>

        <div className="mt-4">
          <strong>Ações Corretivas:</strong>
          <p className="mt-1 p-3 bg-white border rounded text-sm whitespace-pre-wrap">
            {report.correctiveActions || '-'}
          </p>
        </div>

        <div className="mt-4">
          <strong>Links de Evidência:</strong>
          <p className="mt-1 p-3 bg-white border rounded text-sm">
            {report.evidenceLinks ? (
              <a href={report.evidenceLinks} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                {report.evidenceLinks}
              </a>
            ) : (
              '-'
            )}
          </p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-bold text-lg mb-3">Notificações</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>ANPD Notificada em:</strong>
            <p>{formatDate(report.notifiedAnpdAt as any)}</p>
          </div>
          <div>
            <strong>Titulares Notificados em:</strong>
            <p>{formatDate(report.notifiedSubjectsAt as any)}</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 text-xs text-gray-600">
        <p>
          <strong>Gerado em:</strong> {formatDate(report.generatedAt as any)}
        </p>
        <p>
          <strong>Gerado por:</strong> {report.generatedByUserId}
        </p>
      </div>
    </div>
  )
}
