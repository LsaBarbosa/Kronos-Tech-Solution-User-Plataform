import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { registerCheckin } from '@/service/records.service';
import { getCurrentLocation } from '@/utils/geolocation.util';
import { startCameraStream, stopCameraStream } from '@/utils/camera.util';
import { extractBase64FromDataUrl } from '@/utils/base64-image.util';
import { normalizeServiceError } from '@/service/helpers/service-error.helper';
import type {
  CheckinContextValue,
  CheckinState,
  CheckinError,
  CheckinErrorCode,
} from '@/types/checkin.types';

const CheckinContext = createContext<CheckinContextValue | undefined>(undefined);

const initialState: CheckinState = {
  status: 'idle',
  latitude: null,
  longitude: null,
  accuracy: null,
  faceImageBase64: null,
  result: null,
  error: null,
  isModalOpen: false,
  isSubmitting: false,
  lastAttemptAt: null,
};

const normalizeCheckinError = (error: unknown): CheckinError => {
  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    return {
      code: (error as any).code as CheckinErrorCode,
      message: (error as any).message,
      details: (error as any).details,
    };
  }

  const serviceError = normalizeServiceError(error);

  if (serviceError.status === 401 || serviceError.status === 403) {
    return {
      code: 'SESSION_EXPIRED',
      message: 'Sua sessão expirou. Faça login novamente.',
      details: error,
    };
  }

  if (serviceError.status === 400) {
    const errorMessage = serviceError.message || '';
    if (errorMessage.includes('face') || errorMessage.includes('Face')) {
      return {
        code: 'FACE_NOT_RECOGNIZED',
        message: 'Não foi possível reconhecer o rosto. Tente novamente com boa iluminação.',
        details: error,
      };
    }
    if (errorMessage.includes('radius') || errorMessage.includes('Radius')) {
      return {
        code: 'OUT_OF_ALLOWED_RADIUS',
        message: 'Você está fora da área permitida para registro de ponto.',
        details: error,
      };
    }
    if (errorMessage.includes('clock') || errorMessage.includes('NTP') || errorMessage.includes('time')) {
      return {
        code: 'CLOCK_NOT_SYNCHRONIZED',
        message: 'Não foi possível validar o horário. Tente novamente em instantes.',
        details: error,
      };
    }
  }

  return {
    code: 'NETWORK_ERROR',
    message: serviceError.message || 'Falha ao registrar ponto. Tente novamente.',
    details: error,
  };
};

export const CheckinProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<CheckinState>(initialState);
  let cameraStream: MediaStream | null = null;

  const openCheckin = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isModalOpen: true,
      status: 'idle',
      error: null,
      result: null,
    }));
  }, []);

  const closeCheckin = useCallback(() => {
    if (cameraStream) {
      stopCameraStream(cameraStream);
      cameraStream = null;
    }

    setState((prev) => ({
      ...initialState,
      isModalOpen: false,
    }));
  }, []);

  const resetCheckin = useCallback(() => {
    if (cameraStream) {
      stopCameraStream(cameraStream);
      cameraStream = null;
    }

    setState(initialState);
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  const requestLocation = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      status: 'requesting_location',
      error: null,
    }));

    try {
      const coordinates = await getCurrentLocation();
      setState((prev) => ({
        ...prev,
        status: 'location_ready',
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        accuracy: coordinates.accuracy,
      }));
    } catch (error) {
      const normalizedError = normalizeCheckinError(error);
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: normalizedError,
      }));
      throw normalizedError;
    }
  }, []);

  const requestCamera = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      status: 'requesting_camera',
      error: null,
    }));

    try {
      cameraStream = await startCameraStream();
      setState((prev) => ({
        ...prev,
        status: 'camera_ready',
      }));
      return cameraStream;
    } catch (error) {
      const normalizedError = normalizeCheckinError(error);
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: normalizedError,
      }));
      throw normalizedError;
    }
  }, []);

  const captureFace = useCallback((imageBase64: string) => {
    if (!imageBase64 || imageBase64.length < 100) {
      const error: CheckinError = {
        code: 'INVALID_IMAGE',
        message: 'Imagem capturada é inválida.',
      };
      setState((prev) => ({
        ...prev,
        status: 'error',
        error,
      }));
      throw error;
    }

    const cleanBase64 = extractBase64FromDataUrl(imageBase64);

    setState((prev) => ({
      ...prev,
      status: 'ready_to_submit',
      faceImageBase64: cleanBase64,
    }));
  }, []);

  const submitCheckin = useCallback(async () => {
    const currentState = state;

    if (currentState.isSubmitting) {
      return;
    }

    if (!currentState.latitude || !currentState.longitude || !currentState.faceImageBase64) {
      const error: CheckinError = {
        code: 'INVALID_IMAGE',
        message: 'Dados incompletos para registrar ponto.',
      };
      setState((prev) => ({
        ...prev,
        error,
      }));
      throw error;
    }

    setState((prev) => ({
      ...prev,
      status: 'submitting',
      isSubmitting: true,
    }));

    try {
      const result = await registerCheckin({
        latitude: currentState.latitude,
        longitude: currentState.longitude,
        faceImageBase64: currentState.faceImageBase64,
      });

      setState((prev) => ({
        ...prev,
        status: 'success',
        result,
        isSubmitting: false,
        lastAttemptAt: new Date().toISOString(),
        faceImageBase64: null,
      }));
    } catch (error) {
      const normalizedError = normalizeCheckinError(error);
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: normalizedError,
        isSubmitting: false,
      }));
      throw normalizedError;
    }
  }, [state]);

  const retry = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      error: null,
      status: 'idle',
      latitude: null,
      longitude: null,
      accuracy: null,
      faceImageBase64: null,
    }));
  }, []);

  const value = useMemo<CheckinContextValue>(
    () => ({
      state,
      openCheckin,
      closeCheckin,
      requestLocation,
      requestCamera,
      captureFace,
      submitCheckin,
      resetCheckin,
      clearError,
      retry,
    }),
    [state, openCheckin, closeCheckin, requestLocation, requestCamera, captureFace, submitCheckin, resetCheckin, clearError, retry]
  );

  return <CheckinContext.Provider value={value}>{children}</CheckinContext.Provider>;
};

export const useCheckin = () => {
  const context = useContext(CheckinContext);

  if (!context) {
    throw new Error('useCheckin deve ser usado dentro de CheckinProvider.');
  }

  return context;
};
