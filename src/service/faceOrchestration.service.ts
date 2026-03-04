import { API_BASE_URL } from "@/config/api";

interface ApiErrorResponse {
  detail?: string;
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

export interface FaceCheckinFlowResult {
  success: boolean;
  partialFailure?: boolean;
  message?: string;
  retryContext?: FaceCheckinRetryContext;
}

const parseErrorMessage = async (response: Response, fallback: string) => {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    return payload.detail || fallback;
  } catch {
    return fallback;
  }
};

const loginFace = async (faceImageBase64: string) => {
  const response = await fetch(`${API_BASE_URL}auth/login-face`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ faceImageBase64 }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Falha no reconhecimento facial."));
  }
};

const checkin = async (faceImageBase64: string, location: GeolocationPayload) => {
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
    throw new Error(await parseErrorMessage(response, "Falha ao registrar o ponto."));
  }
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

export const authenticateWithFace = async (faceImageBase64: string): Promise<void> => {
  await loginFace(faceImageBase64);
};

export const executeFaceCheckinFlow = async (
  retryContext: FaceCheckinRetryContext,
): Promise<FaceCheckinFlowResult> => {
  try {
    await loginFace(retryContext.faceImageBase64);
  } catch (error) {
    return {
      success: false,
      partialFailure: false,
      message: error instanceof Error ? error.message : "Falha no login facial.",
    };
  }

  try {
    await checkin(retryContext.faceImageBase64, retryContext.location);

    if (retryContext.requireShortSession) {
      await logoutFaceSession();
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      partialFailure: true,
      message: error instanceof Error ? error.message : "Falha ao registrar ponto.",
      retryContext,
    };
  }
};

export const retryFaceCheckinFlow = async (
  retryContext: FaceCheckinRetryContext,
): Promise<FaceCheckinFlowResult> => {
  try {
    await checkin(retryContext.faceImageBase64, retryContext.location);

    if (retryContext.requireShortSession) {
      await logoutFaceSession();
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      partialFailure: true,
      message: error instanceof Error ? error.message : "Falha ao registrar ponto.",
      retryContext,
    };
  }
};
