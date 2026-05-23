import React from 'react';
import { render, screen } from '@testing-library/react';
import { AnonymizationResultSummary } from '../AnonymizationResultSummary';
import { AnonymizationConsolidatedResultResponse } from '../../../service/lgpd.service';

describe('AnonymizationResultSummary', () => {
  const baseResult: AnonymizationConsolidatedResultResponse = {
    consolidatedExecutionId: '12345-67890',
    employeeId: 'emp-001',
    companyId: 'comp-001',
    consolidatedStatus: 'SUCCESS',
    executionMode: 'APPLY',
    startedAt: '2026-05-23T10:00:00Z',
    finishedAt: '2026-05-23T10:05:00Z',
    durationMs: 300000,
    summary: {
      totalScanned: 100,
      totalAffected: 100,
      totalSkipped: 0,
      totalErrors: 0,
    },
    domainResults: [
      {
        resourceType: 'TIME_RECORD',
        status: 'SUCCESS',
        scanned: 100,
        affected: 100,
        skipped: 0,
        errorCount: 0,
        notes: null,
      },
    ],
    failedDomains: [],
    warnings: ['Test warning'],
  };

  it('should render SUCCESS status correctly', () => {
    render(<AnonymizationResultSummary result={baseResult} />);

    expect(screen.getByText('Resultado da Anonimização')).toBeInTheDocument();
    expect(screen.getByText('Sucesso Completo')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument(); // totalScanned
  });

  it('should render PARTIAL_SUCCESS status', () => {
    const partialResult: AnonymizationConsolidatedResultResponse = {
      ...baseResult,
      consolidatedStatus: 'PARTIAL_SUCCESS',
      summary: {
        ...baseResult.summary,
        totalAffected: 80,
        totalErrors: 5,
      },
      failedDomains: ['DOCUMENT'],
      domainResults: [
        ...baseResult.domainResults,
        {
          resourceType: 'DOCUMENT',
          status: 'ERROR',
          scanned: 50,
          affected: 40,
          skipped: 10,
          errorCount: 5,
          notes: 'S3 connection failed',
        },
      ],
    };

    render(<AnonymizationResultSummary result={partialResult} />);

    expect(screen.getByText('Sucesso Parcial')).toBeInTheDocument();
    expect(screen.getByText('DOCUMENT')).toBeInTheDocument();
  });

  it('should render FAILED status', () => {
    const failedResult: AnonymizationConsolidatedResultResponse = {
      ...baseResult,
      consolidatedStatus: 'FAILED',
      summary: {
        totalScanned: 100,
        totalAffected: 0,
        totalSkipped: 100,
        totalErrors: 5,
      },
      failedDomains: ['TIME_RECORD'],
    };

    render(<AnonymizationResultSummary result={failedResult} />);

    expect(screen.getByText('Falha')).toBeInTheDocument();
    expect(screen.getByText('Domínios com Falha')).toBeInTheDocument();
  });

  it('should display domain details correctly', () => {
    render(<AnonymizationResultSummary result={baseResult} />);

    expect(screen.getByText('Detalhes por Domínio')).toBeInTheDocument();
    expect(screen.getByText('TIME_RECORD')).toBeInTheDocument();
  });

  it('should display warnings when present', () => {
    const resultWithWarnings: AnonymizationConsolidatedResultResponse = {
      ...baseResult,
      warnings: ['Warning 1', 'Warning 2'],
    };

    render(<AnonymizationResultSummary result={resultWithWarnings} />);

    expect(screen.getByText('Avisos')).toBeInTheDocument();
    expect(screen.getByText('Warning 1')).toBeInTheDocument();
    expect(screen.getByText('Warning 2')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onCloseMock = jest.fn();
    render(<AnonymizationResultSummary result={baseResult} onClose={onCloseMock} />);

    const closeButton = screen.getByLabelText('Fechar');
    closeButton.click();

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should display execution mode correctly', () => {
    render(<AnonymizationResultSummary result={baseResult} />);

    expect(screen.getByText('APPLY')).toBeInTheDocument();
  });

  it('should handle DRY_RUN mode', () => {
    const dryRunResult: AnonymizationConsolidatedResultResponse = {
      ...baseResult,
      executionMode: 'DRY_RUN',
    };

    render(<AnonymizationResultSummary result={dryRunResult} />);

    expect(screen.getByText('DRY_RUN')).toBeInTheDocument();
    expect(screen.getByText('(Simulação)')).toBeInTheDocument();
  });
});
