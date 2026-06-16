import { Card } from "@/components/ui/card";
import { LgpdHero } from "./components/LgpdHero";
import { LgpdFiltersBar } from "./components/LgpdFiltersBar";
import { LgpdInboxTable } from "./components/LgpdInboxTable";
import { LgpdSidePanel } from "./components/LgpdSidePanel";
import { LgpdErrorPanel } from "./components/LgpdErrorPanel";
import { LgpdPagination } from "./components/LgpdPagination";
import type { UseLgpdAdminRequestsViewModelReturn } from "./hooks/useLgpdAdminRequestsViewModel";

interface LgpdAdminRequestsDesktopProps {
  viewModel: UseLgpdAdminRequestsViewModelReturn;
}

export const LgpdAdminRequestsDesktop = ({ viewModel }: LgpdAdminRequestsDesktopProps) => {
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
    kpis,
    refetch,
    openDetails,
    currentPage,
    totalPages,
    setPage,
  } = viewModel;

  return (
    <div className="space-y-6">
      <LgpdHero variant="desktop" kpis={kpis} totalLoaded={requests.length} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,0.9fr)]">
        <Card className="border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(11,18,32,0.08)]">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-[#0F172A]">Inbox administrativo</h2>
              <p className="text-sm text-[#64748B]">
                Filtre por titular, tipo, status e empresa.
              </p>
            </div>

            <LgpdFiltersBar
              employeeName={filters.employeeName}
              type={filters.type}
              status={filters.status}
              onEmployeeNameChange={setEmployeeNameFilter}
              onTypeChange={setTypeFilter}
              onStatusChange={setStatusFilter}
            />

            {error ? (
              <LgpdErrorPanel message={error} onRetry={() => void refetch()} isLoading={isLoading} />
            ) : (
              <LgpdInboxTable
                requests={filteredRequests}
                selectedRequestId={selectedRequest?.requestId ?? null}
                onSelect={(request) => setSelectedRequestId(request.requestId)}
                onOpenDetails={openDetails}
                isLoading={isLoading}
              />
            )}

            <LgpdPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          </div>
        </Card>

        <div className="space-y-6 min-w-0">
          <LgpdSidePanel
            request={selectedRequest}
            onOpenDetails={openDetails}
            variant="desktop"
          />
        </div>
      </div>
    </div>
  );
};

export default LgpdAdminRequestsDesktop;
