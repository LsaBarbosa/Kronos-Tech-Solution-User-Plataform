import { api } from "@/config/api";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import { extractObject } from "@/service/helpers/response-normalizer.helper";

export interface BiometricTermsStatusResponse {
  accepted: boolean;
}

export interface BiometricTermsAcceptResponse {
  accepted: boolean;
  token: string;
}

export const getBiometricTermStatus = async (): Promise<BiometricTermsStatusResponse> => {
  const response = await api.get<boolean>(buildRoute(API_ROUTES.TERMS, "status"));

  return {
    accepted: response.data === true,
  };
};

export const acceptBiometricTerms = async (): Promise<BiometricTermsAcceptResponse> => {
  const response = await api.post<{ token?: string }>(
    buildRoute(API_ROUTES.TERMS, "accept-biometric")
  );

  const data = extractObject<{ token?: string }>(response.data) as { token?: string };

  if (!data.token) {
    throw new Error("Resposta de aceite biométrico sem token.");
  }

  return {
    accepted: true,
    token: data.token,
  };
};
