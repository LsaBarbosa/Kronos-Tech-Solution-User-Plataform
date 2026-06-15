import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeaderBrand from "./HeaderBrand";
import HeaderRouteContext from "./HeaderRouteContext";
import HeaderRoleChip from "./HeaderRoleChip";
import HeaderNotifications from "./HeaderNotifications";
import HeaderAccountMenu from "./HeaderAccountMenu";

interface HeaderMobileProps {
  role: string;
  fullName: string | null | undefined;
  email: string | null | undefined;
  pendingCount: number;
  pendingHasError: boolean;
  pendingLoading: boolean;
  onLogout: () => Promise<void>;
  onToggleSidebar: () => void;
}

const HeaderMobile = ({
  role,
  fullName,
  email,
  pendingCount,
  pendingHasError,
  pendingLoading,
  onLogout,
  onToggleSidebar,
}: HeaderMobileProps) => {
  return (
    <div className="flex h-16 items-center gap-2 px-3 sm:px-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        aria-label="Abrir menu lateral"
        className="h-10 w-10 shrink-0 text-[#0F172A] hover:bg-[#F1F5F9]"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <HeaderBrand variant="mobile" />
      <div className="ml-2 flex min-w-0 flex-1 items-center gap-2">
        <div className="min-w-0">
          <HeaderRouteContext variant="mobile" />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <HeaderRoleChip role={role} size="xs" />
        <HeaderNotifications
          pendingCount={pendingCount}
          hasError={pendingHasError}
          isLoading={pendingLoading}
          variant="mobile"
        />
        <HeaderAccountMenu
          fullName={fullName}
          email={email}
          role={role}
          variant="mobile"
          onLogout={onLogout}
        />
      </div>
    </div>
  );
};

export default HeaderMobile;
