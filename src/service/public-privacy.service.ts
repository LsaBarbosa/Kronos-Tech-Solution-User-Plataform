import { api } from "@/config/api";

export interface PublicProcessingActivityResponse {
  code: string;
  title: string;
  description: string;
  dataCategories: string[];
  purposes: string[];
  legalBases: string[];
  retentionPolicy: string;
  dataSubjectRights: string[];
}

export interface PublicProcessingCatalogResponse {
  version: string;
  effectiveDate: string;
  activities: PublicProcessingActivityResponse[];
}

export interface PrivacyPolicySectionResponse {
  title: string;
  content: string;
}

export interface PublicPrivacyPolicyResponse {
  version: string;
  effectiveDate: string;
  title: string;
  sections: PrivacyPolicySectionResponse[];
}

export interface BiometricTermSectionResponse {
  title: string;
  content: string;
}

export interface PublicBiometricTermResponse {
  version: string;
  effectiveDate: string;
  title: string;
  sections: BiometricTermSectionResponse[];
}

export const getPublicProcessingCatalog = async (): Promise<PublicProcessingCatalogResponse> => {
  const response = await api.get<PublicProcessingCatalogResponse>(
    "/public/privacy/processing-catalog"
  );
  return response.data;
};

export const getPublicPrivacyPolicy = async (): Promise<PublicPrivacyPolicyResponse> => {
  const response = await api.get<PublicPrivacyPolicyResponse>(
    "/public/privacy/policy"
  );
  return response.data;
};

export const getPublicBiometricTerm = async (): Promise<PublicBiometricTermResponse> => {
  const response = await api.get<PublicBiometricTermResponse>(
    "/public/privacy/biometric-term"
  );
  return response.data;
};
