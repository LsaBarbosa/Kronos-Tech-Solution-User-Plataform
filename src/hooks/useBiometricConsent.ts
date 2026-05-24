import { useCallback, useState } from "react";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { checkTermsStatus } from "@/service/terms.service";

export interface UseBiometricConsentResult {
  isCheckingConsent: boolean;
  hasActiveConsent: boolean | null;
  checkConsent: () => Promise<boolean>;
  error: string | null;
}

export const useBiometricConsent = (): UseBiometricConsentResult => {
  const [isCheckingConsent, setIsCheckingConsent] = useState(false);
  const [hasActiveConsent, setHasActiveConsent] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkConsent = useCallback(async (): Promise<boolean> => {
    setIsCheckingConsent(true);
    setError(null);

    try {
      const response = await checkTermsStatus();
      setHasActiveConsent(response.accepted);
      return response.accepted;
    } catch (err) {
      const serviceError = normalizeServiceError(err);
      setError(serviceError.message);
      setHasActiveConsent(false);
      return false;
    } finally {
      setIsCheckingConsent(false);
    }
  }, []);

  return {
    isCheckingConsent,
    hasActiveConsent,
    checkConsent,
    error,
  };
};
