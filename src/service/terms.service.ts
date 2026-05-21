import { api } from "@/config/api";
import { API_ROUTES, TERMS_PATHS, buildRoute } from "@/config/api-routes";
import { invalidateCsrfToken } from "@/service/csrf.service";

export interface TermsStatusResponse {
  accepted: boolean;
}

export interface CurrentBiometricTermResponse {
  type: "BIOMETRIC_CONSENT_TERM";
  version: string;
  title: string;
  content: string;
  contentHashSha256: string;
  active: boolean;
}

export interface AcceptBiometricTermsPayload {
  version: string;
  contentHashSha256: string;
}

export const checkTermsStatus = async (): Promise<boolean> => {
  const response = await api.get<TermsStatusResponse>(
    buildRoute(API_ROUTES.TERMS, TERMS_PATHS.STATUS)
  );

  return response.data.accepted === true;
};

export const getCurrentBiometricTerm =
  async (): Promise<CurrentBiometricTermResponse> => {
    const response = await api.get<CurrentBiometricTermResponse>(
      buildRoute(API_ROUTES.TERMS, TERMS_PATHS.CURRENT_BIOMETRIC)
    );

    return response.data;
  };

export const acceptBiometricTerms = async (
  payload: AcceptBiometricTermsPayload
): Promise<void> => {
  const response = await api.post(
    buildRoute(API_ROUTES.TERMS, TERMS_PATHS.ACCEPT_BIOMETRIC),
    payload
  );

  if (response.status !== 204) {
    throw new Error("Falha ao registrar o aceite do termo.");
  }

  invalidateCsrfToken();
};

export const revokeBiometricTerms = async (): Promise<void> => {
  const response = await api.delete(
    buildRoute(API_ROUTES.TERMS, TERMS_PATHS.REVOKE_BIOMETRIC)
  );

  if (response.status !== 204) {
    throw new Error("Falha ao revogar o consentimento biométrico.");
  }

  invalidateCsrfToken();
};
