import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LgpdExportManifest } from "@/types/legal";
import type { ChangePasswordData } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { preloadCsrfToken } from "@/service/csrf.service";
import {
  changePassword,
  type UpdateOwnProfilePayload,
  updateOwnProfile,
} from "@/service/user.service";
import {
  getServiceErrorMessage,
  isAuthServiceError,
  normalizeServiceError,
} from "@/service/helpers/service-error.helper";
import { exportMyData } from "@/service/lgpd.service";
import { revokeBiometricTerms } from "@/service/terms.service";

export interface UseUsuarioPrivacyActionsOptions {
  onProfileRefresh: () => Promise<void> | void;
  onPrivacyRefresh: () => Promise<void> | void;
}

export interface UsuarioPrivacyActions {
  isSavingContact: boolean;
  isChangingPassword: boolean;
  isExportingData: boolean;
  isRevokingBiometric: boolean;
  lastExportManifest: LgpdExportManifest | null;
  saveContact: (payload: UpdateOwnProfilePayload) => Promise<void>;
  changeUserPassword: (payload: ChangePasswordData) => Promise<void>;
  exportUserData: () => Promise<void>;
  revokeBiometricConsent: () => Promise<void>;
  clearExportManifest: () => void;
}

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const isValidPhoneDigits = (value?: string) => {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
};

export const useUsuarioPrivacyActions = ({
  onProfileRefresh,
  onPrivacyRefresh,
}: UseUsuarioPrivacyActionsOptions): UsuarioPrivacyActions => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();
  const isMountedRef = useRef(true);

  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  const [isRevokingBiometric, setIsRevokingBiometric] = useState(false);
  const [lastExportManifest, setLastExportManifest] = useState<LgpdExportManifest | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const redirectToLogin = useCallback(
    async (reason: string) => {
      await logout();
      navigate("/login", { replace: true, state: { reason } });
    },
    [logout, navigate]
  );

  const handleActionError = useCallback(
    async (error: unknown, fallbackMessage: string) => {
      const serviceError = normalizeServiceError(error);

      if (isAuthServiceError(serviceError)) {
        await redirectToLogin("session_expired");
        return true;
      }

      toast.error(getServiceErrorMessage(serviceError, fallbackMessage));
      return false;
    },
    [redirectToLogin, toast]
  );

  const saveContact = useCallback(
    async (payload: UpdateOwnProfilePayload) => {
      const email = payload.email?.trim();
      const phone = payload.phone?.trim();

      if (!email && !phone) {
        toast.error("Preencha pelo menos um campo de contato.");
        return;
      }

      if (email && !isValidEmail(email)) {
        toast.error("Informe um e-mail valido.");
        return;
      }

      if (phone && !isValidPhoneDigits(phone)) {
        toast.error("Informe um telefone valido com DDD.");
        return;
      }

      if (isSavingContact) {
        return;
      }

      setIsSavingContact(true);

      try {
        await preloadCsrfToken();
        await updateOwnProfile({ email, phone });

        await Promise.resolve(onProfileRefresh());
        await Promise.resolve(onPrivacyRefresh());

        if (!isMountedRef.current) {
          return;
        }

        toast.success("Contato atualizado com sucesso.");
      } catch (error) {
        await handleActionError(error, "Nao foi possivel atualizar o contato.");
      } finally {
        if (isMountedRef.current) {
          setIsSavingContact(false);
        }
      }
    },
    [handleActionError, isSavingContact, onPrivacyRefresh, onProfileRefresh, toast]
  );

  const changeUserPassword = useCallback(
    async (payload: ChangePasswordData) => {
      if (isChangingPassword) {
        return;
      }

      if (!payload.currentPassword || !payload.newPassword || !payload.confirmPassword) {
        toast.error("Preencha os tres campos de senha.");
        return;
      }

      if (payload.newPassword !== payload.confirmPassword) {
        toast.error("A nova senha e a confirmacao precisam ser iguais.");
        return;
      }

      if (payload.newPassword.length < 8) {
        toast.error("A nova senha precisa ter ao menos 8 caracteres.");
        return;
      }

      setIsChangingPassword(true);

      try {
        await preloadCsrfToken();
        await changePassword(payload);

        if (!isMountedRef.current) {
          return;
        }

        toast.success("Senha alterada. A sessao sera encerrada por seguranca.");
        await redirectToLogin("password_changed");
      } catch (error) {
        await handleActionError(error, "Nao foi possivel alterar a senha.");
      } finally {
        if (isMountedRef.current) {
          setIsChangingPassword(false);
        }
      }
    },
    [handleActionError, isChangingPassword, redirectToLogin, toast]
  );

  const exportUserData = useCallback(async () => {
    if (isExportingData) {
      return;
    }

    setIsExportingData(true);

    try {
      const response = await exportMyData();
      const manifest = response.manifest;

      const fileName = `meus-dados-${manifest.exportId || Date.now().toString()}.json`;
      const json = JSON.stringify(response, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      link.rel = "noopener";

      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      if (!isMountedRef.current) {
        return;
      }

      setLastExportManifest(manifest);
      toast.success("Exportacao concluida. O arquivo foi baixado.");
    } catch (error) {
      await handleActionError(error, "Nao foi possivel exportar os dados.");
    } finally {
      if (isMountedRef.current) {
        setIsExportingData(false);
      }
    }
  }, [handleActionError, isExportingData, toast]);

  const revokeBiometricConsent = useCallback(async () => {
    if (isRevokingBiometric) {
      return;
    }

    setIsRevokingBiometric(true);

    try {
      await revokeBiometricTerms();

      if (!isMountedRef.current) {
        return;
      }

      toast.success("Biometria revogada. A sessao sera encerrada por seguranca.");
      await redirectToLogin("biometric_revoked");
    } catch (error) {
      await handleActionError(error, "Nao foi possivel revogar o consentimento biometrico.");
    } finally {
      if (isMountedRef.current) {
        setIsRevokingBiometric(false);
      }
    }
  }, [handleActionError, isRevokingBiometric, redirectToLogin, toast]);

  const clearExportManifest = useCallback(() => {
    setLastExportManifest(null);
  }, []);

  return {
    isSavingContact,
    isChangingPassword,
    isExportingData,
    isRevokingBiometric,
    lastExportManifest,
    saveContact,
    changeUserPassword,
    exportUserData,
    revokeBiometricConsent,
    clearExportManifest,
  };
};
