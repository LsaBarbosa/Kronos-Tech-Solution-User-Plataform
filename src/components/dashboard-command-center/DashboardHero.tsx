import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CalendarDays, ShieldCheck, Sparkles, User2 } from "lucide-react";
import { getFirstName } from "@/utils/dashboard-utils";

interface DashboardHeroProps {
  variant: "desktop" | "mobile";
  isLoading: boolean;
  profileUnavailable: boolean;
  fullName: string | undefined;
  roleLabel: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

const formatCurrentDate = () =>
  new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date());

const DashboardHero = ({
  variant,
  isLoading,
  profileUnavailable,
  fullName,
  roleLabel,
  onPrimaryAction,
  onSecondaryAction,
}: DashboardHeroProps) => {
  const firstName = isLoading ? "..." : getFirstName(fullName);
  const dateLabel = formatCurrentDate();
  const operationLabel = isLoading
    ? "Carregando perfil"
    : profileUnavailable
      ? "Perfil indisponível"
      : "Operação ativa";

  if (variant === "mobile") {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <div className="bg-[linear-gradient(135deg,#0B1220_0%,#101A33_52%,#1E3A8A_100%)] px-5 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-sm font-black text-[#0B1220]"
                >
                  K
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                  Dashboard
                </span>
              </div>
              <h1 className="text-xl font-semibold leading-tight">Olá, {firstName}</h1>
              <p className="text-xs leading-5 text-white/80 first-letter:uppercase">{dateLabel}</p>
            </div>
            <Badge className="shrink-0 border-white/15 bg-white/10 text-white">{roleLabel}</Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="border-white/15 bg-white/10 text-white">
              <ShieldCheck className="mr-1.5 h-3 w-3" />
              {operationLabel}
            </Badge>
            <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-50">Kronos</Badge>
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
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Dashboard Kronos
              </Badge>
              <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-50">Kronos Command Center</Badge>
              <Badge className="border-white/15 bg-white/10 text-white">{roleLabel}</Badge>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/68">
                Centro operacional
              </p>
              <h1 className="text-3xl font-semibold leading-tight xl:text-4xl">
                Centro operacional de jornada e conformidade
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-white/78 sm:text-base">
                Relógio online, check-in, avisos, pendências, perfil e atalhos conforme sua função.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="border-white/15 bg-white/10 px-3 py-1.5 text-white">
                <User2 className="mr-2 h-3.5 w-3.5" />
                Olá, {firstName}
              </Badge>
              <Badge className="border-white/15 bg-white/10 px-3 py-1.5 text-white capitalize">
                <CalendarDays className="mr-2 h-3.5 w-3.5" />
                {dateLabel}
              </Badge>
              <Badge className="border-white/15 bg-white/10 px-3 py-1.5 text-white">
                <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                {operationLabel}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 xl:w-[280px]">
            <Button
              type="button"
              size="lg"
              onClick={onPrimaryAction}
              className="h-12 w-full gap-1 bg-white text-[#0B1220] hover:bg-white/90"
            >
              Abrir relatório
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onSecondaryAction}
              className="h-12 w-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              Meu perfil
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DashboardHero;
