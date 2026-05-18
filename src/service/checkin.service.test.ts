import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerCheckin } from './records.service';
import { api } from '@/config/api';
import type { CheckinRequest } from '@/types/checkin.types';

vi.mock('@/config/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('records.service - registerCheckin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve enviar POST /records/checkin com payload correto', async () => {
    const payload: CheckinRequest = {
      latitude: -22.123456,
      longitude: -43.654321,
      faceImageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    };

    const mockResponse = {
      type: 'CHECKIN',
      message: 'Registro de entrada realizado com sucesso.',
    };

    vi.mocked(api.post).mockResolvedValueOnce({
      data: mockResponse,
    });

    const result = await registerCheckin(payload);

    expect(api.post).toHaveBeenCalledWith('/records/checkin', payload);
    expect(result.actionType).toBe('CHECKIN');
    expect(result.message).toBe('Registro de entrada realizado com sucesso.');
  });

  it('deve normalizar resposta com campo "action" em vez de "type"', async () => {
    const payload: CheckinRequest = {
      latitude: -22.123456,
      longitude: -43.654321,
      faceImageBase64: 'dGVzdA==',
    };

    const mockResponse = {
      action: 'CHECKOUT',
      message: 'Registro de saída realizado com sucesso.',
    };

    vi.mocked(api.post).mockResolvedValueOnce({
      data: mockResponse,
    });

    const result = await registerCheckin(payload);

    expect(result.actionType).toBe('CHECKOUT');
    expect(result.message).toBe('Registro de saída realizado com sucesso.');
  });

  it('deve usar mensagem padrão quando não houver message na resposta', async () => {
    const payload: CheckinRequest = {
      latitude: -22.123456,
      longitude: -43.654321,
      faceImageBase64: 'dGVzdA==',
    };

    const mockResponse = {
      type: 'CHECKIN',
    };

    vi.mocked(api.post).mockResolvedValueOnce({
      data: mockResponse,
    });

    const result = await registerCheckin(payload);

    expect(result.message).toBe('Registro de ponto realizado com sucesso.');
  });

  it('deve propagar erro HTTP', async () => {
    const payload: CheckinRequest = {
      latitude: -22.123456,
      longitude: -43.654321,
      faceImageBase64: 'dGVzdA==',
    };

    const mockError = new Error('Erro na requisição');
    vi.mocked(api.post).mockRejectedValueOnce(mockError);

    await expect(registerCheckin(payload)).rejects.toThrow();
  });
});
