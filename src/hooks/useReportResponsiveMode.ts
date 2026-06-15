import { useEffect, useState } from "react";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

export type ReportResponsiveMode = "desktop" | "mobile";

const getInitialMode = (): ReportResponsiveMode => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "desktop";
  }

  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches ? "desktop" : "mobile";
};

export const useReportResponsiveMode = () => {
  const [mode, setMode] = useState<ReportResponsiveMode>(getInitialMode);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQueryList = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const updateMode = () => {
      setMode(mediaQueryList.matches ? "desktop" : "mobile");
    };

    updateMode();

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", updateMode);
      return () => mediaQueryList.removeEventListener("change", updateMode);
    }

    mediaQueryList.addListener(updateMode);
    return () => mediaQueryList.removeListener(updateMode);
  }, []);

  return {
    mode,
    isDesktop: mode === "desktop",
    isMobile: mode === "mobile",
  };
};
