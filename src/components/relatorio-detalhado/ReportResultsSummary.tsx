import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Download, FileText, Loader2, AlertTriangle, Inbox } from "lucide-react";
import type { ReportSearchState, ReportSummary } from "@/components/relatorio-detalhado/report-ui.helpers";

type ReportResultsSummaryProps = {
  searchState: ReportSearchState;
  summary?: ReportSummary;
  errorMessage?: string | null;
  onDownloadPDF: () => void;
  onDownloadCSV: () => void;
  hasResults: boolean;
};

export const ReportResultsSummary = ({
  searchState,
  summary,
  errorMessage,
  onDownloadPDF,
  onDownloadCSV,
  hasResults,
}: ReportResultsSummaryProps) => {
  if (searchState === "loading") {
    return (
      <Card className="border border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.08)]">
        <CardContent className="flex items-center gap-3 px-4 py-6">
          <Loader2 className="h-5 w-5 animate-spin text-[#1F4E5F]" />
          <div>
            <p className="text-sm font-semibold text-[#102A43]">Gerando relatório</p>
            <p className="text-sm text-[#627D98]">Ajustando filtros e carregando registros.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (searchState === "error") {
    return (
      <Card className="border border-[#FECACA] bg-[#FFF1F1] shadow-[0_10px_30px_rgba(16,42,67,0.08)]">
        <CardContent className="flex items-start gap-3 px-4 py-6">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-[#D64545]" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#102A43]">Não foi possível gerar o relatório</p>
            <p className="mt-1 text-sm leading-6 text-[#627D98]">
              {errorMessage || "Revise os filtros e tente novamente."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (searchState === "idle") {
    return (
      <Card className="border border-dashed border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.05)]">
        <CardContent className="flex items-start gap-3 px-4 py-6">
          <FileText className="mt-0.5 h-5 w-5 text-[#627D98]" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#102A43]">Relatório pronto para gerar</p>
            <p className="mt-1 text-sm leading-6 text-[#627D98]">
              Ajuste datas, status, reference e colaborador para liberar a busca.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (searchState === "empty" || !hasResults) {
    return (
      <Card className="border border-dashed border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.05)]">
        <CardContent className="flex items-start gap-3 px-4 py-6">
          <Inbox className="mt-0.5 h-5 w-5 text-[#627D98]" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#102A43]">Nenhum resultado ainda</p>
            <p className="mt-1 text-sm leading-6 text-[#627D98]">
              Ajuste os filtros acima e gere o relatório para visualizar os registros.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <Card className="border border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.08)]">
      <CardHeader className="flex flex-col gap-2 border-b border-[#D8E2EC] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base text-[#102A43]">Resumo do resultado</CardTitle>
        <Badge className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#1D4ED8]">
          {summary.totalRecords} registro(s)
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Horas trabalhadas</p>
            <p className="mt-1 text-2xl font-bold text-[#102A43]">{summary.totalWorkedHours}</p>
          </div>
          <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Saldo do período</p>
            <p className={cn("mt-1 text-2xl font-bold", summary.totalBalance.startsWith("-") ? "text-[#D64545]" : "text-[#1C8C7C]")}>
              {summary.totalBalance}
            </p>
          </div>
          <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Status mais recorrente</p>
            <p className="mt-1 text-base font-semibold text-[#102A43]">{summary.mostRecurringStatus}</p>
          </div>
          <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Período</p>
            <p className="mt-1 text-sm font-semibold text-[#102A43]">{summary.periodLabel}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={onDownloadPDF}
            className="h-11 rounded-2xl bg-[#102A43] px-4 text-sm font-semibold text-white hover:bg-[#1F4E5F]"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onDownloadCSV}
            className="h-11 rounded-2xl border-[#D8E2EC] bg-white px-4 text-sm font-semibold text-[#102A43] hover:border-[#1F4E5F] hover:bg-[#F5F8FB]"
          >
            <FileText className="mr-2 h-4 w-4" />
            Baixar CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportResultsSummary;
