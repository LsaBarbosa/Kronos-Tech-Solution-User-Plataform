import { useEffect, useState } from "react";

export type ResponsiveMode = "desktop" | "mobile";

export interface ResponsiveModeState {
  mode: ResponsiveMode;
  isDesktop: boolean;
  isMobile: boolean;
}

const resolveInitialMode = (query: string): ResponsiveMode => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "desktop";
  }
  return window.matchMedia(query).matches ? "desktop" : "mobile";
};

export const useResponsiveMode = (query: string): ResponsiveModeState => {
  const [mode, setMode] = useState<ResponsiveMode>(() => resolveInitialMode(query));

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    const updateMode = () => setMode(mediaQueryList.matches ? "desktop" : "mobile");
    updateMode();

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", updateMode);
      return () => mediaQueryList.removeEventListener("change", updateMode);
    }

    mediaQueryList.addListener(updateMode);
    return () => mediaQueryList.removeListener(updateMode);
  }, [query]);

  return { mode, isDesktop: mode === "desktop", isMobile: mode === "mobile" };
};

export const DESKTOP_BREAKPOINT_QUERY = "(min-width: 1024px)";
