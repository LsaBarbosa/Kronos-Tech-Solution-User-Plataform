import { loginWithFace } from "@/service/auth.service";
import { registerCheckin } from "@/service/records.service";
import type {
  TerminalCheckinRequest,
  TerminalCheckinResponse,
} from "@/types/checkin.types";

const DEFAULT_AUTO_LOGOUT_SECONDS = 10;

export const submitTerminalCheckin = async (
  payload: TerminalCheckinRequest
): Promise<TerminalCheckinResponse> => {
  const { faceImageBase64, latitude, longitude, livenessPassed } = payload;

  await loginWithFace({
    faceImageBase64,
    livenessPassed,
  });

  const checkinResult = await registerCheckin({
    faceImageBase64,
    latitude,
    longitude,
  });

  return {
    loginMessage: "Autenticação facial realizada com sucesso.",
    recordMessage: checkinResult.message,
    actionType: checkinResult.actionType,
    autoLogoutAfterSeconds: DEFAULT_AUTO_LOGOUT_SECONDS,
    recordedAt: null,
  };
};
