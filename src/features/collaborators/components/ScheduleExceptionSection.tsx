import { useState, useEffect, useCallback } from "react";
import { CalendarX2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  listScheduleExceptions,
  createScheduleException,
  deleteScheduleException,
  type ScheduleExceptionResponse,
} from "@/service/schedule-exception.service";

type Props = {
  employeeId: string;
};

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;

type FormState = {
  exceptionDate: string;
  isDayOff: boolean;
  workStartTime: string;
  workEndTime: string;
  breakStartTime: string;
  breakEndTime: string;
  description: string;
};

const initialForm: FormState = {
  exceptionDate: today.toISOString().slice(0, 10),
  isDayOff: true,
  workStartTime: "",
  workEndTime: "",
  breakStartTime: "",
  breakEndTime: "",
  description: "",
};

export const ScheduleExceptionSection = ({ employeeId }: Props) => {
  const [exceptions, setExceptions] = useState<ScheduleExceptionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listScheduleExceptions(employeeId, currentYear, currentMonth);
      setExceptions(data);
    } catch {
      // silently ignore — exceptions section is non-critical
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (date: string) => {
    setDeletingDate(date);
    try {
      await deleteScheduleException(employeeId, date);
      setExceptions((prev) => prev.filter((e) => e.exceptionDate !== date));
    } catch {
      // noop
    } finally {
      setDeletingDate(null);
    }
  };

  const handleCreate = async () => {
    setError(null);
    if (!form.isDayOff && (!form.workStartTime || !form.workEndTime)) {
      setError("Informe horário de início e fim para exceção de trabalho.");
      return;
    }
    setSaving(true);
    try {
      const created = await createScheduleException(employeeId, {
        exceptionDate: form.exceptionDate,
        isDayOff: form.isDayOff,
        workStartTime: form.isDayOff ? null : form.workStartTime || null,
        workEndTime: form.isDayOff ? null : form.workEndTime || null,
        breakStartTime: form.isDayOff ? null : form.breakStartTime || null,
        breakEndTime: form.isDayOff ? null : form.breakEndTime || null,
        description: form.description || null,
      });
      setExceptions((prev) => [...prev, created].sort((a, b) => a.exceptionDate.localeCompare(b.exceptionDate)));
      setOpen(false);
      setForm(initialForm);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao salvar exceção.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-[22px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-[#1E3A8A]">
          <CalendarX2 className="h-4 w-4" />
          Exceções de jornada — {today.toLocaleString("pt-BR", { month: "long", year: "numeric" })}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 gap-1 rounded-full px-3 text-xs"
          onClick={() => { setForm(initialForm); setError(null); setOpen(true); }}
        >
          <Plus className="h-3 w-3" />
          Adicionar
        </Button>
      </div>

      {loading ? (
        <p className="text-xs text-[#94A3B8]">Carregando…</p>
      ) : exceptions.length === 0 ? (
        <p className="text-xs text-[#94A3B8]">Nenhuma exceção registrada este mês.</p>
      ) : (
        <div className="space-y-2">
          {exceptions.map((ex) => (
            <div
              key={ex.exceptionDate}
              className="flex items-center justify-between rounded-[14px] border border-[#E2E8F0] bg-white px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#0F172A]">{formatDate(ex.exceptionDate)}</p>
                <p className="text-xs text-[#64748B]">
                  {ex.isDayOff
                    ? "Folga"
                    : `${ex.workStartTime ?? "?"} – ${ex.workEndTime ?? "?"}`}
                  {ex.description ? ` · ${ex.description}` : ""}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-[#DC2626] hover:bg-red-50"
                disabled={deletingDate === ex.exceptionDate}
                onClick={() => handleDelete(ex.exceptionDate)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Nova exceção de jornada</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="exc-date">Data</Label>
              <Input
                id="exc-date"
                type="date"
                value={form.exceptionDate}
                onChange={(e) => setForm((f) => ({ ...f, exceptionDate: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="exc-dayoff"
                checked={form.isDayOff}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isDayOff: v }))}
              />
              <Label htmlFor="exc-dayoff">Marcar como folga (dia sem trabalho)</Label>
            </div>

            {!form.isDayOff && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="exc-start">Entrada</Label>
                    <Input
                      id="exc-start"
                      type="time"
                      value={form.workStartTime}
                      onChange={(e) => setForm((f) => ({ ...f, workStartTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="exc-end">Saída</Label>
                    <Input
                      id="exc-end"
                      type="time"
                      value={form.workEndTime}
                      onChange={(e) => setForm((f) => ({ ...f, workEndTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="exc-break-start">Início intervalo</Label>
                    <Input
                      id="exc-break-start"
                      type="time"
                      value={form.breakStartTime}
                      onChange={(e) => setForm((f) => ({ ...f, breakStartTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="exc-break-end">Fim intervalo</Label>
                    <Input
                      id="exc-break-end"
                      type="time"
                      value={form.breakEndTime}
                      onChange={(e) => setForm((f) => ({ ...f, breakEndTime: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <Label htmlFor="exc-desc">Descrição (opcional)</Label>
              <Input
                id="exc-desc"
                placeholder="ex: Feriado municipal, compensação…"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                maxLength={255}
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[#2563EB] hover:bg-[#1E3A8A]"
              disabled={saving}
              onClick={handleCreate}
            >
              {saving ? "Salvando…" : "Salvar exceção"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
