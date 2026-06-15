import { CalendarCheck, Clock, Inbox, Loader2, PowerOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DetailedReportItem } from "@/utils/report-utils";
import {
  formatRecordDate,
  getInitials,
  getStatusTone,
} from "./status-registro-helpers";

interface StatusResultsListProps {
  variant: "desktop" | "mobile";
  records: DetailedReportItem[];
  selectedKey: number | null;
  isLoading: boolean;
  hasSearched: boolean;
  onSelect: (record: DetailedReportItem) => void;
}

const StatusResultsList = ({
  variant,
  records,
  selectedKey,
  isLoading,
  hasSearched,
  onSelect,
}: StatusResultsListProps) => {
  if (isLoading) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex items-center justify-center gap-3 px-5 py-10 text-[#475569]">
          <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" />
          <span className="text-sm">Buscando registros...</span>
        </CardContent>
      </Card>
    );
  }

  if (!hasSearched) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 px-5 py-10 text-center text-[#64748B]">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#94A3B8]"
          >
            <CalendarCheck className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold text-[#0F172A]">
            Defina os filtros e busque os registros
          </p>
          <p className="max-w-md text-xs leading-5">
            Selecione colaborador, status atual e (opcionalmente) datas para listar os registros do
            ponto.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 px-5 py-10 text-center text-[#64748B]">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#94A3B8]"
          >
            <Inbox className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold text-[#0F172A]">Nenhum registro encontrado</p>
          <p className="max-w-md text-xs leading-5">
            Tente outros status, ampliar o intervalo de datas ou trocar o colaborador.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => {
        const tone = getStatusTone(record.statusRecord);
        const isSelected = selectedKey === record.timeRecordId;
        const hasMarcacao = Boolean(record.startHour || record.endHour);

        return (
          <button
            key={record.timeRecordId ?? record.id}
            type="button"
            onClick={() => onSelect(record)}
            aria-pressed={isSelected}
            className={cn(
              "flex w-full flex-col gap-3 rounded-2xl border bg-white px-4 py-3 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2",
              isSelected
                ? "border-[#2563EB] ring-2 ring-[#2563EB]/30"
                : "border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md",
              variant === "mobile" && "px-4 py-4"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-semibold text-[#1D4ED8]"
              >
                {getInitials(record.employeeData?.employeeName ?? "?")}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className="truncate text-sm font-semibold text-[#0F172A]"
                    title={record.employeeData?.employeeName ?? "—"}
                  >
                    {record.employeeData?.employeeName ?? "—"}
                  </p>
                  <Badge className={tone.badgeClass}>{tone.label}</Badge>
                </div>
                <p className="text-xs text-[#64748B]">
                  {record.employeeData?.companyName ?? ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[11px] text-[#475569]">
              <div>
                <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Data</p>
                <p className="mt-0.5 text-[#0F172A]">{formatRecordDate(record.startWork)}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Entrada</p>
                <p className="mt-0.5 text-[#0F172A]">{record.startHour || "—"}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">Saída</p>
                <p className="mt-0.5 text-[#0F172A]">{record.endHour || "—"}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {!hasMarcacao ? (
                <Badge variant="outline" className="border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]">
                  <Clock className="mr-1 h-3 w-3" />
                  Sem marcação
                </Badge>
              ) : null}
              {record.active === false ? (
                <Badge variant="outline" className="border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]">
                  <PowerOff className="mr-1 h-3 w-3" />
                  Inativo
                </Badge>
              ) : (
                <Badge variant="outline" className="border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]">
                  Ativo
                </Badge>
              )}
              {record.edited ? (
                <Badge variant="outline" className="border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">
                  Editado
                </Badge>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default StatusResultsList;
