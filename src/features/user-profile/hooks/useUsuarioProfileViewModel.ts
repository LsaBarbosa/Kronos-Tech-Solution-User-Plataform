import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getServiceErrorMessage, isAuthServiceError, normalizeServiceError } from "@/service/helpers/service-error.helper";
import { loadSessionProfile } from "@/service/session-profile.service";
import { checkTermsStatus, getConsentHistory, getCurrentBiometricTerm } from "@/service/terms.service";
import { getDataProcessingCatalog } from "@/service/lgpd.service";
import type { BiometricConsentStatus, ConsentHistoryResponse, CurrentLegalTextResponse, DataProcessingPurpose } from "@/types/legal";
import type { SessionUserData } from "@/types/user";
import { mapUsuarioProfileViewModel, type UsuarioProfileViewModel } from "@/features/user-profile/mappers/usuario-profile.mapper";
import { useUsuarioPrivacyActions, type UsuarioPrivacyActions } from "./useUsuarioPrivacyActions";

type LoadState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

const createLoadState = <T,>(data: T | null = null): LoadState<T> => ({
  data,
  loading: true,
  error: null,
});

export interface UseUsuarioProfileViewModelResult {
  sessionProfile: SessionUserData | null;
  biometricStatus: BiometricConsentStatus | null;
  consentHistory: ConsentHistoryResponse[];
  currentBiometricTerm: CurrentLegalTextResponse | null;
  processingCatalog: DataProcessingPurpose[];
  loadingProfile: boolean;
  loadingPrivacy: boolean;
  profileError: string | null;
  biometricStatusError: string | null;
  currentBiometricTermError: string | null;
  consentHistoryError: string | null;
  processingCatalogError: string | null;
  profile: UsuarioProfileViewModel;
  actions: UsuarioPrivacyActions;
  refreshProfile: () => Promise<void>;
  refreshPrivacy: () => Promise<void>;
}

