import { Button } from "@/components/ui/button";

interface LgpdPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export const LgpdPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: LgpdPaginationProps) => {
  if (totalPages <= 1) return null;

  const canGoPrev = currentPage > 0 && !isLoading;
  const canGoNext = currentPage < totalPages - 1 && !isLoading;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3">
      <p className="text-xs text-[#64748B]">
        Página {currentPage + 1} de {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoPrev}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-9 rounded-full border-[#E2E8F0] text-xs font-semibold text-[#0F172A]"
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoNext}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-9 rounded-full border-[#E2E8F0] text-xs font-semibold text-[#0F172A]"
        >
          Próxima
        </Button>
      </div>
    </div>
  );
};

export default LgpdPagination;
