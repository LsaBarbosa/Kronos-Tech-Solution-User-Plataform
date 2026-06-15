import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, X } from "lucide-react";
import type { VacationApprovalViewModel } from "../types";
import {
  getVacationApprovalStatusAccent,
  getVacationApprovalStatusTone,
} from "../utils/vacation-approval-formatters";

interface VacationApprovalInboxTableProps {
  requests: VacationApprovalViewModel[];
  selectedKey: string | null;
  onSelect: (requestKey: string) => void;
  onApprove: (request: VacationApprovalViewModel) => void;
  onReject: (request: VacationApprovalViewModel) => void;
  isBusy?: boolean;
}

export const VacationApprovalInboxTable = ({
  requests,
  selectedKey,
  onSelect,
  onApprove,
  onReject,
  isBusy = false,
}: VacationApprovalInboxTableProps) => {
  return (
    <Card id="inbox" className="overflow-hidden border border-border bg-card shadow-sm">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[46%]">Colaborador</TableHead>
            <TableHead className="w-[22%]">Período</TableHead>
            <TableHead className="w-[8%]">Dias</TableHead>
            <TableHead className="w-[16%]">Status</TableHead>
            <TableHead className="w-[8%] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => {
            const selected = selectedKey === request.key;
            const statusTone = getVacationApprovalStatusTone(request.rawStatus);
            const statusAccent = getVacationApprovalStatusAccent(request.rawStatus);

            return (
              <TableRow
                key={request.key}
                data-state={selected ? "selected" : undefined}
                role="button"
                tabIndex={0}
                className={cn(
                  "cursor-pointer transition-colors",
                  selected && "bg-primary/5 ring-1 ring-inset ring-primary/40"
                )}
                onClick={() => onSelect(request.key)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(request.key);
                  }
                }}
              >
                <TableCell className="min-w-0 align-top">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                      {request.employeeInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="break-words font-semibold leading-snug text-foreground">
                        {request.employeeName}
                      </p>
                      <p className="mt-1 break-words text-xs leading-snug text-muted-foreground">
                        Solicitação de férias
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="min-w-0 align-top">
                  <div className="min-w-0 space-y-1">
                    <p className="break-words font-medium leading-snug text-foreground">
                      {request.periodLabel}
                    </p>
                    <p className="break-words text-xs leading-snug text-muted-foreground">
                      {request.recordsCount} registros no lote
                    </p>
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <Badge variant="outline" className="rounded-full border-border bg-background px-3 py-1 text-sm font-semibold text-foreground">
                    {request.calendarDays}
                  </Badge>
                </TableCell>
                <TableCell className="align-top">
                  <Badge variant="outline" className={cn("rounded-full border px-3 py-1 text-xs font-semibold", statusTone)}>
                    <span className={cn("mr-2 h-2 w-2 rounded-full", statusAccent)} aria-hidden="true" />
                    {request.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right align-top">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="success"
                      disabled={!request.canDecide || isBusy}
                      onClick={(event) => {
                        event.stopPropagation();
                        onApprove(request);
                      }}
                      aria-label={`Aprovar lote de ${request.employeeName}`}
                      className="h-9 w-9 rounded-full"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      disabled={!request.canDecide || isBusy}
                      onClick={(event) => {
                        event.stopPropagation();
                        onReject(request);
                      }}
                      aria-label={`Rejeitar lote de ${request.employeeName}`}
                      className="h-9 w-9 rounded-full"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-colors", selected && "text-primary")} aria-hidden="true" />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};
