import type { UsuarioProfileViewModel } from "@/features/user-profile/mappers/usuario-profile.mapper";
import type { UsuarioPrivacyActions } from "@/features/user-profile/hooks/useUsuarioPrivacyActions";

export type UsuarioMobileSection = "identidade" | "contato" | "senha" | "lgpd";

export interface UsuarioProfileSharedProps {
  profile: UsuarioProfileViewModel;
  actions: UsuarioPrivacyActions;
  loadingProfile: boolean;
  loadingPrivacy: boolean;
  profileError: string | null;
  biometricStatusError: string | null;
  currentBiometricTermError: string | null;
  consentHistoryError: string | null;
  processingCatalogError: string | null;
  onRefreshProfile: () => Promise<void>;
  onRefreshPrivacy: () => Promise<void>;
}
