import { APP_ROUTE_META, type AppRouteMeta } from "@/config/app-routes";

export const findRouteMetaByPath = (pathname: string): AppRouteMeta | null => {
  const matches = Object.values(APP_ROUTE_META).filter((route) => {
    if (route.path === pathname) return true;
    if (route.path === "/") return pathname === "/";
    if (route.path.includes(":")) {
      const pattern = new RegExp(
        "^" + route.path.replace(/:[^/]+/g, "[^/]+") + "$"
      );
      return pattern.test(pathname);
    }
    return pathname === route.path || pathname.startsWith(route.path + "/");
  });

  if (matches.length === 0) return null;

  return matches.sort((a, b) => b.path.length - a.path.length)[0];
};

export interface RoleChipCopy {
  label: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
}

export const getRoleChip = (role: string | undefined | null): RoleChipCopy => {
  switch (role) {
    case "CTO":
      return {
        label: "CTO",
        textClass: "text-[#5B21B6]",
        bgClass: "bg-[#EDE9FE]",
        borderClass: "border-[#DDD6FE]",
      };
    case "MANAGER":
      return {
        label: "Gestor",
        textClass: "text-[#1D4ED8]",
        bgClass: "bg-[#EFF6FF]",
        borderClass: "border-[#BFDBFE]",
      };
    case "PARTNER":
      return {
        label: "Colaborador",
        textClass: "text-[#0F766E]",
        bgClass: "bg-[#CCFBF1]",
        borderClass: "border-[#99F6E4]",
      };
    default:
      return {
        label: "Perfil",
        textClass: "text-[#475569]",
        bgClass: "bg-[#F1F5F9]",
        borderClass: "border-[#E2E8F0]",
      };
  }
};

export const getInitials = (name: string | undefined | null): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};
