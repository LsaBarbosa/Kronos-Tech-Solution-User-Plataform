import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Clock3 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { APP_PATHS } from "@/config/app-routes";
import { fetchMyPendingExits } from "@/service/records.service";
import { PENDING_EXIT_LOGIN_FLAG } from "@/constants/pending-exit";
import type { PendingExitItem } from "@/types/pending-exit";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formatDate = (value: string) => {
  const parts = value.split("-");
  return parts.length === 3 ? `${parts[0]}/${parts[1]}/${parts[2]}` : value;
};

const PendingExitPrompt = () => {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<PendingExitItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    let shouldCheck = false;
    try {
      shouldCheck = sessionStorage.getItem(PENDING_EXIT_LOGIN_FLAG) === "1";
      if (shouldCheck) sessionStorage.removeItem(PENDING_EXIT_LOGIN_FLAG);
    } catch {
      return;
    }

    if (!shouldCheck) return;

    void fetchMyPendingExits()
      .then((pendingItems) => {
        if (pendingItems.length > 0) {
          setItems(pendingItems);
          setOpen(true);
        }
      })
      .catch(() => undefined);
  }, [status]);

  const openCorrection = (item: PendingExitItem) => {
    setOpen(false);
    navigate(`${APP_PATHS.relatorioDetalhado}?pendingRecordId=${item.timeRecordId}&pendingDate=${encodeURIComponent(item.workDate)}`);
  };

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent className="max-w-lg border-[#FCD34D] bg-white">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#92400E]">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <DialogTitle className="text-xl text-[#0F172A]">Ajuste de ponto necessário</DialogTitle>
          <DialogDescription className="text-[#475569]">
            Encontramos {items.length === 1 ? "uma marcação" : `${items.length} marcações`} sem saída registrada. Ajuste o horário para enviar a solicitação ao gestor.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-3">
          {items.map((item) => (
            <div key={item.timeRecordId} className="flex items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="min-w-0">
                <p className="font-semibold text-[#0F172A]">{formatDate(item.workDate)}</p>
                <p className="flex items-center gap-1 text-sm text-[#64748B]"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />Entrada às {item.startHour} · {item.companyName}</p>
              </div>
              <Button type="button" className="shrink-0 gap-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8]" onClick={() => openCorrection(item)}>
                Ajustar <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PendingExitPrompt;
