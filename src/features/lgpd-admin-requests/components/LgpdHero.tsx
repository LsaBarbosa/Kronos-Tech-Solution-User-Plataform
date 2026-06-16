import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LgpdAdminKpis } from "../hooks/useLgpdAdminRequestsViewModel";

interface LgpdHeroProps {
  variant: "desktop" | "mobile";
  kpis: LgpdAdminKpis;
  totalLoaded: number;
}

interface KpiTileProps {
  label: string;
  value: number;
  toneClass?: string;
}

const KpiTile = ({ label, value, toneClass }: KpiTileProps) => (
  <div className="min-w-[88px] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white">
    <p className={cn("text-2xl font-bold leading-none", toneClass)}>{value}</p>
    <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/75">
      {label}
    </p>
  </div>
);

const MobileKpiTile = ({ label, value, toneClass }: KpiTileProps) => (
  <Card className="border border-[#E2E8F0] bg-white shadow-none">
    <CardContent className="p-3">
      <p className={cn("text-xl font-bold leading-none", toneClass ?? "text-[#1D4ED8]")}>
        {value}
      </p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#64748B]">
        {label}
      </p>
    </CardContent>
  </Card>
);

export const LgpdHero = ({ variant, kpis, totalLoaded }: LgpdHeroProps) => {
  if (variant === "mobile") {
    return (
      <div className="space-y-4">
        <section className="overflow-hidden rounded-[28px] border border-[#101A33] bg-gradient-to-br from-[#0B1220] via-[#101A33] to-[#1E3A8A] p-5 text-white shadow-[0_18px_50px_rgba(11,18,32,0.32)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <Badge className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                Governança LGPD
              </Badge>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold leading-tight">Fila LGPD</h1>
                <p className="text-sm leading-6 text-white/80">
                  Triagem de direitos do titular.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-3">
          <MobileKpiTile label="abertas" value={kpis.open} toneClass="text-[#1D4ED8]" />
          <MobileKpiTile label="atraso" value={kpis.overdue} toneClass="text-[#B91C1C]" />
          <MobileKpiTile
            label="exportar"
            value={kpis.approvedForExport}
            toneClass="text-[#15803D]"
          />
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#101A33] bg-gradient-to-br from-[#0B1220] via-[#101A33] to-[#1E3A8A] p-6 text-white shadow-[0_18px_50px_rgba(11,18,32,0.32)]">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-4">
          <Badge className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            Requisições LGPD
          </Badge>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              Fila de governança dos direitos do titular
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/80">
              Triagem, SLA, atribuição, análise legal, exportação aprovada e encerramento documentado.
            </p>
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/60">
            {totalLoaded} solicitação(ões) carregada(s) nesta página
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiTile label="abertas" value={kpis.open} />
          <KpiTile label="em análise" value={kpis.inAnalysis} />
          <KpiTile label="atrasadas" value={kpis.overdue} toneClass="text-[#FCA5A5]" />
          <KpiTile label="exportáveis" value={kpis.approvedForExport} toneClass="text-[#86EFAC]" />
        </div>
      </div>
    </section>
  );
};

export default LgpdHero;
