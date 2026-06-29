import { Suspense, lazy } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const TerminalCheckinMobile = lazy(() => import("./TerminalCheckinMobile"));
const TerminalCheckinDesktop = lazy(() => import("./TerminalCheckinDesktop"));

export default function TerminalCheckin() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <Suspense fallback={null}>
      {isMobile ? <TerminalCheckinMobile /> : <TerminalCheckinDesktop />}
    </Suspense>
  );
}
