import { DESKTOP_BREAKPOINT_QUERY, useResponsiveMode } from "@/hooks/useResponsiveMode";

export const useVacationApprovalResponsiveMode = () =>
  useResponsiveMode(DESKTOP_BREAKPOINT_QUERY);
