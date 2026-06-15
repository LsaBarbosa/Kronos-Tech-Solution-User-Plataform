import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ClipboardCheck, ScrollText, ShieldCheck } from "lucide-react";

interface ApprovalHeroProps {
  variant: "desktop" | "mobile";
  pendingTotal: number;
}

const ApprovalHero = ({ variant, pendingTotal }: ApprovalHeroProps) => {
  if (variant === "mobile") {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <div className="bg-[linear-gradient(135deg,#0B1220_0%,#101A33_52%,#1E3A8A_100%)] px-5 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-cyan-300" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                  Apuração de horas
                </span>
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-semibold leading-tight">
                  Decisão de ajustes de ponto
                </h1>
                <p className="text-sm leading-6 text-white/78">
                  Compare o registro atual com a proposta antes de aprovar ou rejeitar.
                </p>
              </div>
            </div>
            <Badge className="shrink-0 border border-[#FCD34D]/70 bg-[#FEF3C7]/90 text-[#92400E]">
              {pendingTotal} pendentes
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-border/70 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.20),transparent_30%)]" />
      <div className="relative bg-[linear-gradient(135deg,#0B1220_0%,#101A33_52%,#1E3A8A_100%)] px-6 py-7 text-white sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/15 bg-white/10 text-white">
                Time Adjustment Approval Desk
              </Badge>
              <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-50">Gestão</Badge>
              <Badge className="border border-[#FCD34D]/70 bg-[#FEF3C7]/90 text-[#92400E]">
                {pendingTotal} pendentes
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/68">
                Apuração de horas
              </p>
              <h1 className="text-3xl font-semibold leading-tight xl:text-4xl">
                Decida ajustes de ponto com contexto e comparação
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-white/78 sm:text-base">
                Filtre por colaborador, compare o registro atual com a proposta de alteração e aprove
                ou rejeite com impacto trabalhista visível.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="border-white/15 bg-white/10 px-3 py-1.5 text-white">
                <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                Decisão rastreável
              </Badge>
              <Badge className="border-white/15 bg-white/10 px-3 py-1.5 text-white">
                <ScrollText className="mr-2 h-3.5 w-3.5" />
                Comparativo atual × proposto
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ApprovalHero;
