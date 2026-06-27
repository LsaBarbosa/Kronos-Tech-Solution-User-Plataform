import { api } from "@/config/api";
import { API_ROUTES, AUTH_PATHS, buildRoute } from "@/config/api-routes";
import {
  extractObject,
  safeNumber,
  safeString,
} from "@/service/helpers/response-normalizer.helper";
import type {
  TerminalCheckinRequest,
  TerminalCheckinResponse,
} from "@/types/checkin.types";

export const submitTerminalCheckin = async (
  payload: TerminalCheckinRequest
): Promise<TerminalCheckinResponse> => {
  const response = await api.post<unknown>(
    buildRoute(API_ROUTES.AUTH, AUTH_PATHS.CHECKIN_FACE),
    payload
  );

  const data = extractObject<Partial<TerminalCheckinResponse>>(response.data);

  return {
    loginMessage: safeString(data.loginMessage, "Autenticação facial realizada com sucesso."),
    recordMessage: safeString(data.recordMessage, "Registro realizado com sucesso."),
    actionType: safeString(data.actionType, "UNKNOWN"),
    autoLogoutAfterSeconds: safeNumber(data.autoLogoutAfterSeconds, 10),
    recordedAt:
      typeof data.recordedAt === "string" && data.recordedAt.trim()
        ? data.recordedAt
        : null,
  };
};
