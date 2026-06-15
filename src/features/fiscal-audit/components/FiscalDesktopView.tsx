import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FISCAL_REPORT_ORDER, FISCAL_REPORTS } from "../utils/fiscal-helpers";
import type { FiscalAuditViewModel } from "../useFiscalAuditViewModel";
import FiscalAuditHero from "./FiscalAuditHero";
import FiscalReportCard from "./FiscalReportCard";
import FiscalMonthPicker from "./FiscalMonthPicker";
import FiscalCompliancePanel from "./FiscalCompliancePanel";

interface FiscalDesktopViewProps {
  viewModel: FiscalAuditViewModel;
  onBack: () => void;
}

const FiscalDesktopView = ({ viewModel, onBack }: FiscalDesktopViewProps) => {
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

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 lg:space-y-8">
      <div className="flex">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="h-10 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao início
        </Button>
      </div>

      <FiscalAuditHero variant="desktop" />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Card className="border-border/70 shadow-sm">
          <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Tipo de arquivo
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">
              Escolha o documento legal a gerar
            </h2>
          </div>

          <CardContent className="space-y-6 px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {FISCAL_REPORT_ORDER.map((type) => (
                <FiscalReportCard
                  key={type}
                  descriptor={FISCAL_REPORTS[type]}
                  selected={reportType === type}
                  onSelect={() => setReportType(type)}
                />
              ))}
            </div>

            {descriptor.requiresMonth ? (
              <FiscalMonthPicker
                value={monthRef}
                onChange={setMonthRef}
                disabled={isLoading}
                label="Mês de referência (obrigatório para AEJ)"
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs leading-5 text-[#475569]">
                {descriptor.type === "AFD"
                  ? "AFD não exige filtro mensal nesta tela. O backend devolve o acumulado vigente em .txt."
                  : "Atestado Técnico é um documento estático e não depende de mês de referência."}
              </div>
            )}
          </CardContent>
        </Card>

        <FiscalCompliancePanel
          descriptor={descriptor}
          monthRef={monthRef}
          isLoading={isLoading}
          isCtaDisabled={isCtaDisabled}
          onDownload={download}
        />
      </div>
    </div>
  );
};

export default FiscalDesktopView;
