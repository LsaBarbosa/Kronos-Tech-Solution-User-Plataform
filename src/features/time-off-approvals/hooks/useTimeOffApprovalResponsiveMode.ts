import { DESKTOP_BREAKPOINT_QUERY, useResponsiveMode } from "@/hooks/useResponsiveMode";

export const useTimeOffApprovalResponsiveMode = () =>
  useResponsiveMode(DESKTOP_BREAKPOINT_QUERY);
