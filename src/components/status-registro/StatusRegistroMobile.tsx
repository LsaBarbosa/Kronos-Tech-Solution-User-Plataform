import { useEffect, useState } from "react";
import { Loader2, Save, ZapOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import StatusRegistroHero from "./StatusRegistroHero";
import StatusSearchPanel from "./StatusSearchPanel";
import StatusResultsList from "./StatusResultsList";
import StatusDecisionPanel from "./StatusDecisionPanel";
import { formatRecordDate, getStatusTone } from "./status-registro-helpers";
import type { StatusRegistroViewModel } from "./useStatusRegistroViewModel";

interface StatusRegistroMobileProps {
  viewModel: StatusRegistroViewModel;
  onBack: () => void;
}

const StatusRegistroMobile = ({ viewModel, onBack }: StatusRegistroMobileProps) => {
  const [decisionOpen, setDecisionOpen] = useState(false);

  useEffect(() => {
    if (!viewModel.selectedRecord) {
      setDecisionOpen(false);
    }
  }, [viewModel.selectedRecord]);

  const selected = viewModel.selectedRecord;
  const currentTone = selected ? getStatusTone(selected.statusRecord) : null;
  const busy = viewModel.isSavingStatus || viewModel.isTogglingActivate;
  const canSave =
    !busy &&
    Boolean(viewModel.newStatus) &&
    Boolean(selected?.timeRecordId) &&
    Boolean(selected?.employeeId);
  const canToggle =
    !busy && Boolean(selected?.timeRecordId) && Boolean(selected?.employeeId);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-36">
      <StatusRegistroHero variant="mobile" />

      <Card className="border-border/70 shadow-sm">
        <div className="border-b border-border/60 bg-[#F8FAFC] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            1. Filtros
          </p>
        </div>
        <CardContent className="px-4 py-4">
          <StatusSearchPanel
            variant="mobile"
            employees={viewModel.employees}
            selectedEmployee={viewModel.selectedEmployee}
            onSelectEmployee={viewModel.setSelectedEmployee}
            employeeActive={viewModel.employeeActive}
            onEmployeeActiveChange={viewModel.setEmployeeActive}
            selectedDates={viewModel.selectedDates}
            onSelectedDatesChange={viewModel.setSelectedDates}
            searchStatuses={viewModel.searchStatuses}
            onToggleStatus={viewModel.toggleSearchStatus}
            isActiveFilter={viewModel.isActiveFilter}
            onIsActiveFilterChange={viewModel.setIsActiveFilter}
            isPartner={viewModel.isPartner}
            isLoadingEmployees={viewModel.isLoadingEmployees}
            isSearching={viewModel.isSearching}
            onSearch={viewModel.search}
            onClear={viewModel.clearFilters}
          />
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <div className="border-b border-border/60 bg-[#F8FAFC] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            2. Registros encontrados
          </p>
        </div>
        <CardContent className="px-4 py-4">
          <StatusResultsList
            variant="mobile"
            records={viewModel.records}
            selectedKey={selected?.timeRecordId ?? null}
            isLoading={viewModel.isSearching}
            hasSearched={viewModel.hasSearched}
            onSelect={(record) => {
              viewModel.selectRecord(record);
              setDecisionOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <Drawer open={decisionOpen} onOpenChange={setDecisionOpen}>
        <DrawerContent className="h-[92vh] overflow-hidden rounded-t-[24px] border-border/70 bg-background px-0">
          <div className="max-h-[calc(92vh-1rem)] overflow-y-auto px-4 pb-24 pt-2">
            <div className="mb-2 border-b border-border/60 pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                3. Decisão
              </p>
            </div>
            <StatusDecisionPanel
              variant="mobile"
              record={selected}
              newStatus={viewModel.newStatus}
              onNewStatusChange={viewModel.setNewStatus}
              isSavingStatus={viewModel.isSavingStatus}
              isTogglingActivate={viewModel.isTogglingActivate}
              onRequestSave={() => {
                setDecisionOpen(false);
                viewModel.requestSaveStatus();
              }}
              onRequestToggle={() => {
                setDecisionOpen(false);
                viewModel.requestToggleActivate();
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1 text-[11px] leading-4 text-[#475569]">
            <p className="truncate text-sm font-semibold text-[#0F172A]">
              {selected ? selected.employeeData?.employeeName ?? "—" : "Nenhum registro selecionado"}
            </p>
            <p className={cn("truncate text-xs", !selected && "text-[#94A3B8]")}>
              {selected
                ? `${formatRecordDate(selected.startWork)} · ${currentTone?.label ?? "—"}${
                    viewModel.newStatus ? ` → ${getStatusTone(viewModel.newStatus).label}` : ""
                  }`
                : "Selecione um registro para liberar as ações."}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Inativar ou ativar registro"
              disabled={!canToggle}
              onClick={viewModel.requestToggleActivate}
              className="h-11 gap-1 border-[#FECACA] bg-white text-[#B91C1C] hover:bg-[#FEE2E2]"
            >
              {viewModel.isTogglingActivate ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ZapOff className="h-4 w-4" />
              )}
              Inativar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!canSave}
              onClick={viewModel.requestSaveStatus}
              className="h-11 gap-1 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
            >
              {viewModel.isSavingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar status
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusRegistroMobile;
