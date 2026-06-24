import HeaderBrand from "./HeaderBrand";
import HeaderNav from "./HeaderNav";
import HeaderNotifications from "./HeaderNotifications";
import HeaderAccountMenu from "./HeaderAccountMenu";
import { FaqSearchTrigger } from "@/components/faq/FaqSearchTrigger";

interface HeaderDesktopProps {
  role: string;
  fullName: string | null | undefined;
  email: string | null | undefined;
  pendingCount: number;
  pendingHasError: boolean;
  pendingLoading: boolean;
  onLogout: () => Promise<void>;
  navVariant?: "desktop" | "mobile";
}

const HeaderDesktop = ({
  role,
  fullName,
  email,
  pendingCount,
  pendingHasError,
  pendingLoading,
  onLogout,
  navVariant = "desktop",
}: HeaderDesktopProps) => {
  return (
    <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <HeaderBrand variant="desktop" />
      </div>

      <div
        className={
          navVariant === "desktop"
            ? "flex min-w-0 flex-1 justify-center"
            : "ml-2 flex min-w-0 flex-1 justify-start"
        }
      >
        <HeaderNav role={role} variant={navVariant} />
      </div>

      <div className="flex items-center justify-end gap-2 sm:gap-3">
        <FaqSearchTrigger />
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
