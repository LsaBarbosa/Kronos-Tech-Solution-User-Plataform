import { API_BASE_URL } from "@/config/api";

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

export interface GeolocationPayload {
  latitude: number;
  longitude: number;
}

export interface FaceCheckinRetryContext {
  faceImageBase64: string;
  location: GeolocationPayload;
  requireShortSession?: boolean;
}

export type FaceFlowResult =
  | { status: "success" }
  | { status: "face_login_failure"; message: string }
  | { status: "partial_checkin_failure"; message: string; retryContext: FaceCheckinRetryContext };

/**
 * Fluxo facial oficial do frontend:
 * 1) login-face: valida a identidade facial e inicia uma sessão autenticada.
 * 2) checkin: registra o ponto usando a mesma sessão + geolocalização.
 * 3) logout opcional: encerra sessão curta quando `requireShortSession=true`.
 *
 * Contrato único de retorno (`FaceFlowResult`):
 * - success: login/check-in concluídos.
 * - face_login_failure: falha no reconhecimento facial.
 * - partial_checkin_failure: login facial confirmado, mas check-in falhou;
 *   retorna `retryContext` para permitir nova tentativa sem recapturar o rosto.
 */

const parseErrorMessage = async (response: Response, fallback: string) => {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    return payload.detail || payload.message || fallback;
  } catch {
    return fallback;
  }
};

const loginFace = async (faceImageBase64: string): Promise<{ ok: true } | { ok: false; message: string }> => {
  const response = await fetch(`${API_BASE_URL}auth/login-face`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ faceImageBase64 }),
  });

  if (!response.ok) {
    return {
      ok: false,
      message: await parseErrorMessage(response, "Falha no reconhecimento facial."),
    };
  }

  return { ok: true };
};

const checkin = async (faceImageBase64: string, location: GeolocationPayload): Promise<{ ok: true } | { ok: false; message: string }> => {
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
    return {
      ok: false,
      message: await parseErrorMessage(response, "Falha ao registrar o ponto."),
    };
  }

  return { ok: true };
};

const logoutFaceSession = async () => {
  const response = await fetch(`${API_BASE_URL}auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Falha ao encerrar sessão facial."));
  }
};

export const executeFaceLoginFlow = async (faceImageBase64: string): Promise<FaceFlowResult> => {
  const loginResult = await loginFace(faceImageBase64);

  if (!loginResult.ok) {
    return { status: "face_login_failure", message: loginResult.message };
  }

  return { status: "success" };
};

export const executeFaceCheckinFlow = async (
  retryContext: FaceCheckinRetryContext,
): Promise<FaceFlowResult> => {
  const loginResult = await loginFace(retryContext.faceImageBase64);

  if (!loginResult.ok) {
    return {
      status: "face_login_failure",
      message: loginResult.message,
    };
  }

  const checkinResult = await checkin(retryContext.faceImageBase64, retryContext.location);

  if (!checkinResult.ok) {
    return {
      status: "partial_checkin_failure",
      message: checkinResult.message,
      retryContext,
    };
  }

  if (retryContext.requireShortSession) {
    await logoutFaceSession();
  }

  return { status: "success" };
};

export const retryFaceCheckinFlow = async (
  retryContext: FaceCheckinRetryContext,
): Promise<FaceFlowResult> => {
  const checkinResult = await checkin(retryContext.faceImageBase64, retryContext.location);

  if (!checkinResult.ok) {
    return {
      status: "partial_checkin_failure",
      message: checkinResult.message,
      retryContext,
    };
  }

  if (retryContext.requireShortSession) {
    await logoutFaceSession();
  }

  return { status: "success" };
};
