import React from 'react';
import { AnonymizationConsolidatedResultResponse, AnonymizationDomainResultResponse } from '../../service/lgpd.service';

interface AnonymizationResultSummaryProps {
  result: AnonymizationConsolidatedResultResponse;
  onClose?: () => void;
}

const statusColors = {
  SUCCESS: 'bg-green-100 border-green-400 text-green-800',
  PARTIAL_SUCCESS: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  FAILED: 'bg-red-100 border-red-400 text-red-800',
  BLOCKED: 'bg-gray-100 border-gray-400 text-gray-800',
};

const statusLabels = {
  SUCCESS: 'Sucesso Completo',
  PARTIAL_SUCCESS: 'Sucesso Parcial',
  FAILED: 'Falha',
  BLOCKED: 'Bloqueado',
};

export const AnonymizationResultSummary: React.FC<AnonymizationResultSummaryProps> = ({
  result,
  onClose,
}) => {
  const statusColor = statusColors[result.consolidatedStatus as keyof typeof statusColors] || statusColors.FAILED;
  const statusLabel = statusLabels[result.consolidatedStatus as keyof typeof statusLabels] || 'Desconhecido';

  const getDurationSeconds = () => {
    return (result.durationMs / 1000).toFixed(2);
  };

  const getDomainStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return '✓';
      case 'ERROR':
      case 'FAILED':
        return '✗';
      case 'PARTIAL':
        return '⚠';
      default:
        return '−';
    }
  };

  const getDomainStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600';
      case 'ERROR':
      case 'FAILED':
        return 'text-red-600';
      case 'PARTIAL':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold text-gray-800">Resultado da Anonimização</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Fechar"
          >
            ✕
          </button>
        )}
      </div>

      {/* Status Badge */}
      <div className={`border-2 rounded-lg p-4 ${statusColor}`}>
        <div className="flex items-center space-x-3">
          <div className="text-2xl font-bold">{statusLabel}</div>
          <div className="text-sm">
            {result.executionMode === 'DRY_RUN' ? '(Simulação)' : '(Executado)'}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Escaneados</div>
          <div className="text-2xl font-bold text-blue-600">{result.summary.totalScanned}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Afetados</div>
          <div className="text-2xl font-bold text-green-600">{result.summary.totalAffected}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Preservados</div>
          <div className="text-2xl font-bold text-gray-600">{result.summary.totalSkipped}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Erros</div>
          <div className="text-2xl font-bold text-red-600">{result.summary.totalErrors}</div>
        </div>
      </div>

      {/* Execution Details */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Modo de Execução:</span>
          <span className="font-semibold text-gray-800">{result.executionMode}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Duração:</span>
          <span className="font-semibold text-gray-800">{getDurationSeconds()}s</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Iniciado:</span>
          <span className="font-semibold text-gray-800">
            {new Date(result.startedAt).toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Domain Breakdown */}
      {result.domainResults && result.domainResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800">Detalhes por Domínio</h3>
          <div className="space-y-2">
            {result.domainResults.map((domain: AnonymizationDomainResultResponse, idx: number) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${getDomainStatusColor(domain.status)}`}>
                      {getDomainStatusIcon(domain.status)}
                    </span>
                    <span className="font-semibold text-gray-800">{domain.resourceType}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-700">
                    {domain.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Escaneados:</span>
                    <div className="font-semibold text-gray-800">{domain.scanned}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Afetados:</span>
                    <div className="font-semibold text-gray-800">{domain.affected}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Preservados:</span>
                    <div className="font-semibold text-gray-800">{domain.skipped}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Erros:</span>
                    <div className="font-semibold text-gray-800">{domain.errorCount}</div>
                  </div>
                </div>
                {domain.notes && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 rounded p-2">
                    {domain.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failed Domains */}
      {result.failedDomains && result.failedDomains.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Domínios com Falha</h3>
          <div className="flex flex-wrap gap-2">
            {result.failedDomains.map((domain: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-semibold"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Avisos</h3>
          <ul className="space-y-1 text-sm text-yellow-800">
            {result.warnings.map((warning: string, idx: number) => (
              <li key={idx} className="flex items-start space-x-2">
                <span>•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Ações Recomendadas</h3>
        <ul className="space-y-1 text-sm text-blue-800 list-disc list-inside">
          {result.consolidatedStatus === 'SUCCESS' && (
            <li>Anonimização concluída com sucesso. Você pode agora finalizar a solicitação.</li>
          )}
          {result.consolidatedStatus === 'PARTIAL_SUCCESS' && (
            <li>Alguns domínios falharam. Revise os detalhes acima e ajuste conforme necessário.</li>
          )}
          {result.consolidatedStatus === 'FAILED' && (
            <li>Anonimização falhou. Verifique os erros e tente novamente.</li>
          )}
          {result.consolidatedStatus === 'BLOCKED' && (
            <li>Anonimização foi bloqueada por razões de segurança. Contate o administrador.</li>
          )}
        </ul>
      </div>
    </div>
  );
};
