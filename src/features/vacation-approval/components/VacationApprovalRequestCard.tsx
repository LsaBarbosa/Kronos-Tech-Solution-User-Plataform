import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronRight } from "lucide-react";
import type { VacationApprovalViewModel } from "../types";
import {
  getVacationApprovalStatusAccent,
  getVacationApprovalStatusTone,
} from "../utils/vacation-approval-formatters";

interface VacationApprovalRequestCardProps {
  request: VacationApprovalViewModel;
  selected: boolean;
  onSelect: (requestKey: string) => void;
}

export const VacationApprovalRequestCard = ({
  request,
  selected,
  onSelect,
}: VacationApprovalRequestCardProps) => {
  const statusTone = getVacationApprovalStatusTone(request.rawStatus);
  const statusAccent = getVacationApprovalStatusAccent(request.rawStatus);

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-selected={selected}
      onClick={() => onSelect(request.key)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(request.key);
        }
      }}
      className={cn(
        "cursor-pointer border border-border bg-card shadow-sm transition-all",
        selected && "border-primary bg-primary/5 ring-1 ring-primary/30"
      )}
    >
      <div className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
            {request.employeeInitials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{request.employeeName}</p>
                <p className="text-sm text-muted-foreground">Solicitação de férias</p>
              </div>
              <ChevronRight className={cn("mt-0.5 h-5 w-5 shrink-0 text-muted-foreground", selected && "text-primary")} aria-hidden="true" />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-[#2563EB]" aria-hidden="true" />
              <p className="truncate text-sm font-semibold text-foreground">{request.periodLabel}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800">
            {request.calendarDays} dias
          </Badge>
          <Badge variant="outline" className={cn("rounded-full border px-3 py-1 text-xs font-semibold", statusTone)}>
            <span className={cn("mr-2 h-2 w-2 rounded-full", statusAccent)} aria-hidden="true" />
            {request.statusLabel}
          </Badge>
        </div>
      </div>
    </Card>
  );
};
