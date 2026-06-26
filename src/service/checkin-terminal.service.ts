import { loginWithFace, type FaceLoginPayload } from "@/service/auth.service";
import { registerCheckin } from "@/service/records.service";
import type { CheckinRequest } from "@/types/checkin.types";

export interface CheckinTerminalRequest {
  faceImageBase64: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  livenessPassed?: boolean;
}

export interface CheckinTerminalResponse {
  loginMessage?: string;
  recordMessage?: string;
  actionType?: string;
  autoLogoutAfterSeconds?: number;
  recordedAt?: string;
}

export const submitCheckinFace = async (
  payload: CheckinTerminalRequest
): Promise<CheckinTerminalResponse> => {
  const faceLoginPayload: FaceLoginPayload = {
    faceImageBase64: payload.faceImageBase64,
    livenessPassed: payload.livenessPassed,
  };

  await loginWithFace(faceLoginPayload);

  const checkinPayload: CheckinRequest = {
    faceImageBase64: payload.faceImageBase64,
    latitude: payload.latitude,
    longitude: payload.longitude,
  };

  const record = await registerCheckin(checkinPayload);

  return {
    loginMessage: "Identificação facial realizada com sucesso.",
    recordMessage: record.message,
    actionType: record.actionType,
    autoLogoutAfterSeconds: 10,
    recordedAt: new Date().toISOString(),
  };
};
