import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CalendarCheck, ClipboardCheck, Clock, ShieldCheck } from "lucide-react";

interface TimeOffApprovalHeroProps {
  variant: "desktop" | "mobile";
  pending: number;
  visible: number;
  withEvidence: number;
}

const Stat = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) => (
  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    {hint ? <p className="text-[11px] text-white/65">{hint}</p> : null}
  </div>
);

const TimeOffApprovalHero = ({
  variant,
  pending,
  visible,
  withEvidence,
}: TimeOffApprovalHeroProps) => {
  if (variant === "mobile") {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <div className="bg-[linear-gradient(135deg,#0B1220_0%,#101A33_52%,#1E3A8A_100%)] px-5 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-cyan-300" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                  Aprovação de abonos
                </span>
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-semibold leading-tight">
                  Mesa de aprovação gerencial
                </h1>
                <p className="text-sm leading-6 text-white/78">
                  Analise solicitações, valide evidência e aplique a decisão.
                </p>
              </div>
            </div>
            <Badge className="shrink-0 border border-[#FCD34D]/70 bg-[#FEF3C7]/90 text-[#92400E]">
              {pending} pendentes
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/70">Na fila</p>
              <p className="text-lg font-semibold text-white">{visible}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/70">Com anexo</p>
              <p className="text-lg font-semibold text-white">{withEvidence}</p>
            </div>
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
              <Badge className="border-white/15 bg-white/10 text-white">Time-Off Approval Desk</Badge>
              <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-50">Gestão</Badge>
              <Badge className="border border-[#FCD34D]/70 bg-[#FEF3C7]/90 text-[#92400E]">
                {pending} pendentes
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/68">
                Aprovação de abonos
              </p>
              <h1 className="text-3xl font-semibold leading-tight xl:text-4xl">
                Mesa de aprovação gerencial de abonos
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-white/78 sm:text-base">
                Filtre por colaborador e status, valide a evidência anexada e aplique a decisão com
                impacto explícito nas horas e nos registros.
              </p>
            </div>
          </div>

          <div className="grid w-full max-w-md grid-cols-3 gap-3 xl:w-[420px]">
            <Stat label="Pendentes" value={pending} hint="aguardando decisão" />
            <Stat label="Na fila" value={visible} hint="página atual" />
            <Stat label="Com anexo" value={withEvidence} hint="evidência disponível" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge className="border-white/15 bg-white/10 px-3 py-1.5 text-white">
            <CalendarCheck className="mr-2 h-3.5 w-3.5" />
            Impacto trabalhista
          </Badge>
          <Badge className="border-white/15 bg-white/10 px-3 py-1.5 text-white">
            <Clock className="mr-2 h-3.5 w-3.5" />
            Horas detalhadas
          </Badge>
          <Badge className="border-white/15 bg-white/10 px-3 py-1.5 text-white">
            <ShieldCheck className="mr-2 h-3.5 w-3.5" />
            Decisão rastreável
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default TimeOffApprovalHero;
