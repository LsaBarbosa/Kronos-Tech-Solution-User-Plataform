import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, AlertCircle } from 'lucide-react'
import type { ConsentHistoryResponse } from '@/types/legal'
import { getConsentHistory } from '@/service/terms.service'
import { toast } from '@/hooks/use-toast'
import { getServiceErrorMessage } from '@/service/helpers/service-error.helper'

const ConsentHistoryCard: React.FC = () => {
  const [consents, setConsents] = useState<ConsentHistoryResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConsentHistory()
  }, [])

  const fetchConsentHistory = async () => {
    try {
      setLoading(true)
      const data = await getConsentHistory()
      setConsents(data.sort((a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime()))
    } catch (error) {
      toast.error(
        getServiceErrorMessage(error, 'Erro ao carregador histórico de consentimentos.')
      )
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    return status === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getConsentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BIOMETRIC_AUTHENTICATION: 'Autenticação Biométrica',
      SERVICE_TERMS: 'Termos de Serviço',
      PRIVACY_POLICY: 'Política de Privacidade',
    }
    return labels[type] || type
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <div>
            <CardTitle>Histórico de Consentimentos</CardTitle>
            <CardDescription>
              Acompanhe todos os seus consentimentos e quando foram aceitos ou revogados
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando histórico...
          </div>
        ) : consents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum consentimento registrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {consents.map((consent) => (
              <div
                key={consent.consentId}
                className="border rounded-lg p-4 space-y-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {getConsentTypeLabel(consent.type)}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{consent.purpose}</p>
                  </div>
                  <Badge className={getStatusColor(consent.status)}>
                    {consent.status === 'ATIVO' ? 'Ativo' : 'Revogado'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Versão</p>
                    <p className="font-medium">{consent.version}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Data de Aceite</p>
                    <p className="font-medium">{formatDate(consent.grantedAt)}</p>
                  </div>
                </div>

                {consent.revokedAt && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Data de Revogação</p>
                    <p className="text-sm font-medium">{formatDate(consent.revokedAt)}</p>
                  </div>
                )}

                {consent.hasEvidenceDocument && (
                  <div className="pt-2 border-t bg-blue-50 rounded p-2">
                    <p className="text-xs text-blue-700 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Documento de evidência disponível no seu histórico de documentos
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ConsentHistoryCard
