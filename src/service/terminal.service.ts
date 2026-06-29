import { api } from "@/config/api";
import { API_ROUTES, AUTH_PATHS, buildRoute } from "@/config/api-routes";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import type { TerminalCheckinPayload, TerminalCheckinResult } from "@/types/terminal";

export const terminalCheckin = async (payload: TerminalCheckinPayload): Promise<TerminalCheckinResult> => {
  try {
    const response = await api.post<TerminalCheckinResult>(
      buildRoute(API_ROUTES.AUTH, AUTH_PATHS.TERMINAL_CHECKIN),
      payload
    );
    return response.data;
  } catch (error) {
    throw normalizeServiceError(error);
  }
};
