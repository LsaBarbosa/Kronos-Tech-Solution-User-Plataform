import { useAuth } from "@/context/AuthContext";
import { isBiometricLivenessRequired } from "@/config/biometric";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { submitTerminalCheckin } from "@/service/terminal-checkin.service";
import type {
  CheckinCoordinates,
  CheckinError,
  CheckinErrorCode,
  TerminalCheckinFlowStatus,
  TerminalCheckinResponse,
} from "@/types/checkin.types";
import { extractBase64FromDataUrl, isValidBase64Image } from "@/utils/base64-image.util";
import {
  captureFrameFromVideo,
  startCameraStream,
  stopCameraStream,
} from "@/utils/camera.util";
import { getCurrentLocation } from "@/utils/geolocation.util";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";

interface TerminalCheckinViewState {
  status: TerminalCheckinFlowStatus;
  coordinates: CheckinCoordinates | null;
  previewImage: string | null;
  response: TerminalCheckinResponse | null;
  error: CheckinError | null;
  countdownSeconds: number | null;
  isLocationReady: boolean;
  isCameraReady: boolean;
}

export interface TerminalCheckinViewModel {
  state: TerminalCheckinViewState;
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  startFlow: () => Promise<void>;
  captureAndSubmit: () => Promise<void>;
  restartFlow: () => void;
  exitFlow: () => Promise<void>;
}

const initialState: TerminalCheckinViewState = {
  status: "start",
  coordinates: null,
  previewImage: null,
  response: null,
  error: null,
  countdownSeconds: null,
  isLocationReady: false,
  isCameraReady: false,
};

