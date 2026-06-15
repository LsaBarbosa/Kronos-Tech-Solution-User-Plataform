import { useEffect, useState } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";

export const useVacationApprovalResponsiveMode = () => {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(DESKTOP_QUERY).matches
      : true
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(DESKTOP_QUERY);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    setIsDesktop(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return isDesktop;
};
