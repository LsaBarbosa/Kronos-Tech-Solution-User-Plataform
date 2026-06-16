// src/components/Header.tsx

import { useCallback } from "react";
import HeaderDesktop from "@/components/header/HeaderDesktop";
import HeaderMobile from "@/components/header/HeaderMobile";
import { useHeaderResponsiveMode } from "@/components/header/useHeaderResponsiveMode";
import { useHeaderPendingCount } from "@/components/header/useHeaderPendingCount";
import { useAuth } from "@/context/AuthContext";
import { headerStyles } from "@/utils/layout-colors";

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header = (_props: HeaderProps = {}) => {
  const { isDesktop } = useHeaderResponsiveMode();
  const { status, user, role, logout } = useAuth();

  const fullName = user?.profile?.fullName ?? null;
  const email = user?.profile?.email ?? null;

  const { totalPending, isLoading, hasError } = useHeaderPendingCount(
    role,
    status === "authenticated"
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const sharedProps = {
    role,
    fullName,
    email,
    pendingCount: totalPending,
    pendingHasError: hasError,
    pendingLoading: isLoading,
    onLogout: handleLogout,
  };

  return (
    <header className={headerStyles.container}>
      {isDesktop ? <HeaderDesktop {...sharedProps} /> : <HeaderMobile {...sharedProps} />}
    </header>
  );
};

export default Header;
