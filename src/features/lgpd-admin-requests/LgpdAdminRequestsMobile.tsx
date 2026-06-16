import { Loader2 } from "lucide-react";
import { LgpdErrorPanel } from "./components/LgpdErrorPanel";
import { LgpdFiltersBar } from "./components/LgpdFiltersBar";
import { LgpdHero } from "./components/LgpdHero";
import { LgpdMobileBottomBar } from "./components/LgpdMobileBottomBar";
import { LgpdMobileCard } from "./components/LgpdMobileCard";
import { LgpdMobileChips } from "./components/LgpdMobileChips";
import { LgpdPagination } from "./components/LgpdPagination";
import type { UseLgpdAdminRequestsViewModelReturn } from "./hooks/useLgpdAdminRequestsViewModel";

interface LgpdAdminRequestsMobileProps {
  viewModel: UseLgpdAdminRequestsViewModelReturn;
}

export const LgpdAdminRequestsMobile = ({ viewModel }: LgpdAdminRequestsMobileProps) => {
  const {
    requests,
    filteredRequests,
    selectedRequest,
    setSelectedRequestId,
    isLoading,
    error,
    filters,
    setEmployeeNameFilter,
    setTypeFilter,
    setStatusFilter,
    mobileStatusChip,
    setMobileStatusChip,
    kpis,
    refetch,
    openDetails,
    currentPage,
    totalPages,
    setPage,
  } = viewModel;

  return (
    <div className="space-y-5 pb-12">
      <LgpdHero variant="mobile" kpis={kpis} totalLoaded={requests.length} />

      <LgpdFiltersBar
        variant="mobile"
        employeeName={filters.employeeName}
        type={filters.type}
        status={filters.status}
        onEmployeeNameChange={setEmployeeNameFilter}
        onTypeChange={setTypeFilter}
        onStatusChange={setStatusFilter}
      />

      <LgpdMobileChips value={mobileStatusChip} onChange={setMobileStatusChip} />

      {error ? (
        <LgpdErrorPanel
          message={error}
          onRetry={() => void refetch()}
          isLoading={isLoading}
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#E2E8F0] bg-white px-6 py-12 text-center">
          <p className="text-sm font-semibold text-[#0F172A]">
            Nenhuma solicitação encontrada
          </p>
          <p className="text-xs text-[#64748B]">
            Ajuste os filtros para ver outras requisições da fila.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <LgpdMobileCard
              key={request.requestId}
              request={request}
              isSelected={selectedRequest?.requestId === request.requestId}
              onSelect={(item) => setSelectedRequestId(item.requestId)}
              onOpenDetails={openDetails}
            />
          ))}
        </div>
      )}

      <LgpdPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      <LgpdMobileBottomBar request={selectedRequest} onOpenDetails={openDetails} />
    </div>
  );
};

export default LgpdAdminRequestsMobile;
