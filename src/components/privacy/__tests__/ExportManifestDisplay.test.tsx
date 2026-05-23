import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportManifestDisplay, { ExportManifest } from '@/components/privacy/ExportManifestDisplay';

describe('ExportManifestDisplay', () => {
  const mockManifest: ExportManifest = {
    exportedAt: new Date('2026-05-23T01:22:00').toISOString(),
    includedGeolocation: false,
    sections: ['CPF', 'CONTACT', 'SALARY', 'TIME_RECORDS'],
  };

  it('should render success card with export manifest', () => {
    const mockOnDismiss = vi.fn();

    render(
      <ExportManifestDisplay
        manifest={mockManifest}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Exportação Concluída')).toBeInTheDocument();
    expect(screen.getByText(/Seus dados foram exportados com sucesso/)).toBeInTheDocument();
  });

  it('should display export timestamp', () => {
    const mockOnDismiss = vi.fn();

    render(
      <ExportManifestDisplay
        manifest={mockManifest}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText(/Data\/Hora da Exportação/)).toBeInTheDocument();
  });

  it('should display geolocation status when not included', () => {
    const mockOnDismiss = vi.fn();

    render(
      <ExportManifestDisplay
        manifest={{ ...mockManifest, includedGeolocation: false }}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText(/Geolocalização Precisa/)).toBeInTheDocument();
    expect(screen.getByText(/Não incluída/)).toBeInTheDocument();
  });

  it('should display geolocation status when included', () => {
    const mockOnDismiss = vi.fn();

    render(
      <ExportManifestDisplay
        manifest={{ ...mockManifest, includedGeolocation: true }}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText(/Incluída/)).toBeInTheDocument();
  });

  it('should display all exported sections', () => {
    const mockOnDismiss = vi.fn();

    render(
      <ExportManifestDisplay
        manifest={mockManifest}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText(/Seções Exportadas/)).toBeInTheDocument();
    expect(screen.getByText(/CPF e documentos/)).toBeInTheDocument();
    expect(screen.getByText(/Contato e endereço/)).toBeInTheDocument();
    expect(screen.getByText(/Informações salariais/)).toBeInTheDocument();
    expect(screen.getByText(/Histórico de ponto/)).toBeInTheDocument();
  });

  it('should display security notice', () => {
    const mockOnDismiss = vi.fn();

    render(
      <ExportManifestDisplay
        manifest={mockManifest}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText(/Guarde este arquivo em local seguro/)).toBeInTheDocument();
    expect(screen.getByText(/Ele contém informações pessoais/)).toBeInTheDocument();
  });

  it('should call onDismiss when close button (X) is clicked', () => {
    const mockOnDismiss = vi.fn();

    render(
      <ExportManifestDisplay
        manifest={mockManifest}
        onDismiss={mockOnDismiss}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' }).closest('button');
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('should call onDismiss when Fechar button is clicked', () => {
    const mockOnDismiss = vi.fn();

    render(
      <ExportManifestDisplay
        manifest={mockManifest}
        onDismiss={mockOnDismiss}
      />
    );

    const fecharButton = screen.getByText('Fechar');
    fireEvent.click(fecharButton);

    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('should use localized date format', () => {
    const mockOnDismiss = vi.fn();
    const testDate = new Date('2026-05-23T14:30:00Z').toISOString();

    render(
      <ExportManifestDisplay
        manifest={{ ...mockManifest, exportedAt: testDate }}
        onDismiss={mockOnDismiss}
      />
    );

    // Should display the date (format depends on locale)
    expect(screen.getByText(/Data\/Hora da Exportação/)).toBeInTheDocument();
  });

  it('should not display personal data in manifest', () => {
    const mockOnDismiss = vi.fn();

    render(
      <ExportManifestDisplay
        manifest={mockManifest}
        onDismiss={mockOnDismiss}
      />
    );

    // Ensure no CPF numbers, emails, or PII are displayed
    const content = screen.getByText(/Exportação Concluída/).parentElement?.textContent || '';
    expect(content).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/); // CPF format
    expect(content).not.toMatch(/@/); // Email
  });

  it('should handle empty sections array', () => {
    const mockOnDismiss = vi.fn();

    render(
      <ExportManifestDisplay
        manifest={{ ...mockManifest, sections: [] }}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText(/Seções Exportadas/)).toBeInTheDocument();
  });

  it('should handle all section types', () => {
    const mockOnDismiss = vi.fn();
    const allSections: ExportManifest = {
      ...mockManifest,
      sections: [
        'CPF',
        'CONTACT',
        'SALARY',
        'DOCUMENTS',
        'TIME_RECORDS',
        'MESSAGES',
        'AUDIT_LOGS',
        'CONSENTS',
        'GEOLOCATION',
      ],
    };

    render(
      <ExportManifestDisplay
        manifest={allSections}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText(/CPF e documentos/)).toBeInTheDocument();
    expect(screen.getByText(/Mensagens/)).toBeInTheDocument();
    expect(screen.getByText(/Logs de atividade/)).toBeInTheDocument();
  });
});
