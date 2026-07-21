import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimeOffHeroProps {
  badgeLabel: string;
  title: string;
  subtitle: string;
  metrics?: Array<{
    label: string;
    value: string;
    helper?: string;
  }>;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  variant?: "desktop" | "mobile";
  className?: string;
}

const TimeOffHero = ({
  badgeLabel,
  title,
  subtitle,
  metrics = [],
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  variant = "desktop",
  className,
}: TimeOffHeroProps) => {
  const isMobile = variant === "mobile";

  return (
    <section
      className={cn(
        "relative overflow-hidden border border-[#D8E2EC] bg-gradient-to-br from-[#102A43] via-[#1F4E5F] to-[#102A43] text-white shadow-[0_18px_50px_rgba(16,42,67,0.22)]",
        isMobile ? "rounded-[28px] p-5" : "rounded-[32px] p-6 sm:p-8",
        className
      )}
    >
      <div className="absolute -right-16 -top-10 h-44 w-44 rounded-full border border-white/20 opacity-70" />
      <div className="absolute right-24 top-0 h-36 w-36 rounded-full border border-white/12 opacity-60" />
      <div className="absolute -left-6 -bottom-14 h-48 w-48 rounded-full bg-[#22B8CF]/10 blur-3xl" />

      <div className="relative space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            {badgeLabel}
          </Badge>
        </div>

        <div className="space-y-3">
          <h1 className={cn("font-semibold tracking-tight", isMobile ? "text-2xl" : "text-3xl sm:text-4xl")}>
            {title}
          </h1>
          <p className={cn("max-w-3xl text-white/82", isMobile ? "text-sm leading-6" : "text-sm leading-6 sm:text-base")}>
            {subtitle}
          </p>
        </div>

        {(onPrimaryAction || onSecondaryAction) && (
          <div className="flex flex-wrap gap-3">
            {onPrimaryAction ? (
              <Button
                type="button"
                className="h-11 rounded-full bg-[#22B8CF] px-5 text-[#102A43] hover:bg-[#1C8C7C] hover:text-white"
                onClick={onPrimaryAction}
              >
                {primaryActionLabel ?? "Continuar"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
            {onSecondaryAction ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full border-white/20 bg-white/10 px-5 text-white hover:border-white/30 hover:bg-white/15 hover:text-white"
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel ?? "Saiba mais"}
              </Button>
            ) : null}
          </div>
        )}

        {metrics.length > 0 ? (
          <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "sm:grid-cols-3")}>
            {metrics.map((metric) => (
              <div
                key={`${metric.label}-${metric.value}`}
                className="rounded-[24px] border border-white/14 bg-white/10 p-4 backdrop-blur"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">
                  {metric.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{metric.value}</p>
                {metric.helper ? <p className="mt-1 text-sm leading-6 text-white/78">{metric.helper}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default TimeOffHero;
