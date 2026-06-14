import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { mapManagerOptionToDisplay } from "../mappers/time-off-request.mapper";
import type { ManagerOption } from "@/types/vacation";
import { UsersRound, UserCheck } from "lucide-react";

interface TimeOffManagerSelectorProps {
  managerOptions: ManagerOption[];
  managerId: string;
  selectedManager?: ManagerOption;
  isLoadingManagers: boolean;
  managerErrorMessage?: string;
  onManagerChange: (managerId: string) => void;
  variant?: "desktop" | "mobile";
  className?: string;
}

const TimeOffManagerSelector = ({
  managerOptions,
  managerId,
  selectedManager,
  isLoadingManagers,
  managerErrorMessage,
  onManagerChange,
  variant = "desktop",
  className,
}: TimeOffManagerSelectorProps) => {
  const [open, setOpen] = useState(false);
  const isMobile = variant === "mobile";
  const selectedDisplay = selectedManager ? mapManagerOptionToDisplay(selectedManager) : undefined;

  return (
    <Card className={cn("rounded-[28px] border border-[#D8E2EC] bg-white shadow-[0_16px_40px_rgba(16,42,67,0.10)]", className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#B3C2D0] bg-[#E9EEF4] text-[#102A43]">
            <UsersRound className="mr-1 h-3.5 w-3.5" />
            Destino
          </Badge>
        </div>
        <CardTitle className="text-[#102A43]">Manager responsável pela aprovação</CardTitle>
        <CardDescription className="text-[#627D98]">
          Selecione o gestor que receberá a solicitação para análise.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isMobile ? (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full justify-between rounded-[18px] border-[#D8E2EC] bg-white text-left font-normal text-[#102A43]"
                disabled={isLoadingManagers || managerOptions.length === 0}
              >
                <span className="text-left">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">
                    Gestor
                  </span>
                  <span className={cn("mt-1 block text-sm font-semibold", !selectedDisplay && "text-[#627D98]")}>
                    {selectedDisplay?.displayName ?? (isLoadingManagers ? "Carregando gestores..." : "Selecionar gestor")}
                  </span>
                </span>
                <UserCheck className="h-4 w-4 text-[#1F4E5F]" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[92vh] overflow-hidden">
              <DrawerHeader className="pb-2">
                <DrawerTitle className="text-[#102A43]">Escolha o manager responsável</DrawerTitle>
                <DrawerDescription className="text-[#627D98]">
                  O gestor selecionado será responsável pela análise da solicitação.
                </DrawerDescription>
              </DrawerHeader>
              <div className="max-h-[60vh] space-y-2 overflow-y-auto px-3 pb-4">
                {isLoadingManagers ? (
                  <div className="rounded-[20px] border border-dashed border-[#D8E2EC] bg-[#F8FAFC] px-4 py-8 text-center text-sm text-[#627D98]">
                    Carregando gestores ativos...
                  </div>
                ) : managerOptions.length === 0 ? (
                  <div className="rounded-[20px] border border-dashed border-[#D8E2EC] bg-[#F8FAFC] px-4 py-8 text-center text-sm text-[#627D98]">
                    Nenhum gestor ativo encontrado.
                  </div>
                ) : (
                  managerOptions.map((manager) => {
                    const display = mapManagerOptionToDisplay(manager);
                    const active = manager.userId === managerId;

                    return (
                      <button
                        key={manager.userId}
                        type="button"
                        onClick={() => {
                          onManagerChange(manager.userId);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-[20px] border px-4 py-3 text-left transition-colors",
                          active
                            ? "border-[#22B8CF] bg-[#EEF7FB]"
                            : "border-[#D8E2EC] bg-white hover:border-[#B3C2D0] hover:bg-[#F8FAFC]"
                        )}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F4E5F] text-sm font-semibold text-white">
                          {display.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#102A43]">{display.displayName}</p>
                          <p className="text-xs text-[#627D98]">{display.subtitle}</p>
                        </div>
                        {active ? <UserCheck className="h-4 w-4 text-[#1C8C7C]" /> : null}
                      </button>
                    );
                  })
                )}
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Select
            value={managerId}
            onValueChange={onManagerChange}
            disabled={isLoadingManagers || managerOptions.length === 0}
          >
            <SelectTrigger className="h-12 rounded-[18px] border-[#D8E2EC] bg-white text-[#102A43]">
              <SelectValue placeholder={isLoadingManagers ? "Carregando gestores..." : "Selecionar gestor"} />
            </SelectTrigger>
            <SelectContent>
              {managerOptions.map((manager) => {
                const display = mapManagerOptionToDisplay(manager);

                return (
                  <SelectItem key={manager.userId} value={manager.userId}>
                    {display.displayName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}

        {selectedDisplay ? (
          <div className="rounded-[22px] border border-[#D8E2EC] bg-[#F8FAFC] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Selecionado</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1F4E5F] text-sm font-semibold text-white">
                {selectedDisplay.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#102A43]">{selectedDisplay.displayName}</p>
                <p className="text-sm text-[#627D98]">{selectedDisplay.subtitle}</p>
              </div>
            </div>
          </div>
        ) : null}

        {managerErrorMessage ? (
          <div className="rounded-[22px] border border-[#F3D08A] bg-[#FFF7E6] px-4 py-3 text-sm leading-6 text-[#8A5A00]">
            {managerErrorMessage}
          </div>
        ) : null}

        {!isLoadingManagers && managerOptions.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-[#D8E2EC] bg-[#F8FAFC] px-4 py-3 text-sm leading-6 text-[#627D98]">
            Nenhum gestor ativo disponível para seleção.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default TimeOffManagerSelector;
