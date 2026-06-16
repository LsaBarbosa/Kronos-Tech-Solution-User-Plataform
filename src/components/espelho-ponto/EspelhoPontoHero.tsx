import { Link } from "react-router-dom";
import { ArrowUpRight, BarChart3, ChevronLeft, ChevronRight, ClipboardEdit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_PATHS } from "@/config/app-routes";

interface EspelhoPontoHeroProps {
  variant: "desktop" | "mobile";
  roleLabel: string;
  referenceLabel: string;
  scopeLabel: string;
}

export const EspelhoPontoHero = ({
  variant,
  roleLabel,
  referenceLabel,
  scopeLabel,
}: EspelhoPontoHeroProps) => {
  if (variant === "mobile") {
    return (
      <section className="overflow-hidden rounded-[28px] border border-[#D8E2EC] bg-gradient-to-br from-[#102A43] via-[#1F4E5F] to-[#102A43] p-5 text-white shadow-[0_18px_50px_rgba(16,42,67,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <Badge className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Relatório fiscal oficial
            </Badge>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold leading-tight">Espelho de Ponto</h1>
              <p className="text-sm leading-6 text-white/85">
                Gere o espelho oficial em PDF para fechamento de folha, com registros originais e tratados.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="icon"
            variant="outline"
            className="h-11 w-11 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
          >
            <Link to={APP_PATHS.dashboard} aria-label="Voltar para o dashboard">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Link>
          </Button>
        </div>

        <Button
          asChild
          size="sm"
          className="mt-4 h-11 w-full gap-1 rounded-2xl bg-white text-[#102A43] hover:bg-white/90"
        >
          <Link to={APP_PATHS.relatorioDetalhado}>
            <ClipboardEdit className="h-4 w-4" />
            Relatório detalhado
            <ArrowUpRight className="ml-auto h-4 w-4" />
          </Link>
        </Button>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
            {roleLabel}
          </Badge>
          <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
            {referenceLabel}
          </Badge>
          <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
            {scopeLabel}
          </Badge>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#D8E2EC] bg-gradient-to-br from-[#102A43] via-[#1F4E5F] to-[#102A43] p-6 text-white shadow-[0_18px_50px_rgba(16,42,67,0.22)]">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-4">
          <Badge className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            Relatório fiscal oficial
          </Badge>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Espelho de Ponto</h1>
            <p className="max-w-2xl text-base leading-7 text-white/85">
              Emita o espelho oficial em PDF contendo os registros originais e tratados,
              prontos para o fechamento de folha do mês de referência.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
              {roleLabel}
            </Badge>
            <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
              {referenceLabel}
            </Badge>
            <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
              {scopeLabel}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 xl:w-[260px]">
          <Button
            asChild
            className="h-11 w-full gap-1 rounded-2xl bg-white text-[#102A43] hover:bg-white/90"
          >
            <Link to={APP_PATHS.relatorioDetalhado}>
              <ClipboardEdit className="h-4 w-4" />
              Relatório detalhado
              <ArrowUpRight className="ml-auto h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 w-full rounded-2xl border-white/20 bg-white/10 px-4 text-white hover:bg-white/15 hover:text-white"
          >
            <Link to={APP_PATHS.dashboard}>
              <ChevronLeft className="h-4 w-4" />
              Voltar ao dashboard
            </Link>
          </Button>
          <div className="hidden rounded-2xl border border-white/20 bg-white/10 p-4 xl:block">
            <BarChart3 className="h-10 w-10 text-white/80" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EspelhoPontoHero;
