import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_PATHS } from "@/config/app-routes";
import { cn } from "@/lib/utils";

interface HeaderNotificationsProps {
  pendingCount: number;
  hasError: boolean;
  isLoading: boolean;
  variant: "desktop" | "mobile";
}

const PENDING_PANEL_ID = "dashboard-pending-panel";

const HeaderNotifications = ({
  pendingCount,
  hasError,
  isLoading,
  variant,
}: HeaderNotificationsProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.pathname === APP_PATHS.dashboard) {
      const target = document.getElementById(PENDING_PANEL_ID);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate(APP_PATHS.dashboard, { state: { scrollTo: "pending" } });
  };

  const ariaLabel =
    pendingCount > 0
      ? `Abrir pendências operacionais · ${pendingCount} aprovação(ões) em aberto`
      : "Abrir pendências operacionais";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={cn(
        "relative text-[#0F172A] hover:bg-[#F1F5F9]",
        variant === "desktop" ? "h-10 w-10" : "h-9 w-9"
      )}
    >
      {hasError ? (
        <BellOff className="h-5 w-5 text-[#94A3B8]" aria-hidden="true" />
      ) : (
        <AlertTriangle
          className={cn(
            "h-5 w-5",
            isLoading
              ? "animate-pulse text-[#94A3B8]"
              : pendingCount > 0
                ? "text-[#B91C1C]"
                : "text-[#0F172A]"
          )}
          aria-hidden="true"
        />
      )}
      {pendingCount > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full border border-white bg-[#DC2626] px-1 text-[10px] font-bold leading-none text-white"
        >
          {pendingCount > 9 ? "9+" : pendingCount}
        </span>
      ) : null}
    </Button>
  );
};

export default HeaderNotifications;