export const useUsuarioProfileViewModel = (): UseUsuarioProfileViewModelResult => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const mountedRef = useRef(true);

  const [sessionProfileState, setSessionProfileState] = useState<LoadState<SessionUserData>>(createLoadState());
  const [biometricStatusState, setBiometricStatusState] = useState<LoadState<BiometricConsentStatus>>(createLoadState());
  const [consentHistoryState, setConsentHistoryState] = useState<LoadState<ConsentHistoryResponse[]>>(createLoadState([]));
  const [currentTermState, setCurrentTermState] = useState<LoadState<CurrentLegalTextResponse>>(createLoadState());
  const [processingCatalogState, setProcessingCatalogState] = useState<LoadState<DataProcessingPurpose[]>>(createLoadState([]));

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const redirectToLogin = useCallback(
    async (reason: string) => {
      await logout();
      navigate("/login", { replace: true, state: { reason } });
    },
    [logout, navigate]
  );

  const loadProfile = useCallback(async () => {
    setSessionProfileState((current) => ({ ...current, loading: true, error: null }));

    try {
      const sessionProfile = await loadSessionProfile();

      if (!mountedRef.current) {
        return;
      }

      setSessionProfileState({
        data: sessionProfile,
        loading: false,
        error: null,
      });
    } catch (error) {
      const serviceError = normalizeServiceError(error);

      if (isAuthServiceError(serviceError)) {
        await redirectToLogin("session_expired");
        return;
      }

      if (mountedRef.current) {
        setSessionProfileState({
          data: null,
          loading: false,
          error: getServiceErrorMessage(serviceError, "Nao foi possivel carregar o perfil."),
        });
      }
    }
  }, [redirectToLogin]);

  const loadPrivacy = useCallback(async () => {
    setBiometricStatusState((current) => ({ ...current, loading: true, error: null }));
    setConsentHistoryState((current) => ({ ...current, loading: true, error: null }));
    setCurrentTermState((current) => ({ ...current, loading: true, error: null }));
    setProcessingCatalogState((current) => ({ ...current, loading: true, error: null }));

    const results = await Promise.allSettled([
      checkTermsStatus(),
      getConsentHistory(),
      getCurrentBiometricTerm(),
      getDataProcessingCatalog(),
    ]);

    const [biometricResult, historyResult, termResult, catalogResult] = results;

    if (!mountedRef.current) {
      return;
    }

    const maybeRedirectOnAuth = async (reason: string) => {
      await redirectToLogin(reason);
    };

    if (biometricResult.status === "fulfilled") {
      setBiometricStatusState({
        data: biometricResult.value,
        loading: false,
        error: null,
      });
    } else {
      const serviceError = normalizeServiceError(biometricResult.reason);
      if (isAuthServiceError(serviceError)) {
        await maybeRedirectOnAuth("session_expired");
        return;
      }
      setBiometricStatusState({
        data: null,
        loading: false,
        error: getServiceErrorMessage(serviceError, "Nao foi possivel carregar o status biometrico."),
      });
    }

    if (historyResult.status === "fulfilled") {
      setConsentHistoryState({
        data: historyResult.value,
        loading: false,
        error: null,
      });
    } else {
      const serviceError = normalizeServiceError(historyResult.reason);
      if (isAuthServiceError(serviceError)) {
        await maybeRedirectOnAuth("session_expired");
        return;
      }
      setConsentHistoryState({
        data: [],
        loading: false,
        error: getServiceErrorMessage(serviceError, "Nao foi possivel carregar o historico de consentimentos."),
      });
    }

    if (termResult.status === "fulfilled") {
      setCurrentTermState({
        data: termResult.value,
        loading: false,
        error: null,
      });
    } else {
      const serviceError = normalizeServiceError(termResult.reason);
      if (isAuthServiceError(serviceError)) {
        await maybeRedirectOnAuth("session_expired");
        return;
      }
      setCurrentTermState({
        data: null,
        loading: false,
        error: getServiceErrorMessage(serviceError, "Nao foi possivel carregar o termo biometrico atual."),
      });
    }

    if (catalogResult.status === "fulfilled") {
      setProcessingCatalogState({
        data: catalogResult.value,
        loading: false,
        error: null,
      });
    } else {
      const serviceError = normalizeServiceError(catalogResult.reason);
      if (isAuthServiceError(serviceError)) {
        await maybeRedirectOnAuth("session_expired");
        return;
      }
      setProcessingCatalogState({
        data: [],
        loading: false,
        error: getServiceErrorMessage(serviceError, "Nao foi possivel carregar o catalogo de tratamento."),
      });
    }
  }, [redirectToLogin]);

  useEffect(() => {
    void loadProfile();
    void loadPrivacy();
  }, [loadProfile, loadPrivacy]);

  const privacyActions = useUsuarioPrivacyActions({
    onProfileRefresh: loadProfile,
    onPrivacyRefresh: loadPrivacy,
  });

  const profile = mapUsuarioProfileViewModel(
    sessionProfileState.data,
    biometricStatusState.data,
    consentHistoryState.data ?? [],
    currentTermState.data,
    processingCatalogState.data ?? []
  );

  return {
    sessionProfile: sessionProfileState.data,
    biometricStatus: biometricStatusState.data,
    consentHistory: consentHistoryState.data ?? [],
    currentBiometricTerm: currentTermState.data,
    processingCatalog: processingCatalogState.data ?? [],
    loadingProfile: sessionProfileState.loading,
    loadingPrivacy:
      biometricStatusState.loading ||
      consentHistoryState.loading ||
      currentTermState.loading ||
      processingCatalogState.loading,
    profileError: sessionProfileState.error,
    biometricStatusError: biometricStatusState.error,
    currentBiometricTermError: currentTermState.error,
    consentHistoryError: consentHistoryState.error,
    processingCatalogError: processingCatalogState.error,
    profile,
    actions: privacyActions,
    refreshProfile: loadProfile,
    refreshPrivacy: loadPrivacy,
  };
};

