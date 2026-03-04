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

/**
 * Contrato oficial e único de retorno da orquestração facial.
 *
 * Qualquer consumo interno deve se basear apenas em `status`, com estes valores:
 * - `success`: etapa concluída sem erros.
 * - `face_login_failure`: falha no login facial (`auth/login-face`).
 * - `partial_checkin_failure`: login facial concluído, mas check-in falhou.
 */
export type FaceFlowResult =
  | { status: "success" }
  | { status: "face_login_failure"; message: string }
  | { status: "partial_checkin_failure"; message: string; retryContext: FaceCheckinRetryContext };

/**
 * Serviço oficial de orquestração facial do frontend.
 *
 * Ordem do fluxo de check-in facial:
 * 1) `auth/login-face`
 * 2) `records/checkin`
 * 3) `auth/logout` (opcional quando `requireShortSession=true`)
 *
 * Contrato único de retorno (`FaceFlowResult`) para padronizar o consumo:
 * - `success`
 * - `face_login_failure`
 * - `partial_checkin_failure`
 *
 * Evite consumir endpoints faciais diretamente nos componentes;
 * este serviço é a única API interna para orquestração facial.
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

/**
 * Login facial puro (`auth/login-face`), sem check-in.
 *
 * Retornos possíveis:
 * - `success`
 * - `face_login_failure`
 */
export const executeFaceLoginFlow = async (faceImageBase64: string): Promise<FaceFlowResult> => {
  const loginResult = await loginFace(faceImageBase64);

  if (!loginResult.ok) {
    return { status: "face_login_failure", message: loginResult.message };
  }

  return { status: "success" };
};

/**
 * Fluxo oficial para `login-face -> checkin -> logout opcional`.
 *
 * Retornos possíveis:
 * - `success`
 * - `face_login_failure`
 * - `partial_checkin_failure`
 */
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

/**
 * Reaproveita sessão autenticada para reexecutar somente o check-in.
 *
 * Retornos possíveis:
 * - `success`
 * - `partial_checkin_failure`
 */
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
