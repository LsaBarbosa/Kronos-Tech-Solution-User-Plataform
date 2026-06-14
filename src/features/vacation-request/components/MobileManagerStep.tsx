import { useMemo, useState } from "react";
import { ChevronRight, Loader2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { ManagerOption } from "@/types/vacation";
import { mapManagerOptionToDisplay } from "../mappers/vacation-request.mapper";

interface MobileManagerStepProps {
  managerOptions: ManagerOption[];
  managerId: string;
  selectedManager?: ManagerOption;
  isLoadingManagers: boolean;
  managerErrorMessage?: string;
  onManagerChange: (managerId: string) => void;
}

const MobileManagerStep = ({
  managerOptions,
  managerId,
  selectedManager,
  isLoadingManagers,
  managerErrorMessage,
  onManagerChange,
}: MobileManagerStepProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedDisplay = useMemo(
    () => (selectedManager ? mapManagerOptionToDisplay(selectedManager) : undefined),
    [selectedManager]
  );

  return (
    <>
      <Card className="rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_16px_40px_rgba(16,26,51,0.08)]">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]">
              <UserRound className="mr-1 h-3.5 w-3.5" />
              Passo 2
            </Badge>
          </div>
          <CardTitle className="text-2xl text-[#0F172A]">Gestor aprovador</CardTitle>
          <CardDescription className="text-[#64748B]">Quem analisará sua solicitação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedDisplay ? (
            <div className="flex items-center gap-3 rounded-[22px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E3A8A] text-sm font-semibold text-white">
                {selectedDisplay.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#0F172A]">{selectedDisplay.displayName}</p>
                <p className="truncate text-sm text-[#64748B]">{selectedDisplay.subtitle}</p>
                <p className="truncate text-xs text-[#94A3B8]">@{selectedDisplay.username}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
              Selecione um manager para continuar.
            </div>
          )}

          <Button
            type="button"
            className="h-12 w-full rounded-full bg-[#2563EB] text-white hover:bg-[#1E3A8A]"
            onClick={() => setDrawerOpen(true)}
            disabled={isLoadingManagers}
          >
            {isLoadingManagers ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {selectedManager ? "Trocar manager" : "Escolher manager"}
            <ChevronRight className="h-4 w-4" />
          </Button>

          {managerErrorMessage ? (
            <div className="rounded-[22px] border border-[#F5B5B5] bg-[#FEE2E2] p-4 text-sm text-[#B91C1C]">
              {managerErrorMessage}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[86vh] rounded-t-[28px] bg-white">
          <DrawerHeader className="space-y-2 px-5 pt-6">
            <DrawerTitle className="text-left text-xl text-[#0F172A]">Escolher manager</DrawerTitle>
            <DrawerDescription className="text-left text-[#64748B]">
              Selecione quem vai analisar sua solicitação de férias.
            </DrawerDescription>
          </DrawerHeader>

          <div className="max-h-[55vh] space-y-3 overflow-y-auto px-5 pb-4 pt-2">
            {isLoadingManagers ? (
              <div className="rounded-[22px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
                Carregando managers...
              </div>
            ) : managerOptions.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
                Nenhum manager disponível na empresa.
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
                      setDrawerOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[22px] border p-4 text-left transition-colors",
                      active
                        ? "border-[#2563EB] bg-[#EFF6FF]"
                        : "border-[#E2E8F0] bg-white hover:border-[#BFDBFE] hover:bg-[#F8FAFC]"
                    )}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1E3A8A] text-sm font-semibold text-white">
                      {display.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">{display.displayName}</p>
                      <p className="truncate text-sm text-[#64748B]">{display.subtitle}</p>
                      <p className="truncate text-xs text-[#94A3B8]">@{manager.username}</p>
                    </div>
                    {active ? (
                      <Badge variant="outline" className="border-[#B7E4C7] bg-[#DCFCE7] text-[#166534]">
                        Selecionado
                      </Badge>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileManagerStep;

