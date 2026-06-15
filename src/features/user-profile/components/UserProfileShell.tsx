import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useUsuarioProfileViewModel } from "@/features/user-profile/hooks/useUsuarioProfileViewModel";
import { useUsuarioResponsiveMode } from "@/features/user-profile/hooks/useUsuarioResponsiveMode";
import { usuarioProfileTokens } from "@/features/user-profile/styles/usuario-profile.tokens";
import UsuarioDesktopView from "./UsuarioDesktopView";
import UsuarioMobileView from "./UsuarioMobileView";

const UserProfileShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const {
    profile,
    actions,
    loadingProfile,
    loadingPrivacy,
    profileError,
    biometricStatusError,
    currentBiometricTermError,
    consentHistoryError,
    processingCatalogError,
    refreshProfile,
    refreshPrivacy,
  } = useUsuarioProfileViewModel();
  const { isDesktop } = useUsuarioResponsiveMode();

  const viewProps = {
    profile,
    actions,
    loadingProfile,
    loadingPrivacy,
    profileError,
    biometricStatusError,
    currentBiometricTermError,
    consentHistoryError,
    processingCatalogError,
    onRefreshProfile: refreshProfile,
    onRefreshPrivacy: refreshPrivacy,
  } as const;

  return (
    <>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />
      <Header toggleSidebar={handleToggleSidebar} />
      <div
        className="min-h-screen pt-16"
        style={{ background: usuarioProfileTokens.gradients.veil }}
      >
        {loadingProfile && !profile.identity ? (
          <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
            <Card className="rounded-[24px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
              <CardContent className="flex items-center gap-3 px-6 py-8 text-[#627D98]">
                <Loader2 className="h-5 w-5 animate-spin text-[#1F4E5F]" />
                Carregando seu perfil...
              </CardContent>
            </Card>
          </div>
        ) : isDesktop ? (
          <UsuarioDesktopView {...viewProps} />
        ) : (
          <UsuarioMobileView {...viewProps} />
        )}
      </div>
    </>
  );
};

export default UserProfileShell;
