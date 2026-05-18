import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CheckinProvider, useCheckin } from './CheckinContext';
import type { ReactNode } from 'react';

vi.mock('@/service/records.service', () => ({
  registerCheckin: vi.fn(),
}));

vi.mock('@/utils/geolocation.util', () => ({
  getCurrentLocation: vi.fn(),
}));

vi.mock('@/utils/camera.util', () => ({
  startCameraStream: vi.fn(),
  stopCameraStream: vi.fn(),
}));

const TestComponent = () => {
  const { state, openCheckin, closeCheckin } = useCheckin();

  return (
    <div>
      <span data-testid="status">{state.status}</span>
      <span data-testid="latitude">{state.latitude}</span>
      <span data-testid="longitude">{state.longitude}</span>
      <span data-testid="faceImageBase64">{state.faceImageBase64 ? 'SET' : 'EMPTY'}</span>
      <span data-testid="isModalOpen">{state.isModalOpen ? 'true' : 'false'}</span>
      <button data-testid="open-btn" onClick={openCheckin}>Open</button>
      <button data-testid="close-btn" onClick={closeCheckin}>Close</button>
    </div>
  );
};

describe('CheckinContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve lançar erro se useCheckin for usado fora do provider', () => {
    expect(() => {
      const TestComponentOutside = () => {
        useCheckin();
        return null;
      };
      render(<TestComponentOutside />);
    }).toThrow();
  });

  it('deve ter estado inicial correto', () => {
    render(
      <CheckinProvider>
        <TestComponent />
      </CheckinProvider>
    );

    expect(screen.getByTestId('status')).toHaveTextContent('idle');
    expect(screen.getByTestId('isModalOpen')).toHaveTextContent('false');
    expect(screen.getByTestId('faceImageBase64')).toHaveTextContent('EMPTY');
  });

  it('deve abrir modal', async () => {
    render(
      <CheckinProvider>
        <TestComponent />
      </CheckinProvider>
    );

    const openButton = screen.getByTestId('open-btn');
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(screen.getByTestId('isModalOpen')).toHaveTextContent('true');
    });
  });

  it('deve fechar modal', async () => {
    render(
      <CheckinProvider>
        <TestComponent />
      </CheckinProvider>
    );

    const openButton = screen.getByTestId('open-btn');
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(screen.getByTestId('isModalOpen')).toHaveTextContent('true');
    });

    const closeButton = screen.getByTestId('close-btn');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.getByTestId('isModalOpen')).toHaveTextContent('false');
    });
  });
});
