import type { CheckinErrorCode } from "@/types/checkin.types";

interface CameraError {
  code: CheckinErrorCode;
  message: string;
}

const mapCameraError = (error: DOMException | unknown): CameraError => {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
        return {
          code: 'CAMERA_PERMISSION_DENIED',
          message: 'Permissão de câmera negada.',
        };
      case 'NotFoundError':
        return {
          code: 'CAMERA_UNAVAILABLE',
          message: 'Câmera não disponível neste dispositivo.',
        };
      case 'NotReadableError':
        return {
          code: 'CAMERA_UNAVAILABLE',
          message: 'Câmera está sendo usada por outro aplicativo.',
        };
      case 'AbortError':
        return {
          code: 'CAMERA_UNAVAILABLE',
          message: 'Solicitação de câmera foi cancelada.',
        };
      default:
        return {
          code: 'UNKNOWN_ERROR',
          message: 'Erro desconhecido ao acessar câmera.',
        };
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Erro desconhecido ao acessar câmera.',
  };
};

export const startCameraStream = async (): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 400 },
        height: { ideal: 300 },
      },
    });

    return stream;
  } catch (error) {
    throw mapCameraError(error);
  }
};

export const stopCameraStream = (stream: MediaStream | null): void => {
  if (!stream) return;

  stream.getTracks().forEach((track) => {
    track.stop();
  });
};

export const captureFrameFromVideo = (videoElement: HTMLVideoElement): string => {
  const canvas = document.createElement('canvas');
  const width = videoElement.videoWidth > 0 ? videoElement.videoWidth : 400;
  const height = videoElement.videoHeight > 0 ? videoElement.videoHeight : 300;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw {
      code: 'FACE_CAPTURE_FAILED',
      message: 'Falha ao obter contexto do canvas.',
    };
  }

  ctx.drawImage(videoElement, 0, 0, width, height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    throw {
      code: 'INVALID_IMAGE',
      message: 'Imagem capturada é inválida.',
    };
  }

  return dataUrl;
};
