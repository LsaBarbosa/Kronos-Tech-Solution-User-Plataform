import { Link } from "react-router-dom";
import { ArrowUpRight, BarChart3, ChevronRight, ClipboardEdit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

type DetailedReportMobileProps = {
  viewModel: DetailedReportBuilderViewModel;
};

export const DetailedReportMobile = ({ viewModel }: DetailedReportMobileProps) => {
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
    selectionSummary,
  } = viewModel;

  return (
    <div className="space-y-5 pb-40">
      <section className="overflow-hidden rounded-[28px] border border-[#D8E2EC] bg-gradient-to-br from-[#102A43] via-[#1F4E5F] to-[#102A43] p-5 text-white shadow-[0_18px_50px_rgba(16,42,67,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <Badge className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Solução guiada
            </Badge>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold leading-tight">Relatório detalhado</h1>
              <p className="text-sm leading-6 text-white/85">
                Construa o filtro por etapas, revise a prévia e gere o relatório com segurança.
              </p>
            </div>
          </div>
          <Button asChild size="icon" variant="outline" className="h-11 w-11 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white">
            <Link to={APP_PATHS.dashboard} aria-label="Ir para dashboard">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Link>
          </Button>
        </div>

        <Button asChild size="sm" className="mt-4 h-11 w-full gap-1 rounded-2xl bg-white text-[#102A43] hover:bg-white/90">
          <Link to={APP_PATHS.statusDoRegistro}>
            <ClipboardEdit className="h-4 w-4" />
            Status do registro
            <ArrowUpRight className="ml-auto h-4 w-4" />
          </Link>
        </Button>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">{roleMeta.label}</Badge>
          <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">{selectedDates.length} data(s)</Badge>
          <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">{reportActive ? "Aprovado" : "Reprovado"}</Badge>
        </div>
      </section>

      <Card className="border border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.08)]">
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">Escopo atual</p>
            <p className="mt-1 text-sm font-semibold text-[#102A43]">{roleMeta.title}</p>
            <p className="mt-1 text-xs leading-5 text-[#627D98]">{roleMeta.note}</p>
          </div>
          <BarChart3 className="h-10 w-10 shrink-0 text-[#1F4E5F]" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#1D4ED8]">1</Badge>
          <p className="text-sm font-semibold text-[#102A43]">Datas</p>
        </div>
        <ReportDateChips
          selectedDates={selectedDates}
          onDatesChange={setSelectedDates}
          onRemoveDate={(date) => setSelectedDates((prev) => prev.filter((item) => item.getTime() !== date.getTime()))}
          onClearDates={() => setSelectedDates([])}
          compact
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#1D4ED8]">2</Badge>
          <p className="text-sm font-semibold text-[#102A43]">Reference e status</p>
        </div>
        <ReportReferenceStatusCard
          referenceTime={referenceTime}
          onReferenceTimeChange={setReferenceTime}
          reportActive={reportActive}
          onReportActiveChange={setReportActive}
          selectedStatuses={selectedStatuses}
          onToggleStatus={toggleStatus}
          onClearStatuses={clearStatuses}
          compact
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#1D4ED8]">3</Badge>
          <p className="text-sm font-semibold text-[#102A43]">Colaborador</p>
        </div>
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
      </div>

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
        compact
      />

      <ReportResultsSummary
        searchState={searchState}
        summary={reportSummary}
        errorMessage={searchError}
        onDownloadPDF={handleDownloadPDF}
        onDownloadCSV={handleDownloadCSV}
        hasResults={hasResults}
      />

      <div id={resultsAnchorId} className="scroll-mt-24">
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

      <ReportActionFooter
        mode="mobile"
        hasResults={hasResults}
        canGenerate={viewModel.canGenerate}
        isLoading={isLoadingReport}
        onGenerate={handleGenerate}
        onClear={handleClear}
        onScrollToResults={scrollToResults}
        summaryLabel={selectionSummary}
      />
    </div>
  );
};

export default DetailedReportMobile;
