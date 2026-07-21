import { Card, CardContent } from "@/components/ui/card";
import StatusRegistroHero from "./StatusRegistroHero";
import StatusContextCards from "./StatusContextCards";
import StatusSearchPanel from "./StatusSearchPanel";
import StatusResultsList from "./StatusResultsList";
import StatusDecisionPanel from "./StatusDecisionPanel";
import type { StatusRegistroViewModel } from "./useStatusRegistroViewModel";

interface StatusRegistroDesktopProps {
  viewModel: StatusRegistroViewModel;
  onBack: () => void;
}

const StatusRegistroDesktop = ({ viewModel, onBack }: StatusRegistroDesktopProps) => {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 lg:space-y-8">
      <StatusRegistroHero variant="desktop" />

      <StatusContextCards />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card className="border-border/70 shadow-sm">
          <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Localizar registro
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">
              Filtros de busca
            </h2>
          </div>
          <CardContent className="px-5 py-5">
            <StatusSearchPanel
              variant="desktop"
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
          <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Resultados encontrados
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">
              Selecione um registro
            </h2>
          </div>
          <CardContent className="px-5 py-5">
            <StatusResultsList
              variant="desktop"
              records={viewModel.records}
              selectedKey={viewModel.selectedRecord?.timeRecordId ?? null}
              isLoading={viewModel.isSearching}
              hasSearched={viewModel.hasSearched}
              onSelect={viewModel.selectRecord}
            />
          </CardContent>
        </Card>

        <StatusDecisionPanel
          variant="desktop"
          record={viewModel.selectedRecord}
          newStatus={viewModel.newStatus}
          onNewStatusChange={viewModel.setNewStatus}
          isSavingStatus={viewModel.isSavingStatus}
          isTogglingActivate={viewModel.isTogglingActivate}
          onRequestSave={viewModel.requestSaveStatus}
          onRequestToggle={viewModel.requestToggleActivate}
        />
      </div>
    </div>
  );
};

export default StatusRegistroDesktop;
