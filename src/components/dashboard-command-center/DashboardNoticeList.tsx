import { ArrowRight, MessageSquareWarning, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WarningMessage } from "@/types/dashboard";

interface DashboardNoticeListProps {
  warnings: WarningMessage[];
  isManager: boolean;
  onOpenWarnings: () => void;
  onCreateWarning: () => void;
}

const formatWarningDate = (value?: string) => {
  if (!value) return "Data indisponível";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "Data indisponível";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

const getPriorityTone = (priority?: string) => {
  const normalized = priority?.toUpperCase();
  if (normalized === "CRITICAL" || normalized === "HIGH") {
    return {
      label: "Crítico",
      className: "border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]",
    };
  }
  if (normalized === "ALERT" || normalized === "WARNING") {
    return {
      label: "Atenção",
      className: "border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]",
    };
  }
  return {
    label: "Informativo",
    className: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
  };
};

const DashboardNoticeList = ({
  warnings,
  isManager,
  onOpenWarnings,
  onCreateWarning,
}: DashboardNoticeListProps) => {
  return (
    <Card className="border-border/70 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/60 bg-[#F8FAFC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Avisos e mensagens
          </p>
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Comunicação interna
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {isManager ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCreateWarning}
              className="h-10 gap-1 border-[#BFDBFE] bg-white text-[#1D4ED8] hover:bg-[#EFF6FF]"
            >
              <PlusCircle className="h-4 w-4" />
              Criar aviso
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            onClick={onOpenWarnings}
            className="h-10 gap-1 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="px-5 py-5">
        {warnings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-5 py-8 text-center">
            <span
              aria-hidden="true"
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1D4ED8]"
            >
              <MessageSquareWarning className="h-6 w-6" />
            </span>
            <p className="mt-3 text-sm font-semibold text-[#0F172A]">Nenhum aviso novo</p>
            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#64748B]">
              Quando sua empresa publicar novos avisos, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {warnings.slice(0, 4).map((warning) => {
              const priorityTone = getPriorityTone(warning.priority);
              return (
                <button
                  key={warning.messageId}
                  type="button"
                  onClick={onOpenWarnings}
                  className="flex w-full items-start justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-left shadow-sm transition hover:border-[#2563EB] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-semibold text-[#0F172A]">
                      {warning.title || "Aviso"}
                    </p>
                    <p className="mt-0.5 text-xs text-[#64748B]">
                      {formatWarningDate(warning.createdAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                      priorityTone.className
                    )}
                  >
                    {priorityTone.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardNoticeList;
