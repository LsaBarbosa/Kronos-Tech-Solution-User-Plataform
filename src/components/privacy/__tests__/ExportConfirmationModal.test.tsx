import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportConfirmationModal from '@/components/privacy/ExportConfirmationModal';

describe('ExportConfirmationModal', () => {
  it('should render modal with warning text when open', () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn();

    render(
      <ExportConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Confirmar Exportação de Dados')).toBeInTheDocument();
    expect(screen.getByText(/Este arquivo pode conter informações sensíveis/)).toBeInTheDocument();
  });

  it('should display warning about sensitive data', () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn();

    render(
      <ExportConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText(/Informações pessoais/)).toBeInTheDocument();
    expect(screen.getByText(/Dados de contrato e folha de pagamento/)).toBeInTheDocument();
    expect(screen.getByText(/Registro de ponto e geolocalização/)).toBeInTheDocument();
    expect(screen.getByText(/Documentos e anexos/)).toBeInTheDocument();
  });

  it('should display security notice', () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn();

    render(
      <ExportConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText(/Salve em local seguro/)).toBeInTheDocument();
  });

  it('should close modal when Cancel button is clicked', () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn();

    render(
      <ExportConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should call onConfirm when Confirm button is clicked', async () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <ExportConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    const confirmButton = screen.getByText('Confirmar Exportação');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });

  it('should close modal after successful confirmation', async () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <ExportConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    const confirmButton = screen.getByText('Confirmar Exportação');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should show loading state during confirmation', async () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <ExportConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    const confirmButton = screen.getByText('Confirmar Exportação');
    fireEvent.click(confirmButton);

    expect(screen.getByText('Exportando...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Exportando...')).not.toBeInTheDocument();
    });
  });

  it('should not render when open is false', () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn();

    const { container } = render(
      <ExportConfirmationModal
        open={false}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    // Dialog should not be in the document when open is false
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('should disable buttons during loading', async () => {
    const mockOnOpenChange = vi.fn();
    const mockOnConfirm = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <ExportConfirmationModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    const confirmButton = screen.getByText('Confirmar Exportação') as HTMLButtonElement;
    const cancelButton = screen.getByText('Cancelar') as HTMLButtonElement;

    fireEvent.click(confirmButton);

    expect(cancelButton.disabled).toBe(true);
    expect(confirmButton.disabled).toBe(true);
  });
});
