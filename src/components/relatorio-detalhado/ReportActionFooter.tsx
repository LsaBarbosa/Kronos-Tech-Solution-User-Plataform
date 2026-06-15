import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight, RefreshCw, Search, Trash2 } from "lucide-react";

type ReportActionFooterProps = {
  mode: "desktop" | "mobile";
  hasResults: boolean;
  canGenerate: boolean;
  isLoading: boolean;
  onGenerate: () => void;
  onClear: () => void;
  onScrollToResults: () => void;
  summaryLabel: string;
};

export const ReportActionFooter = ({
  mode,
  hasResults,
  canGenerate,
  isLoading,
  onGenerate,
  onClear,
  onScrollToResults,
  summaryLabel,
}: ReportActionFooterProps) => {
  if (mode === "mobile") {
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#D8E2EC] bg-white/95 px-4 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">Resumo rápido</p>
              <p className="mt-1 break-words text-sm font-semibold text-[#102A43]">{summaryLabel}</p>
            </div>
            {hasResults && (
              <Button
                type="button"
                variant="ghost"
                onClick={onScrollToResults}
                className="h-10 rounded-full px-3 text-sm text-[#1F4E5F] hover:bg-[#EFF6FF]"
              >
                Ver resultados
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate || isLoading}
              className="h-11 rounded-2xl bg-[#102A43] text-white hover:bg-[#1F4E5F]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Gerando
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Gerar
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClear}
              className="h-11 rounded-2xl border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F5F8FB]"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.08)]">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#102A43]">Ações do relatório</p>
            <p className="text-sm text-[#627D98]">Gere, limpe e exporte sem sair do construtor.</p>
          </div>
          {hasResults && (
            <Button
              type="button"
              variant="ghost"
              onClick={onScrollToResults}
              className="h-10 rounded-full px-3 text-sm text-[#1F4E5F] hover:bg-[#EFF6FF]"
            >
              Ver resultados
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <Button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate || isLoading}
            className="h-11 rounded-2xl bg-[#102A43] text-white hover:bg-[#1F4E5F]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Gerando
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Gerar relatório
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            className="h-11 rounded-2xl border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F5F8FB]"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Limpar filtros
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onScrollToResults}
            disabled={!hasResults}
            className={cn(
              "h-11 rounded-2xl text-[#1F4E5F] hover:bg-[#EFF6FF] disabled:opacity-50",
              !hasResults && "cursor-not-allowed"
            )}
          >
            Ver resultados
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportActionFooter;
