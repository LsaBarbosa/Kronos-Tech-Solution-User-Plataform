import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ShieldCheck, Workflow, LockKeyhole, Users, AlertTriangle } from "lucide-react";
import { getRoleMeta, type ReportRoleMeta } from "@/components/relatorio-detalhado/report-ui.helpers";

type ReportGovernancePanelProps = {
  roleMeta: ReportRoleMeta;
  selectedEmployeeLabel: string;
  selectedDatesLabel: string;
  selectedStatusesCount: number;
  referenceTime: string;
  reportActive: boolean;
};

export const ReportGovernancePanel = ({
  roleMeta,
  selectedEmployeeLabel,
  selectedDatesLabel,
  selectedStatusesCount,
  referenceTime,
  reportActive,
}: ReportGovernancePanelProps) => {
  const normalizedMeta = getRoleMeta(roleMeta.role);

  const rows = [
    { label: "Escopo", value: normalizedMeta.title, icon: ShieldCheck },
    { label: "Colaborador", value: selectedEmployeeLabel || "Não definido", icon: Users },
    { label: "Período", value: selectedDatesLabel, icon: Workflow },
    { label: "Referência", value: referenceTime || "HH:mm", icon: LockKeyhole },
    { label: "Situação", value: reportActive ? "Aprovado" : "Reprovado", icon: AlertTriangle },
    { label: "Filtros", value: `${selectedStatusesCount} selecionado(s)`, icon: ShieldCheck },
  ];

  return (
    <Card className="border border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.08)]">
      <CardHeader className="space-y-2 border-b border-[#D8E2EC] pb-4">
        <CardTitle className="flex items-center gap-2 text-base text-[#102A43]">
          <ShieldCheck className="h-4 w-4 text-[#1F4E5F]" />
          Governança e escopo
        </CardTitle>
        <p className="text-sm leading-6 text-[#627D98]">
          {normalizedMeta.note}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        <div className="grid gap-3">
          {rows.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-start justify-between gap-3 rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">{label}</p>
                <p className="mt-1 text-sm font-semibold text-[#102A43]">{value}</p>
              </div>
              <Badge className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", normalizedMeta.badgeClassName)}>
                <Icon className="mr-1 h-3.5 w-3.5" />
                {label}
              </Badge>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
          <p className="text-sm font-semibold text-[#102A43]">Regras de apresentação</p>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-[#627D98]">
            <li>O PDF e o CSV só ficam habilitados após existirem resultados.</li>
            <li>O fluxo de edição de registro continua disponível após o resultado.</li>
            <li>Não existe troca de empresa nesta tela; o escopo segue a role atual.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportGovernancePanel;
