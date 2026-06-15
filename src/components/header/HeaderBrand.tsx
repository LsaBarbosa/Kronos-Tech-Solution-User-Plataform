import { Link } from "react-router-dom";
import { APP_PATHS } from "@/config/app-routes";
import { cn } from "@/lib/utils";

interface HeaderBrandProps {
  variant: "desktop" | "mobile";
}

const HeaderBrand = ({ variant }: HeaderBrandProps) => {
  return (
    <Link
      to={APP_PATHS.dashboard}
      aria-label="Ir para o dashboard"
      className="flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex items-center justify-center rounded-xl bg-[#0B1220] text-white",
          variant === "desktop" ? "h-9 w-9 text-sm font-black" : "h-8 w-8 text-xs font-black"
        )}
      >
        K
      </span>
      <span
        className={cn(
          "font-semibold tracking-[0.18em] text-[#0F172A]",
          variant === "desktop" ? "text-sm sm:text-base" : "text-sm"
        )}
      >
        Kronos
      </span>
    </Link>
  );
};

export default HeaderBrand;
