import { DESKTOP_BREAKPOINT_QUERY, useResponsiveMode } from "@/hooks/useResponsiveMode";

export const useApprovalsResponsiveMode = () =>
  useResponsiveMode(DESKTOP_BREAKPOINT_QUERY);
