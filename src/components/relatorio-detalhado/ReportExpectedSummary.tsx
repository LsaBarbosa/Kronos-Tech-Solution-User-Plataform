import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarRange, Hash, UserRoundCheck, Filter, Clock3 } from "lucide-react";
import { buildSelectionSummary, formatPeriodLabel } from "@/components/relatorio-detalhado/report-ui.helpers";

type ReportExpectedSummaryProps = {
  selectedDates: Date[];
  referenceTime: string;
  selectedEmployeeLabel: string;
  selectedStatusesCount: number;
  reportActive: boolean;
  compact?: boolean;
};

export const ReportExpectedSummary = ({
  selectedDates,
  referenceTime,
  selectedEmployeeLabel,
  selectedStatusesCount,
  reportActive,
  compact = false,
}: ReportExpectedSummaryProps) => {
  const selectionSummary = buildSelectionSummary({
    dates: selectedDates,
    reference: referenceTime,
    employeeLabel: selectedEmployeeLabel || "Colaborador não definido",
    statusCount: selectedStatusesCount,
  });

  const items = [
    { label: "Período", value: formatPeriodLabel(selectedDates), icon: CalendarRange },
    { label: "Referência", value: referenceTime || "HH:mm", icon: Clock3 },
    { label: "Colaborador", value: selectedEmployeeLabel || "Não definido", icon: UserRoundCheck },
    { label: "Filtros", value: `${selectedStatusesCount} selecionado(s)`, icon: Filter },
    { label: "Situação", value: reportActive ? "Aprovado" : "Reprovado", icon: Hash },
  ];

  return (
    <Card className="border border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.08)]">
      <CardHeader className="space-y-2 border-b border-[#D8E2EC] pb-4">
        <CardTitle className="flex items-center gap-2 text-base text-[#102A43]">
          <Hash className="h-4 w-4 text-[#1F4E5F]" />
          Composição esperada
        </CardTitle>
        <p className="text-sm leading-6 text-[#627D98]">
          {selectionSummary}
        </p>
      </CardHeader>

      <CardContent className={cn("space-y-4 p-4", compact && "space-y-3")}>
        <div className={cn("grid gap-3", compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
          {items.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#102A43]">{value}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#102A43]/10 text-[#1F4E5F]">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] p-4">
          <p className="text-sm font-semibold text-[#102A43]">Mensagem operacional</p>
          <p className="mt-2 text-sm leading-6 text-[#627D98]">
            Cada dia selecionado será enviado no corpo do relatório. A exportação PDF/CSV fica disponível após o retorno com dados.
          </p>
          <Badge className="mt-3 rounded-full border border-[#99F6E4] bg-[#ECFEFF] px-2.5 py-1 text-[11px] font-semibold text-[#166E64]">
            {reportActive ? "Aprovado no payload" : "Reprovado no payload"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportExpectedSummary;
