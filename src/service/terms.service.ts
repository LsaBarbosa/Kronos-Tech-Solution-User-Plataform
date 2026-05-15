import { api } from "@/config/api";
import { API_ROUTES, TERMS_PATHS, buildRoute } from "@/config/api-routes";
import { invalidateCsrfToken } from "@/service/csrf.service";

export interface TermsStatusResponse {
  accepted: boolean;
}

export const checkTermsStatus = async (): Promise<boolean> => {
  const response = await api.get<TermsStatusResponse>(
    buildRoute(API_ROUTES.TERMS, TERMS_PATHS.STATUS)
  );

  return response.data.accepted === true;
};

export const acceptBiometricTerms = async (): Promise<void> => {
  const response = await api.post(
    buildRoute(API_ROUTES.TERMS, TERMS_PATHS.ACCEPT_BIOMETRIC)
  );

  if (response.status !== 204) {
    throw new Error("Falha ao registrar o aceite do termo.");
  }

  invalidateCsrfToken();
};
