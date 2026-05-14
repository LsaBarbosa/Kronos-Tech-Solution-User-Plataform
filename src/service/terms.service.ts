import { api } from "@/config/api";
import { API_ROUTES, TERMS_PATHS, buildRoute } from "@/config/api-routes";

export interface TermsStatusResponse {
  accepted: boolean;
}

export const checkBiometricTermsStatus = async (): Promise<TermsStatusResponse> => {
  const response = await api.get<TermsStatusResponse>(
    buildRoute(API_ROUTES.TERMS, TERMS_PATHS.STATUS)
  );
  return response.data;
};

export const acceptBiometricTerms = async (): Promise<void> => {
  await api.post(buildRoute(API_ROUTES.TERMS, TERMS_PATHS.ACCEPT_BIOMETRIC));
};

export const revokeBiometricTerms = async (): Promise<void> => {
  await api.delete(buildRoute(API_ROUTES.TERMS, TERMS_PATHS.REVOKE_BIOMETRIC));
};
