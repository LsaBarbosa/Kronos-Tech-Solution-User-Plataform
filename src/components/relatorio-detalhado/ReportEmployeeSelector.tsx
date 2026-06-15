import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Lock, Users, ShieldCheck } from "lucide-react";
import type { AppRole } from "@/config/app-routes";
import type { Employee } from "@/utils/report-utils";
import { getRoleMeta } from "@/components/relatorio-detalhado/report-ui.helpers";

type EmployeeScope = "active" | "inactive";

type ReportEmployeeSelectorProps = {
  role: AppRole;
  employeeScope: EmployeeScope;
  onEmployeeScopeChange: (scope: EmployeeScope) => void;
  employees: Employee[];
  selectedEmployee: string;
  onSelectedEmployeeChange: (value: string) => void;
  selectedEmployeeLabel: string;
  isLoadingEmployees: boolean;
  isPartner: boolean;
};

export const ReportEmployeeSelector = ({
  role,
  employeeScope,
  onEmployeeScopeChange,
  employees,
  selectedEmployee,
  onSelectedEmployeeChange,
  selectedEmployeeLabel,
  isLoadingEmployees,
  isPartner,
}: ReportEmployeeSelectorProps) => {
  const roleMeta = getRoleMeta(role);

  const employeeCountLabel = useMemo(() => {
    if (isLoadingEmployees) {
      return "Carregando colaboradores...";
    }

    if (employees.length === 0) {
      return "Nenhum colaborador disponível para o filtro.";
    }

    return `${employees.length} colaborador${employees.length === 1 ? "" : "es"} carregado${employees.length === 1 ? "" : "s"}.`;
  }, [employees.length, isLoadingEmployees]);

  return (
    <Card className="border border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.08)]">
      <CardHeader className="space-y-2 border-b border-[#D8E2EC] pb-4">
        <CardTitle className="flex items-center gap-2 text-base text-[#102A43]">
          <Users className="h-4 w-4 text-[#1F4E5F]" />
          Colaborador
        </CardTitle>
        <p className="text-sm leading-6 text-[#627D98]">
          {roleMeta.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {isPartner ? (
          <div className="rounded-2xl border border-[#99F6E4] bg-[#ECFEFF] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1C8C7C]/10 text-[#1C8C7C]">
                <Lock className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold text-[#102A43]">Colaborador bloqueado pela sessão</p>
                <p className="text-sm leading-6 text-[#627D98]">
                  {selectedEmployeeLabel}
                </p>
                <Badge className="rounded-full border border-[#99F6E4] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#166E64]">
                  Sem troca de colaborador
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onEmployeeScopeChange("active")}
                className={cn(
                  "h-10 rounded-full border px-4 text-sm font-semibold",
                  employeeScope === "active"
                    ? "border-[#1F4E5F] bg-[#102A43] text-white hover:bg-[#0F172A]"
                    : "border-[#D8E2EC] bg-[#F5F8FB] text-[#627D98] hover:bg-white"
                )}
              >
                Ativos
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onEmployeeScopeChange("inactive")}
                className={cn(
                  "h-10 rounded-full border px-4 text-sm font-semibold",
                  employeeScope === "inactive"
                    ? "border-[#1F4E5F] bg-[#1F4E5F] text-white hover:bg-[#173E4B]"
                    : "border-[#D8E2EC] bg-[#F5F8FB] text-[#627D98] hover:bg-white"
                )}
              >
                Inativos
              </Button>
              <Badge className="rounded-full border border-[#D8E2EC] bg-[#F5F8FB] px-3 py-1 text-[11px] font-semibold text-[#627D98]">
                {employeeCountLabel}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#102A43]">Selecionar colaborador</p>
              <Select value={selectedEmployee} onValueChange={onSelectedEmployeeChange} disabled={isLoadingEmployees}>
                <SelectTrigger className="h-11 rounded-2xl border-[#D8E2EC] bg-[#F5F8FB] text-[#102A43] focus:border-[#1F4E5F] focus:ring-[#1F4E5F]/20">
                  <SelectValue placeholder={isLoadingEmployees ? "Carregando..." : "Escolha um colaborador"} />
                </SelectTrigger>
                <SelectContent>
                  {employees.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      Nenhum colaborador encontrado.
                    </SelectItem>
                  ) : (
                    employees.map((employee) => (
                      <SelectItem key={employee.employeeId} value={employee.employeeId}>
                        {employee.fullName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#102A43]">
                <ShieldCheck className="h-4 w-4 text-[#1C8C7C]" />
                Escopo operacional
              </div>
              <p className="mt-2 text-sm leading-6 text-[#627D98]">
                {role === "CTO"
                  ? "Visão administrativa ampla. Não há troca de empresa nesta tela."
                  : "Colaboradores do tenant/equipe atual conforme o filtro selecionado."}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportEmployeeSelector;