const normalizeTerminalCheckinError = (error: unknown): CheckinError => {
  if (typeof error === "object" && error !== null && "code" in error && "message" in error) {
    const errorObject = error as {
      code: CheckinErrorCode;
      message: string;
      details?: unknown;
    };

    return {
      code: errorObject.code,
      message: errorObject.message,
      details: errorObject.details,
    };
  }

  const serviceError = normalizeServiceError(error);
  const message = serviceError.message || "";
  const normalizedMessage = message.toLowerCase();

  if (serviceError.kind === "terms") {
    return {
      code: "TERMS_NOT_ACCEPTED",
      message:
        serviceError.message ||
        "Consentimento biométrico ativo é obrigatório para usar este terminal.",
      details: serviceError,
    };
  }

  if (
    serviceError.kind === "auth" ||
    normalizedMessage.includes("face") ||
    normalizedMessage.includes("rosto")
  ) {
    return {
      code: "FACE_NOT_RECOGNIZED",
      message: "Não foi possível identificar o colaborador. Ajuste o enquadramento e tente novamente.",
      details: serviceError,
    };
  }

  if (
    normalizedMessage.includes("radius") ||
    normalizedMessage.includes("raio") ||
    normalizedMessage.includes("localização")
  ) {
    return {
      code: "OUT_OF_ALLOWED_RADIUS",
      message: "Este dispositivo está fora da área permitida para registrar o ponto.",
      details: serviceError,
    };
  }

  if (serviceError.kind === "network") {
    return {
      code: "NETWORK_ERROR",
      message: "Falha de conexão ao enviar o registro. Verifique a rede e tente novamente.",
      details: serviceError,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: serviceError.message || "Não foi possível concluir o registro neste terminal.",
    details: serviceError,
  };
};

export const useTerminalCheckinFlow = (): TerminalCheckinViewModel => {
  const { isAuthenticated, logout } = useAuth();
  const [state, setState] = useState<TerminalCheckinViewState>(initialState);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const shouldClearSessionRef = useRef(false);

  const clearMedia = useCallback(() => {
    stopCameraStream(streamRef.current);
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const restartFlow = useCallback(() => {
    clearMedia();
    shouldClearSessionRef.current = false;
    setState(initialState);
  }, [clearMedia]);

  const exitFlow = useCallback(async () => {
    clearMedia();
    setState((current) => ({
      ...current,
      status: "exiting",
      isCameraReady: false,
    }));

    try {
      if (shouldClearSessionRef.current || isAuthenticated) {
        await logout();
      }
    } finally {
      shouldClearSessionRef.current = false;
      setState(initialState);
    }
  }, [clearMedia, isAuthenticated, logout]);

  const startFlow = useCallback(async () => {
    clearMedia();
    shouldClearSessionRef.current = false;

    setState({
      ...initialState,
      status: "collecting",
    });

    try {
      const coordinates = await getCurrentLocation();
      setState((current) => ({
        ...current,
        status: "collecting",
        coordinates,
        isLocationReady: true,
      }));

      const stream = await startCameraStream();
      streamRef.current = stream;

      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.srcObject = stream;
        try {
          const playResult = videoElement.play?.();
          if (playResult && typeof playResult.catch === "function") {
            void playResult.catch(() => undefined);
          }
        } catch {
          // browsers variam aqui; a câmera continua válida para captura manual
        }
      }

      setState((current) => ({
        ...current,
        status: "collecting",
        isCameraReady: true,
      }));
    } catch (error) {
      clearMedia();
      setState((current) => ({
        ...current,
        status: "error",
        isCameraReady: false,
        error: normalizeTerminalCheckinError(error),
      }));
    }
  }, [clearMedia]);

  const captureAndSubmit = useCallback(async () => {
    if (!state.coordinates) {
      setState((current) => ({
        ...current,
        status: "error",
        error: {
          code: "LOCATION_UNAVAILABLE",
          message: "A localização ainda não está pronta para este registro.",
        },
      }));
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) {
      setState((current) => ({
        ...current,
        status: "error",
        error: {
          code: "CAMERA_UNAVAILABLE",
          message: "A câmera deste terminal não está disponível no momento.",
        },
      }));
      return;
    }

    try {
      const previewImage = captureFrameFromVideo(videoElement);
      const faceImageBase64 = extractBase64FromDataUrl(previewImage);

      if (!isValidBase64Image(faceImageBase64)) {
        throw {
          code: "INVALID_IMAGE",
          message: "A captura da face ficou inválida. Reinicie o fluxo e tente novamente.",
        } satisfies CheckinError;
      }

      clearMedia();
      setState((current) => ({
        ...current,
        status: "submitting",
        previewImage,
        error: null,
        isCameraReady: false,
      }));

      const livenessPassed = isBiometricLivenessRequired()
        ? isValidBase64Image(faceImageBase64)
        : false;

      const response = await submitTerminalCheckin({
        faceImageBase64,
        latitude: state.coordinates.latitude,
        longitude: state.coordinates.longitude,
        accuracy: state.coordinates.accuracy,
        livenessPassed,
      });

      shouldClearSessionRef.current = true;
      setState((current) => ({
        ...current,
        status: "success",
        response,
        countdownSeconds: response.autoLogoutAfterSeconds,
      }));
    } catch (error) {
      clearMedia();
      setState((current) => ({
        ...current,
        status: "error",
        isCameraReady: false,
        error: normalizeTerminalCheckinError(error),
      }));
    }
  }, [clearMedia, state.coordinates]);

  useEffect(() => {
    if (state.status !== "success" || state.countdownSeconds === null) {
      return;
    }

    if (state.countdownSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setState((current) => {
        if (current.status !== "success" || current.countdownSeconds === null) {
          return current;
        }

        return {
          ...current,
          countdownSeconds: current.countdownSeconds - 1,
        };
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [exitFlow, state.countdownSeconds, state.status]);

  useEffect(() => {
    if (state.status !== "success" || !state.response) {
      return;
    }

    const exitTimer = window.setTimeout(() => {
      void exitFlow();
    }, state.response.autoLogoutAfterSeconds * 1000);

    return () => window.clearTimeout(exitTimer);
  }, [exitFlow, state.response, state.status]);

  useEffect(() => () => clearMedia(), [clearMedia]);

  return {
    state,
    videoRef,
    startFlow,
    captureAndSubmit,
    restartFlow,
    exitFlow,
  };
};
