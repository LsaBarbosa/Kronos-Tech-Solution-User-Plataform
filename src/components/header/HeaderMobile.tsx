import HeaderBrand from "./HeaderBrand";
import HeaderNav from "./HeaderNav";
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
}

const HeaderMobile = ({
  role,
  fullName,
  email,
  pendingCount,
  pendingHasError,
  pendingLoading,
  onLogout,
}: HeaderMobileProps) => {
  return (
    <div className="relative flex h-16 items-center justify-between gap-2 px-3 sm:px-4">
      <div className="relative z-10 shrink-0">
        <HeaderNav role={role} variant="mobile" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 flex justify-center">
        <div className="pointer-events-auto">
          <HeaderBrand variant="mobile" />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
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
