import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Fingerprint, FileJson, ListChecks, ScrollText, type LucideIcon } from "lucide-react";

interface PrivacyMetricStripProps {
  variant: "desktop" | "mobile";
  totalRights: number;
  totalRequests: number;
  isLoadingRequests: boolean;
}

interface MetricCard {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: string;
}

const PrivacyMetricStrip = ({
  variant,
  totalRights,
  totalRequests,
  isLoadingRequests,
}: PrivacyMetricStripProps) => {
  const metrics: MetricCard[] = [
    {
      icon: ScrollText,
      label: "Direitos",
      value: `${totalRights}`,
      tone: "from-[#7C3AED] to-[#A855F7]",
    },
    {
      icon: ListChecks,
      label: variant === "mobile" ? "Pedidos" : "Solicitações",
      value: isLoadingRequests ? "…" : `${totalRequests}`,
      tone: "from-[#F59E0B] to-[#FB923C]",
    },
    {
      icon: Fingerprint,
      label: variant === "mobile" ? "Biometria" : "Consentimento",
      value: variant === "mobile" ? "LGPD" : "Biometria",
      tone: "from-[#0D9488] to-[#22D3EE]",
    },
    {
      icon: FileJson,
      label: "Exportação",
      value: "JSON",
      tone: "from-[#1E3A8A] to-[#2563EB]",
    },
  ];

  const visibleMetrics = variant === "mobile" ? metrics.slice(0, 3) : metrics;

  return (
    <div
      className={cn(
        "grid gap-3",
        variant === "mobile" ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
      )}
    >
      {visibleMetrics.map(({ icon: Icon, label, value, tone }) => (
        <Card key={label} className="border-border/70 shadow-sm">
          <CardContent
            className={cn(
              "flex items-center gap-3 px-3 py-3 sm:px-4",
              variant === "mobile" && "flex-col items-start gap-2 px-3"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                tone
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                {label}
              </p>
              <p className="truncate text-sm font-semibold text-[#0F172A]">{value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PrivacyMetricStrip;
