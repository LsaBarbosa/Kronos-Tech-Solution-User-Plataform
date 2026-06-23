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
      className="flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
    >
      <img
        src={variant === "desktop" ? "/logo_simbolo.png" : "/logo_mobile_1.png"}
        alt=""
        aria-hidden="true"
        className={cn(
          "w-auto object-contain",
          variant === "desktop" ? "h-10" : "h-14 max-w-[220px]"
        )}
      />
    </Link>
  );
};

export default HeaderBrand;
