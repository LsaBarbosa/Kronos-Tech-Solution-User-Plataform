import { useState } from "react";
import { format } from "date-fns";
import { AlertCircle, CalendarClock, Clock4, Search, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchManagerMonthlyAlerts } from "@/service/records.service";
import type { ManagerMonthlyAlertFilter, ManagerMonthlyAlertItem } from "@/types/manager-monthly-alert";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";

const FILTER_LABELS: Record<ManagerMonthlyAlertFilter, string> = {
  PENDING_EXIT: "Saída pendente",
  OVERTIME: "Hora extra acima de 5 minutos",
  NEGATIVE_BALANCE: "Saldo de horas negativo",
};

const formatDate = (value: string) => {
  const parts = value.split("-");
  return parts.length === 3 ? `${parts[0]}/${parts[1]}/${parts[2]}` : value;
};

const ManagerMonthlyAlertsDialog = () => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [filter, setFilter] = useState<ManagerMonthlyAlertFilter>("PENDING_EXIT");
  const [items, setItems] = useState<ManagerMonthlyAlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!month) return;
    setIsLoading(true);
    setError(null);
    try {
      setItems(await fetchManagerMonthlyAlerts(month, filter));
    } catch (requestError) {
      setItems([]);
      setError(getServiceErrorMessage(requestError, "Não foi possível carregar o relatório gerencial."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="h-11 w-full gap-2 rounded-2xl bg-[#FDE68A] text-[#78350F] hover:bg-[#FCD34D]">
          <Search className="h-4 w-4" aria-hidden="true" />
          Alertas do mês
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-[#D8E2EC] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#102A43]"><CalendarClock className="h-5 w-5" /> Alertas mensais de ponto</DialogTitle>
          <DialogDescription>Consulte colaboradores e datas com saída pendente, hora extra ou saldo negativo.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="manager-alert-month">Mês</Label>
            <Input id="manager-alert-month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Filtro</Label>
            <Select value={filter} onValueChange={(value) => setFilter(value as ManagerMonthlyAlertFilter)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING_EXIT">Saída pendente</SelectItem>
                <SelectItem value="OVERTIME">Hora extra acima de 5 minutos</SelectItem>
                <SelectItem value="NEGATIVE_BALANCE">Saldo de horas negativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={() => void submit()} disabled={!month || isLoading} className="gap-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8]">
            <Search className="h-4 w-4" /> {isLoading ? "Consultando..." : "Consultar"}
          </Button>
        </div>

        {error ? <p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 text-sm text-[#991B1B]">{error}</p> : null}
        {!error && items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center text-sm text-[#64748B]">
            {isLoading ? "Carregando resultados..." : "Nenhum colaborador encontrado para o filtro selecionado."}
          </div>
        ) : null}
        {items.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-[#D8E2EC]">
            <div className="grid grid-cols-[minmax(0,1fr)_120px_140px] gap-3 bg-[#F8FAFC] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#627D98]">
              <span>Colaborador</span><span>Data</span><span>{FILTER_LABELS[filter]}</span>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {items.map((item) => (
                <div key={`${item.employeeId}-${item.date}`} className="grid grid-cols-[minmax(0,1fr)_120px_140px] gap-3 px-4 py-3 text-sm text-[#102A43]">
                  <span className="min-w-0 truncate font-semibold">{item.employeeName}</span>
                  <span>{formatDate(item.date)}</span>
                  <span className="flex items-center gap-1 font-semibold text-[#B45309]">
                    {filter === "OVERTIME" ? <Clock4 className="h-4 w-4" /> : filter === "NEGATIVE_BALANCE" ? <TrendingDown className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ManagerMonthlyAlertsDialog;
