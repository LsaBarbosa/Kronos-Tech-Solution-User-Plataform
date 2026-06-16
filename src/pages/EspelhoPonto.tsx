import { useCallback, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import { useAuth } from "@/context/AuthContext";
import { useReportResponsiveMode } from "@/hooks/useReportResponsiveMode";
import {
  EspelhoPontoDesktop,
  EspelhoPontoMobile,
  useEspelhoPontoViewModel,
} from "@/components/espelho-ponto";

const ROLE_LABELS: Record<string, string> = {
  MANAGER: "Gestor",
  CTO: "CTO",
  PARTNER: "Sócio",
};

export default function EspelhoPonto() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const viewModel = useEspelhoPontoViewModel();
  const { isDesktop } = useReportResponsiveMode();
  const { role } = useAuth();

  const roleLabel = useMemo(() => ROLE_LABELS[role ?? ""] ?? "Colaborador", [role]);

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
      mainClassName="pt-16 px-4 py-5 sm:px-6 sm:py-8 lg:px-8 relative z-10 overflow-x-hidden bg-[#D9E2EB]"
    >
      <div className="mx-auto w-full max-w-7xl">
        {isDesktop ? (
          <EspelhoPontoDesktop viewModel={viewModel} roleLabel={roleLabel} />
        ) : (
          <EspelhoPontoMobile viewModel={viewModel} roleLabel={roleLabel} />
        )}
      </div>
    </PageShell>
  );
}
