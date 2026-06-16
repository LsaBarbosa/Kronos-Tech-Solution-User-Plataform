import HeaderBrand from "./HeaderBrand";
import HeaderNav from "./HeaderNav";
import HeaderNotifications from "./HeaderNotifications";
import HeaderAccountMenu from "./HeaderAccountMenu";

interface HeaderDesktopProps {
  role: string;
  fullName: string | null | undefined;
  email: string | null | undefined;
  pendingCount: number;
  pendingHasError: boolean;
  pendingLoading: boolean;
  onLogout: () => Promise<void>;
}

const HeaderDesktop = ({
  role,
  fullName,
  email,
  pendingCount,
  pendingHasError,
  pendingLoading,
  onLogout,
}: HeaderDesktopProps) => {
  return (
    <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <HeaderBrand variant="desktop" />
      </div>

      <div className="flex min-w-0 flex-1 justify-center">
        <HeaderNav role={role} variant="desktop" />
      </div>

      <div className="flex items-center justify-end gap-2 sm:gap-3">
        <HeaderNotifications
          pendingCount={pendingCount}
          hasError={pendingHasError}
          isLoading={pendingLoading}
          variant="desktop"
        />
        <HeaderAccountMenu
          fullName={fullName}
          email={email}
          role={role}
          variant="desktop"
          onLogout={onLogout}
        />
      </div>
    </div>
  );
};

export default HeaderDesktop;
