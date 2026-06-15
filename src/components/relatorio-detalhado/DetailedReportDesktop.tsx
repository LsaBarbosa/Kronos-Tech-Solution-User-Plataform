import { Link } from "react-router-dom";
import { ArrowUpRight, BarChart3, ClipboardEdit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DetailedReportBuilderViewModel } from "@/hooks/useDetailedReportBuilder";
import { APP_PATHS } from "@/config/app-routes";
import { ReportDateChips } from "@/components/relatorio-detalhado/ReportDateChips";
import { ReportReferenceStatusCard } from "@/components/relatorio-detalhado/ReportReferenceStatusCard";
import { ReportEmployeeSelector } from "@/components/relatorio-detalhado/ReportEmployeeSelector";
import { ReportGovernancePanel } from "@/components/relatorio-detalhado/ReportGovernancePanel";
import { ReportExpectedSummary } from "@/components/relatorio-detalhado/ReportExpectedSummary";
import { ReportResultsSummary } from "@/components/relatorio-detalhado/ReportResultsSummary";
import { ReportActionFooter } from "@/components/relatorio-detalhado/ReportActionFooter";
import { ResultadosRelatorioDetalhado } from "@/components/ResultadosRelatorioDetalhado";

type DetailedReportDesktopProps = {
  viewModel: DetailedReportBuilderViewModel;
};

export const DetailedReportDesktop = ({ viewModel }: DetailedReportDesktopProps) => {
  const {
    role,
    roleMeta,
    selectedDates,
    setSelectedDates,
    referenceTime,
    setReferenceTime,
    reportActive,
    setReportActive,
    selectedStatuses,
    toggleStatus,
    clearStatuses,
    employeeScope,
    setEmployeeScope,
    employees,
    selectedEmployee,
    setSelectedEmployee,
    selectedEmployeeLabel,
    isPartner,
    isLoadingEmployees,
    searchState,
    searchError,
    reportData,
    reportSummary,
    isLoadingReport,
    hasResults,
    resultsAnchorId,
    scrollToResults,
    handleGenerate,
    handleClear,
    handleDownloadPDF,
    handleDownloadCSV,
    handleEditRecord,
  } = viewModel;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-[#D8E2EC] bg-gradient-to-br from-[#102A43] via-[#1F4E5F] to-[#102A43] p-6 text-white shadow-[0_18px_50px_rgba(16,42,67,0.22)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Solicitação inteligente de relatório de ponto
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Relatório detalhado</h1>
              <p className="max-w-2xl text-base leading-7 text-white/85">
                Construa o recorte por datas, referência, status e colaborador com governança por papel.
                O fluxo preserva a edição de registros e habilita exportação apenas após resultados.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
                {roleMeta.label}
              </Badge>
              <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
                {roleMeta.title}
              </Badge>
              <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
                {selectedDates.length} data(s)
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 xl:w-[260px]">
            <Button asChild className="h-11 w-full gap-1 rounded-2xl bg-white text-[#102A43] hover:bg-white/90">
              <Link to={APP_PATHS.statusDoRegistro}>
                <ClipboardEdit className="h-4 w-4" />
                Status do registro
                <ArrowUpRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 w-full rounded-2xl border-white/20 bg-white/10 px-4 text-white hover:bg-white/15 hover:text-white">
              <Link to={APP_PATHS.dashboard}>
                Dashboard
              </Link>
            </Button>
            <div className="hidden rounded-2xl border border-white/20 bg-white/10 p-4 xl:block">
              <BarChart3 className="h-10 w-10 text-white/80" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.95fr)]">
        <div className="space-y-6 min-w-0">
          <ReportDateChips
            selectedDates={selectedDates}
            onDatesChange={setSelectedDates}
            onRemoveDate={(date) => setSelectedDates((prev) => prev.filter((item) => item.getTime() !== date.getTime()))}
            onClearDates={() => setSelectedDates([])}
          />

          <ReportReferenceStatusCard
            referenceTime={referenceTime}
            onReferenceTimeChange={setReferenceTime}
            reportActive={reportActive}
            onReportActiveChange={setReportActive}
            selectedStatuses={selectedStatuses}
            onToggleStatus={toggleStatus}
            onClearStatuses={clearStatuses}
          />

          <ReportEmployeeSelector
            role={role as "CTO" | "MANAGER" | "PARTNER"}
            employeeScope={employeeScope}
            onEmployeeScopeChange={setEmployeeScope}
            employees={employees}
            selectedEmployee={selectedEmployee}
            onSelectedEmployeeChange={setSelectedEmployee}
            selectedEmployeeLabel={selectedEmployeeLabel}
            isLoadingEmployees={isLoadingEmployees}
            isPartner={isPartner}
          />

          <ReportActionFooter
            mode="desktop"
            hasResults={hasResults}
            canGenerate={viewModel.canGenerate}
            isLoading={isLoadingReport}
            onGenerate={handleGenerate}
            onClear={handleClear}
            onScrollToResults={scrollToResults}
            summaryLabel={viewModel.selectionSummary}
          />

          <ReportResultsSummary
            searchState={searchState}
            summary={reportSummary}
            errorMessage={searchError}
            onDownloadPDF={handleDownloadPDF}
            onDownloadCSV={handleDownloadCSV}
            hasResults={hasResults}
          />
        </div>

        <div className="space-y-6 min-w-0">
          <ReportGovernancePanel
            roleMeta={roleMeta}
            selectedEmployeeLabel={selectedEmployeeLabel}
            selectedDatesLabel={viewModel.selectedDatesLabel}
            selectedStatusesCount={selectedStatuses.length}
            referenceTime={referenceTime}
            reportActive={reportActive}
          />

          <ReportExpectedSummary
            selectedDates={selectedDates}
            referenceTime={referenceTime}
            selectedEmployeeLabel={selectedEmployeeLabel}
            selectedStatusesCount={selectedStatuses.length}
            reportActive={reportActive}
          />
        </div>
      </div>

      <div id={resultsAnchorId} className="scroll-mt-28 space-y-4">
        {hasResults && (
          <ResultadosRelatorioDetalhado
            reportData={reportData}
            statusFilter={selectedStatuses}
            referenceTime={referenceTime}
            selectedDates={selectedDates}
            onEditRecord={handleEditRecord}
            onDownloadPDF={handleDownloadPDF}
            onDownloadCSV={handleDownloadCSV}
            showExportActions={false}
            showSummaryCards={false}
          />
        )}
      </div>
    </div>
  );
};

export default DetailedReportDesktop;
