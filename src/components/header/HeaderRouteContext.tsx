import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { findRouteMetaByPath } from "./header.helpers";

interface HeaderRouteContextProps {
  variant: "desktop" | "mobile";
}

const HeaderRouteContext = ({ variant }: HeaderRouteContextProps) => {
  const location = useLocation();
  const meta = findRouteMetaByPath(location.pathname);
  const label = meta?.label ?? "Kronos";
  const breadcrumb = meta?.breadcrumbs ?? [];
  const previous = breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2] : null;

  return (
    <div className="min-w-0">
      {variant === "desktop" && previous ? (
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
          {previous.label} <span aria-hidden="true">/</span>
        </p>
      ) : null}
      <p
        className={cn(
          "truncate font-semibold text-[#0F172A]",
          variant === "desktop" ? "text-sm" : "text-xs"
        )}
        title={label}
      >{`› ${label}`}</p>
    </div>
  );
};

export default HeaderRouteContext;
