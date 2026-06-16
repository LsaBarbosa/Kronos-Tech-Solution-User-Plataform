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
    <div className="flex h-16 items-center gap-2 px-3 sm:px-4">
      <HeaderNav role={role} variant="mobile" />
      <HeaderBrand variant="mobile" />
      <div className="ml-2 flex min-w-0 flex-1" />
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
