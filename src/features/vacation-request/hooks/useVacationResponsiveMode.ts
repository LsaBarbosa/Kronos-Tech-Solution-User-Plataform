import { useEffect, useState } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";

export const useVacationResponsiveMode = () => {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.matchMedia(DESKTOP_QUERY).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY);

    const syncMode = () => {
      setIsDesktop(mediaQuery.matches);
    };

    syncMode();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncMode);
      return () => mediaQuery.removeEventListener("change", syncMode);
    }

    mediaQuery.addListener(syncMode);
    return () => mediaQuery.removeListener(syncMode);
  }, []);

  return {
    isDesktop,
    isMobile: !isDesktop,
  };
};

