import { Loader2, User, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CreateAvisoViewModel } from "./useCreateAvisoViewModel";

interface CreateAvisoRecipientsCardProps {
  viewModel: CreateAvisoViewModel;
  variant: "desktop" | "mobile";
}

export const CreateAvisoRecipientsCard = ({
  viewModel,
  variant,
}: CreateAvisoRecipientsCardProps) => {
  const {
    formState,
    setFilterTerm,
    employees,
    filteredEmployees,
    isFetchingEmployees,
    isAllSelected,
    handleSelectAll,
    handleToggleEmployee,
  } = viewModel;
  const { filterTerm, selectedEmployeeIds } = formState;
  const isCompact = variant === "mobile";

  return (
    <Card className="border border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.08)]">
      <CardHeader className={cn("space-y-2", isCompact ? "p-4" : "p-6")}>
        <CardTitle className="flex items-center gap-2 text-lg text-[#102A43] sm:text-xl">
          <Users className="h-5 w-5 text-[#1F4E5F]" />
          Destinatários
        </CardTitle>
        <CardDescription className="text-sm text-[#627D98]">
          Selecione colaboradores específicos. Sem seleção, o aviso fica visível apenas para você.
        </CardDescription>
      </CardHeader>

      <CardContent className={cn("space-y-4", isCompact ? "p-4 pt-0" : "p-6 pt-0")}>
        <div className="space-y-2">
          <Label
            htmlFor="employee-filter"
            className="text-sm font-semibold text-[#102A43]"
          >
            Filtrar colaboradores
          </Label>
          <Input
            id="employee-filter"
            placeholder="Filtrar por nome do colaborador..."
            value={filterTerm}
            onChange={(event) => setFilterTerm(event.target.value)}
            className="h-11 rounded-2xl border-[#D8E2EC] bg-white text-[#102A43]"
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all-employees"
              checked={isAllSelected}
              onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
              className="data-[state=checked]:border-[#1D4ED8] data-[state=checked]:bg-[#1D4ED8]"
              disabled={filteredEmployees.length === 0}
            />
            <Label
              htmlFor="select-all-employees"
              className="cursor-pointer text-sm font-semibold text-[#102A43]"
            >
              Selecionar todos visíveis ({selectedEmployeeIds.length}/{employees.length})
            </Label>
          </div>
          {isFetchingEmployees ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#1F4E5F]" />
          ) : null}
        </div>

        <div
          className={cn(
            "space-y-1 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-2",
            isCompact ? "max-h-[280px]" : "max-h-[360px]",
            "overflow-y-auto"
          )}
        >
          {isFetchingEmployees && employees.length === 0 ? (
            <p className="px-2 py-3 text-sm text-[#627D98]">
              Carregando lista de colaboradores...
            </p>
          ) : null}

          {!isFetchingEmployees && filteredEmployees.length === 0 && filterTerm ? (
            <p className="px-2 py-3 text-sm text-[#627D98]">
              Nenhum colaborador encontrado com o filtro "{filterTerm}".
            </p>
          ) : null}

          {filteredEmployees.map((employee) => {
            const isSelected = selectedEmployeeIds.includes(employee.employeeId);
            return (
              <div
                key={employee.employeeId}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-white",
                  isSelected && "bg-[#EFF6FF] hover:bg-[#DBEAFE]"
                )}
              >
                <Checkbox
                  id={`emp-${employee.employeeId}`}
                  checked={isSelected}
                  onCheckedChange={() => handleToggleEmployee(employee.employeeId)}
                  className="data-[state=checked]:border-[#1D4ED8] data-[state=checked]:bg-[#1D4ED8]"
                />
                <Label
                  htmlFor={`emp-${employee.employeeId}`}
                  className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium text-[#102A43]"
                >
                  <User className="h-4 w-4 text-[#627D98]" />
                  <span className="flex-1 truncate">{employee.fullName}</span>
                  {isSelected ? (
                    <span className="text-[11px] font-semibold text-[#1D4ED8]">Selecionado</span>
                  ) : null}
                </Label>
              </div>
            );
          })}
        </div>

        {selectedEmployeeIds.length === 0 ? (
          <p className="text-xs leading-5 text-[#627D98]">
            Nenhum destinatário selecionado — o aviso ficará visível apenas para você (remetente).
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default CreateAvisoRecipientsCard;
