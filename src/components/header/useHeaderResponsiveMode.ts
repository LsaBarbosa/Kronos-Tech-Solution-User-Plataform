import { useEffect, useState } from "react";

const DESKTOP_MEDIA_QUERY = "(min-width: 1570px)";
const MOBILE_MEDIA_QUERY = "(max-width: 1023px)";

const getInitialMode = (): "desktop" | "compact" | "mobile" => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "desktop";
  }
  if (window.matchMedia(DESKTOP_MEDIA_QUERY).matches) {
    return "desktop";
  }

  if (window.matchMedia(MOBILE_MEDIA_QUERY).matches) {
    return "mobile";
  }

  return "compact";
};

export const useHeaderResponsiveMode = () => {
  const [mode, setMode] = useState<"desktop" | "compact" | "mobile">(getInitialMode);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const desktopMql = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const mobileMql = window.matchMedia(MOBILE_MEDIA_QUERY);
    const update = () => {
      if (desktopMql.matches) {
        setMode("desktop");
        return;
      }

      if (mobileMql.matches) {
        setMode("mobile");
        return;
      }

      setMode("compact");
    };

    update();

    if (
      typeof desktopMql.addEventListener === "function" &&
      typeof mobileMql.addEventListener === "function"
    ) {
      desktopMql.addEventListener("change", update);
      mobileMql.addEventListener("change", update);
      return () => {
        desktopMql.removeEventListener("change", update);
        mobileMql.removeEventListener("change", update);
      };
    }

    desktopMql.addListener(update);
    mobileMql.addListener(update);
    return () => {
      desktopMql.removeListener(update);
      mobileMql.removeListener(update);
    };
  }, []);

  return {
    mode,
    isDesktop: mode === "desktop",
    isCompact: mode === "compact",
    isMobile: mode === "mobile",
  };
};
