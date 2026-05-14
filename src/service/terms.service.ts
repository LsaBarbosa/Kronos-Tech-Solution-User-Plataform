import { api } from "@/config/api";
import { API_ROUTES, buildRoute } from "@/config/api-routes";

export interface TermsStatusResponse {
  accepted: boolean;
}

export const checkBiometricTermsStatus = async (): Promise<TermsStatusResponse> => {
  const response = await api.get<TermsStatusResponse>(
    buildRoute(API_ROUTES.TERMS, "status")
  );
  return response.data;
};

export const acceptBiometricTerms = async (): Promise<void> => {
  await api.post(buildRoute(API_ROUTES.TERMS, "accept-biometric"));
};

export const revokeBiometricTerms = async (): Promise<void> => {
  await api.delete(buildRoute(API_ROUTES.TERMS, "revoke-biometric"));
};
