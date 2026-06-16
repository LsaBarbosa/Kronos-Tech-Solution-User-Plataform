import { DESKTOP_BREAKPOINT_QUERY, useResponsiveMode } from "@/hooks/useResponsiveMode";

export const useLgpdAdminResponsiveMode = () =>
  useResponsiveMode(DESKTOP_BREAKPOINT_QUERY);
