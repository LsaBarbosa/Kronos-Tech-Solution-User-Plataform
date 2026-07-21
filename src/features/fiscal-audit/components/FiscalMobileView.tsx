import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FISCAL_REPORT_ORDER, FISCAL_REPORTS, previewFileName } from "../utils/fiscal-helpers";
import type { FiscalAuditViewModel } from "../useFiscalAuditViewModel";
import FiscalAuditHero from "./FiscalAuditHero";
import FiscalReportCard from "./FiscalReportCard";
import FiscalMonthPicker from "./FiscalMonthPicker";
import FiscalMobileStickyBar from "./FiscalMobileStickyBar";

interface FiscalMobileViewProps {
  viewModel: FiscalAuditViewModel;
  onBack: () => void;
}

const StepHeader = ({
  index,
  title,
  subtitle,
}: {
  index: number;
  title: string;
  subtitle?: string;
}) => (
  <div className="mb-3 flex items-start gap-3">
    <span
      aria-hidden="true"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A] text-xs font-semibold text-white"
    >
      {index}
    </span>
    <div>
      <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
      {subtitle ? <p className="mt-0.5 text-xs text-[#64748B]">{subtitle}</p> : null}
    </div>
  </div>
);

const FiscalMobileView = ({ viewModel, onBack }: FiscalMobileViewProps) => {
  const {
    reportType,
    setReportType,
    descriptor,
    monthRef,
    setMonthRef,
    isLoading,
    isCtaDisabled,
    download,
  } = viewModel;

  const fileName = previewFileName(descriptor.type, monthRef);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-36">
      <FiscalAuditHero variant="mobile" />

      <div className="grid grid-cols-3 gap-2">
        {FISCAL_REPORT_ORDER.map((type) => {
          const item = FISCAL_REPORTS[type];
          const isActive = reportType === type;
          return (
            <button
              key={type}
              type="button"
              aria-pressed={isActive}
              onClick={() => setReportType(type)}
              className={cn(
                "rounded-2xl border px-3 py-2.5 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2",
                isActive
                  ? "border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]"
                  : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#2563EB]"
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                {item.shortLabel}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-[#64748B]">{item.format}</p>
            </button>
          );
        })}
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-3 px-4 py-4">
          <StepHeader index={1} title="Tipo de arquivo" subtitle="Confirme o documento desejado." />
          <FiscalReportCard
            descriptor={descriptor}
            selected
            onSelect={() => setReportType(reportType)}
            variant="mobile"
          />
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-3 px-4 py-4">
          <StepHeader
            index={2}
            title="Referência"
            subtitle={
              descriptor.requiresMonth
                ? "Selecione o mês de competência."
                : "Esse arquivo não exige mês de referência."
            }
          />
          {descriptor.requiresMonth ? (
            <FiscalMonthPicker
              value={monthRef}
              onChange={setMonthRef}
              disabled={isLoading}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-xs leading-5 text-[#475569]">
              {descriptor.type === "AFD"
                ? "AFD usa o acumulado vigente do backend."
                : "Atestado Técnico é estático: gere a qualquer momento."}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-3 px-4 py-4">
          <StepHeader
            index={3}
            title="Prévia"
            subtitle="Nome previsto do arquivo e período."
          />
          <div className="rounded-2xl border border-border/60 bg-[#F8FAFC] px-3 py-3 text-xs leading-5">
            <p className="flex items-center gap-2 text-[#0F172A]">
              <FileText className="h-3.5 w-3.5 text-[#2563EB]" />
              <span className="truncate font-mono">{fileName}</span>
            </p>
            <p className="mt-1 text-[#475569]">
              {descriptor.requiresMonth && monthRef
                ? `Mês: ${format(monthRef, "MMMM 'de' yyyy", { locale: ptBR })}`
                : descriptor.requiresMonth
                  ? "Mês não selecionado"
                  : "Sem mês de referência"}{" "}
              · Formato {descriptor.format}
            </p>
          </div>
        </CardContent>
      </Card>

      <FiscalMobileStickyBar
        descriptor={descriptor}
        monthRef={monthRef}
        isLoading={isLoading}
        isCtaDisabled={isCtaDisabled}
        onDownload={download}
      />
    </div>
  );
};

export default FiscalMobileView;
