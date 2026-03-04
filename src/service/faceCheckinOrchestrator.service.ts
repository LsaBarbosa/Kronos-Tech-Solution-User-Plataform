import { API_BASE_URL } from "@/config/api";

interface GeolocationPayload {
  latitude: number;
  longitude: number;
}

interface FaceLoginResponse {
  status?: string;
  message?: string;
}

interface RegisterPointOptions {
  shouldLogoutAfterFlow?: boolean;
}

interface RegisterPointResult {
  status: "success";
  auth?: FaceLoginResponse;
}

const parseErrorResponse = async (response: Response, fallbackMessage: string): Promise<string> => {
  try {
    const errorData = await response.json();
    return errorData.detail || errorData.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const getCurrentPosition = (): Promise<GeolocationPayload> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização não suportada neste dispositivo."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => reject(new Error("Não foi possível obter sua localização para registrar o ponto.")),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
};

const loginFace = async (faceImageBase64: string): Promise<FaceLoginResponse> => {
  const response = await fetch(`${API_BASE_URL}auth/login-face`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ faceImageBase64 }),
  });

  if (!response.ok) {
    throw new FaceCheckinFlowError(
      FACE_CHECKIN_ERROR_CODE.FACE_LOGIN_FAILURE,
      await parseErrorResponse(response, "Falha no reconhecimento facial.")
    );
  }

  return response.json();
};

export const retryCheckin = async (faceImageBase64: string): Promise<void> => {
  const location = await getCurrentPosition();

  const response = await fetch(`${API_BASE_URL}records/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      faceImageBase64,
      latitude: location.latitude,
      longitude: location.longitude,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response, "Falha ao registrar o ponto."));
  }
};

const logout = async (): Promise<void> => {
  await fetch(`${API_BASE_URL}auth/logout`, {
    method: "POST",
    credentials: "include",
  });
};

export const registerPointWithFace = async (
  faceImageBase64: string,
  options: RegisterPointOptions = {}
): Promise<RegisterPointResult> => {
  /**
   * Cenários suportados neste fluxo:
   * 1) Falha no login facial -> lança FaceCheckinFlowError com code FACE_LOGIN_FAILURE.
   * 2) Falha parcial no check-in (identidade confirmada, ponto não registrado) ->
   *    lança FaceCheckinFlowError com code PARTIAL_CHECKIN_FAILURE.
   * 3) Sucesso completo (login facial + check-in) -> retorna { checkinRegistered: true }.
   */
  await loginFace(faceImageBase64);

  try {
    await retryCheckin(faceImageBase64);
  } catch (error) {
    throw new FaceCheckinFlowError(
      FACE_CHECKIN_ERROR_CODE.PARTIAL_CHECKIN_FAILURE,
      error instanceof Error
        ? `Identidade confirmada, mas não foi possível registrar o ponto: ${error.message}`
        : "Identidade confirmada, mas não foi possível registrar o ponto."
    );
  } finally {
    if (options.shouldLogoutAfterFlow) {
      await logout();
    }
  }

  return { status: "success", auth: loginData };
};
