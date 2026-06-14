import { ArrowRight, CalendarRange, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VacationHeroProps {
  title: string;
  subtitle: string;
  label?: string;
  metrics?: Array<{
    label: string;
    value: string;
    helper?: string;
  }>;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  className?: string;
}

const VacationHero = ({
  title,
  subtitle,
  label = "Férias · Solicitação",
  metrics = [],
  onPrimaryAction,
  primaryActionLabel = "Revisar período",
  className,
}: VacationHeroProps) => {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[32px] border border-[#1E3A8A]/10 bg-[#0B1220] p-6 text-white shadow-[0_24px_70px_rgba(11,18,32,0.24)] sm:p-8",
        className
      )}
    >
      <div className="absolute -right-10 -top-6 h-44 w-44 rounded-full border border-white/25 opacity-80" />
      <div className="absolute right-24 top-0 h-36 w-36 rounded-full border border-white/15 opacity-60" />
      <div className="absolute right-40 top-8 h-28 w-28 rounded-full border border-white/10 opacity-50" />
      <div className="absolute -left-6 -bottom-12 h-48 w-48 rounded-full bg-[#22D3EE]/8 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.45fr),minmax(0,1fr)]">
        <div className="space-y-5">
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            {label}
          </Badge>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[#DCE7F5] sm:text-base">
              {subtitle}
            </p>
          </div>

          {onPrimaryAction ? (
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className="h-11 rounded-full bg-[#2563EB] px-5 text-white hover:bg-[#1E3A8A]"
                onClick={onPrimaryAction}
              >
                <CalendarRange className="h-4 w-4" />
                {primaryActionLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {metrics.map((metric) => (
            <div
              key={`${metric.label}-${metric.value}`}
              className="rounded-[24px] border border-white/14 bg-white/10 p-4 shadow-[0_12px_30px_rgba(11,18,32,0.12)] backdrop-blur"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#BFD4FF]">
                {metric.label}
              </p>
              <p className="mt-2 text-lg font-semibold text-white">{metric.value}</p>
              {metric.helper ? (
                <p className="mt-1 text-sm leading-6 text-[#DCE7F5]">{metric.helper}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VacationHero;

