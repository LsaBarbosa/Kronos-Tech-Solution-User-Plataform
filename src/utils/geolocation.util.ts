import type { CheckinCoordinates, CheckinErrorCode } from "@/types/checkin.types";

interface GeolocationError {
  code: CheckinErrorCode;
  message: string;
}

const mapGeolocationError = (error: GeolocationPositionError | unknown): GeolocationError => {
  if (error instanceof GeolocationPositionError) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return {
          code: 'LOCATION_PERMISSION_DENIED',
          message: 'Permissão de localização negada.',
        };
      case error.POSITION_UNAVAILABLE:
        return {
          code: 'LOCATION_UNAVAILABLE',
          message: 'Localização indisponível neste dispositivo.',
        };
      case error.TIMEOUT:
        return {
          code: 'LOCATION_TIMEOUT',
          message: 'Tempo limite de localização excedido.',
        };
      default:
        return {
          code: 'UNKNOWN_ERROR',
          message: 'Erro desconhecido ao obter localização.',
        };
    }
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Erro desconhecido ao obter localização.',
  };
};

export const getCurrentLocation = (): Promise<CheckinCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 'LOCATION_UNAVAILABLE',
        message: 'Geolocalização não suportada neste navegador.',
      } as GeolocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? null,
        });
      },
      (error) => {
        reject(mapGeolocationError(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
};
