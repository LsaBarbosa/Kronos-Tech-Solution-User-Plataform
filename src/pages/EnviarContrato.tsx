import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileUp, Loader2, RefreshCcw, Send } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { listEmployees } from "@/service/employee.service";
import { ServiceContractSignatureService } from "@/service/serviceContractSignature.service";
import { APP_PATHS } from "@/config/app-routes";
import type { EmployeeData } from "@/types/employee";

const EnviarContrato = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const loadEmployees = useCallback(async () => {
    setIsLoadingEmployees(true);
    try {
      const list = await listEmployees(true);
      setEmployees(list);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao carregar colaboradores",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setIsLoadingEmployees(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadEmployees();
  }, [loadEmployees]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => e.fullName.toLowerCase().includes(q));
  }, [employees, search]);

  const toggleEmployee = useCallback((employeeId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(employeeId)) next.delete(employeeId);
      else next.add(employeeId);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!title.trim()) {
        toast({ variant: "destructive", title: "Título obrigatório" });
        return;
      }
      if (!file) {
        toast({ variant: "destructive", title: "Anexe o PDF do contrato" });
        return;
      }
      if (selectedIds.size === 0) {
        toast({
          variant: "destructive",
          title: "Selecione ao menos um colaborador",
        });
        return;
      }
      if (file.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Apenas arquivos PDF são aceitos",
        });
        return;
      }
      setIsSubmitting(true);
      try {
        const response = await ServiceContractSignatureService.createContract({
          title: title.trim(),
          description: description.trim() || undefined,
          employeeIds: Array.from(selectedIds),
          file,
        });
        toast({
          title: "Contrato enviado",
          description: `${response.assignmentIds.length} colaborador(es) notificado(s).`,
        });
        navigate(APP_PATHS.contratosAdmin);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Falha ao enviar contrato",
          description: error instanceof Error ? error.message : "Tente novamente em instantes.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [description, file, navigate, selectedIds, title, toast]
  );

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
      mainClassName="pt-24 sm:pt-32 px-4 pb-5 sm:px-6 sm:pb-8 lg:px-8 relative z-10 overflow-x-hidden bg-[#D9E2EB]"
    >
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Enviar Contrato
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Anexe o PDF do contrato e atribua a um ou mais colaboradores ativos.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-[#E5E7EB] bg-white p-5 dark:border-[#404854] dark:bg-slate-800/50"
        >
          <div className="space-y-2">
            <label htmlFor="contract-title" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Título do contrato
            </label>
            <Input
              id="contract-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contrato de prestação de serviços 2026"
              disabled={isSubmitting}
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contract-description" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Descrição (opcional)
            </label>
            <Textarea
              id="contract-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Resumo do escopo do contrato (visível ao colaborador)."
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contract-file" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Arquivo PDF do contrato
            </label>
            <div className="flex items-center gap-3">
              <Input
                id="contract-file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                disabled={isSubmitting}
                required
              />
              {file ? (
                <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                  <FileUp className="h-3.5 w-3.5" />
                  {file.name}
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Colaboradores atribuídos ({selectedIds.size})
              </h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => loadEmployees()}
                disabled={isLoadingEmployees}
                aria-label="Recarregar colaboradores"
              >
                <RefreshCcw className={"mr-2 h-3.5 w-3.5 " + (isLoadingEmployees ? "animate-spin" : "")} />
                Recarregar
              </Button>
            </div>
            <Input
              placeholder="Buscar por nome"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white p-2 dark:border-[#404854] dark:bg-slate-900/40">
              {isLoadingEmployees ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                </div>
              ) : filteredEmployees.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">Nenhum colaborador encontrado.</p>
              ) : (
                filteredEmployees.map((emp) => (
                  <label
                    key={emp.employeeId}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(emp.employeeId)}
                      onChange={() => toggleEmployee(emp.employeeId)}
                      disabled={isSubmitting}
                      className="h-4 w-4 rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">{emp.fullName}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{emp.jobPosition}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9]"
            disabled={isSubmitting || !title.trim() || !file || selectedIds.size === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando…
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar contrato
              </>
            )}
          </Button>
        </form>
      </div>
    </PageShell>
  );
};

export default EnviarContrato;
