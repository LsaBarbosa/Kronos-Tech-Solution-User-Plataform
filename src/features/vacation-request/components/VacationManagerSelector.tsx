import { useMemo } from "react";
import { BadgeCheck, ChevronsUpDown, Loader2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ManagerOption } from "@/types/vacation";
import { mapManagerOptionToDisplay } from "../mappers/vacation-request.mapper";

interface VacationManagerSelectorProps {
  managerOptions: ManagerOption[];
  managerId: string;
  selectedManager?: ManagerOption;
  isLoadingManagers: boolean;
  errorMessage?: string;
  onManagerChange: (managerId: string) => void;
  compact?: boolean;
  isSubmitting?: boolean;
  className?: string;
}

const EmptyManagerState = ({ message }: { message: string }) => (
  <div className="rounded-[22px] border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
    {message}
  </div>
);

const VacationManagerSelector = ({
  managerOptions,
  managerId,
  selectedManager,
  isLoadingManagers,
  errorMessage,
  onManagerChange,
  compact = false,
  isSubmitting = false,
  className,
}: VacationManagerSelectorProps) => {
  const selectedDisplay = useMemo(
    () => (selectedManager ? mapManagerOptionToDisplay(selectedManager) : undefined),
    [selectedManager]
  );

  const inner = (
    <div className={cn(compact ? "rounded-[20px] border border-[#E2E8F0] bg-[#F8FAFC] p-4" : "space-y-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
            Gestor responsável
          </p>
          <p className="text-sm leading-6 text-[#64748B]">
            {compact
              ? "Quem vai aprovar sua solicitação."
              : "Escolha o gestor que vai analisar o período solicitado."}
          </p>
        </div>
        {isLoadingManagers ? (
          <Badge variant="outline" className="border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]">
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            Carregando
          </Badge>
        ) : null}
      </div>

      <Select
        value={managerId}
        onValueChange={onManagerChange}
        disabled={isLoadingManagers || isSubmitting || managerOptions.length === 0}
      >
        <SelectTrigger className="h-11 border-[#E2E8F0] bg-white text-[#0F172A]">
          <SelectValue placeholder="Selecionar gestor" />
        </SelectTrigger>
        <SelectContent>
          {managerOptions.length === 0 ? (
            <SelectItem value="__empty__" disabled>
              Nenhum gestor disponível
            </SelectItem>
          ) : (
            managerOptions.map((manager) => {
              const display = mapManagerOptionToDisplay(manager);

              return (
                <SelectItem key={manager.userId} value={manager.userId}>
                  <div className="flex w-full flex-col items-start">
                    <span className="font-medium text-[#0F172A]">{display.displayName}</span>
                    <span className="text-xs text-[#64748B]">@{manager.username}</span>
                  </div>
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>

      {selectedDisplay ? (
        <div className="flex items-center gap-3 rounded-[22px] border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A] text-sm font-semibold text-white">
            {selectedDisplay.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#0F172A]">{selectedDisplay.displayName}</p>
            <p className="truncate text-sm text-[#64748B]">{selectedDisplay.subtitle}</p>
            <p className="truncate text-xs text-[#94A3B8]">@{selectedDisplay.username}</p>
          </div>
          <BadgeCheck className="h-5 w-5 text-[#16A34A]" />
        </div>
      ) : (
        <EmptyManagerState
          message={
            isLoadingManagers
              ? "Buscando managers disponíveis..."
              : "Selecione um manager para continuar."
          }
        />
      )}

      {errorMessage ? (
        <div className="rounded-[22px] border border-[#F5B5B5] bg-[#FEE2E2] p-4 text-sm text-[#B91C1C]">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );

  if (compact) {
    return inner;
  }

  return (
    <Card className="rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_16px_40px_rgba(16,26,51,0.08)]">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl text-[#0F172A]">Manager responsável pela aprovação</CardTitle>
        <CardDescription className="text-[#64748B]">
          O manager selecionado receberá a solicitação após o envio.
        </CardDescription>
      </CardHeader>
      <CardContent>{inner}</CardContent>
    </Card>
  );
};

export default VacationManagerSelector;

