import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, FileText, Info, Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { previewFileName, type FiscalReportDescriptor } from "../utils/fiscal-helpers";

interface FiscalCompliancePanelProps {
  descriptor: FiscalReportDescriptor;
  monthRef: Date | undefined;
  isLoading: boolean;
  isCtaDisabled: boolean;
  onDownload: () => void;
}

const FiscalCompliancePanel = ({
  descriptor,
  monthRef,
  isLoading,
  isCtaDisabled,
  onDownload,
}: FiscalCompliancePanelProps) => {
  const Icon = descriptor.icon;
  const fileName = previewFileName(descriptor.type, monthRef);
  const periodLabel = descriptor.requiresMonth
    ? monthRef
      ? format(monthRef, "MMMM 'de' yyyy", { locale: ptBR })
      : "Selecione o mês"
    : "Não se aplica";

  return (
    <Card className="border-border/70 shadow-sm">
      <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Conformidade
        </p>
        <h3 className="mt-1 text-lg font-semibold text-[#0F172A]">Painel do arquivo</h3>
      </div>

      <CardContent className="space-y-4 px-5 py-5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white",
              descriptor.toneClass
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#0F172A]">{descriptor.title}</p>
            <p className="text-xs text-[#64748B]">{descriptor.subtitle}</p>
          </div>
        </div>

        <dl className="space-y-2 text-xs">
          <div className="rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2.5">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
              Arquivo previsto
            </dt>
            <dd className="mt-1 flex items-center gap-2 text-[#0F172A]">
              <FileText className="h-3.5 w-3.5 text-[#2563EB]" />
              <span className="truncate font-mono text-[12px]">{fileName}</span>
            </dd>
          </div>

          <div className="rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2.5">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
              Finalidade
            </dt>
            <dd className="mt-1 text-[#0F172A]">{descriptor.description}</dd>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
                Período
              </dt>
              <dd className="mt-1 text-[#0F172A]">{periodLabel}</dd>
            </div>
            <div className="rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
                Formato
              </dt>
              <dd className="mt-1 inline-flex">
                <Badge variant="outline" className={cn("border font-mono", descriptor.badgeClass)}>
                  {descriptor.format}
                </Badge>
              </dd>
            </div>
          </div>
        </dl>

        <div className="flex items-start gap-2 rounded-xl border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-2.5 text-[11px] leading-5 text-[#475569]">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
          <span>{descriptor.rule}</span>
        </div>

        {descriptor.type === "ATESTADO" ? (
          <div className="flex items-start gap-2 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-2.5 text-[11px] leading-5 text-[#5B21B6]">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Arquivo estático: não depende de mês de referência e é regenerado pelo backend conforme
              o template oficial.
            </span>
          </div>
        ) : null}

        {descriptor.requiresMonth && !monthRef ? (
          <div className="flex items-start gap-2 rounded-xl border border-[#FECACA] bg-[#FEE2E2] px-3 py-2.5 text-[11px] leading-5 text-[#B91C1C]">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Selecione o mês para liberar a geração do AEJ.</span>
          </div>
        ) : null}

        <Button
          type="button"
          size="lg"
          onClick={onDownload}
          disabled={isCtaDisabled}
          className="h-12 w-full gap-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isLoading ? descriptor.buttonLoadingLabel : descriptor.buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FiscalCompliancePanel;
