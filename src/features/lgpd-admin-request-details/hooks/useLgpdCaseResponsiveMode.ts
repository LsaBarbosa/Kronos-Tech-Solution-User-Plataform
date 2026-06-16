import { DESKTOP_BREAKPOINT_QUERY, useResponsiveMode } from "@/hooks/useResponsiveMode";

export const useLgpdCaseResponsiveMode = () =>
  useResponsiveMode(DESKTOP_BREAKPOINT_QUERY);
