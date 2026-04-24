import { api } from "@/config/api";
import { API_ROUTES, buildRoute } from "@/config/api-routes";
import { extractObject } from "@/service/helpers/response-normalizer.helper";

export interface BiometricTermsStatusResponse {
  accepted: boolean;
}

export interface BiometricTermsAcceptResponse {
  accepted: boolean;
  token?: string;
}

export const getBiometricTermStatus = async (): Promise<BiometricTermsStatusResponse> => {
  const response = await api.get<BiometricTermsStatusResponse>(buildRoute(API_ROUTES.TERMS, "status"));
  const data = extractObject<BiometricTermsStatusResponse>(response.data) as Partial<BiometricTermsStatusResponse>;

  return {
    accepted: Boolean(data.accepted),
  };
};

export const acceptBiometricTerms = async (): Promise<BiometricTermsAcceptResponse> => {
  const response = await api.post<BiometricTermsAcceptResponse>(
    buildRoute(API_ROUTES.TERMS, "accept-biometric")
  );

  const data = extractObject<BiometricTermsAcceptResponse>(response.data) as Partial<BiometricTermsAcceptResponse>;

  return {
    accepted: Boolean(data.accepted ?? true),
    ...(data.token ? { token: data.token } : {}),
  };
};
