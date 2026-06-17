import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileSignature, Loader2, Plus, RefreshCcw } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ServiceContractSignatureService } from "@/service/serviceContractSignature.service";
import { APP_PATHS } from "@/config/app-routes";
import type { ServiceContractAdminItem } from "@/types/service-contract-signature";

const StatusBadge = ({ status }: { status: "ACTIVE" | "VOIDED" }) => (
  <span
    className={
      status === "ACTIVE"
        ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-100"
        : "rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200"
    }
  >
    {status === "ACTIVE" ? "Ativo" : "Anulado"}
  </span>
);

const ContratosAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<ServiceContractAdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "VOIDED" | "ALL">("ALL");

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await ServiceContractSignatureService.listAdmin({
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page: 0,
        size: 50,
      });
      // Defensivo: backend deve devolver `items: [...]`, mas se vier null/undefined
      // por qualquer razão (response normalizado por interceptor, body parcial,
      // schema antigo) caímos para [] em vez de quebrar o render com items.length.
      setItems(Array.isArray(page?.items) ? page.items : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao carregar contratos",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
      mainClassName="pt-24 sm:pt-32 px-4 pb-5 sm:px-6 sm:pb-8 lg:px-8 relative z-10 overflow-x-hidden bg-[#D9E2EB]"
    >
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Contratos enviados
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Acompanhe os contratos atribuídos e suas assinaturas.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => load()}
              disabled={isLoading}
            >
              <RefreshCcw className={"mr-2 h-4 w-4 " + (isLoading ? "animate-spin" : "")} />
              Atualizar
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-[#7C3AED] hover:bg-[#6D28D9]"
              onClick={() => navigate(APP_PATHS.contratosEnviar)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo contrato
            </Button>
          </div>
        </header>

        <div className="flex items-center gap-2">
          {(["ALL", "ACTIVE", "VOIDED"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors " +
                (statusFilter === s
                  ? "bg-[#7C3AED] text-white"
                  : "bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200")
              }
            >
              {s === "ALL" ? "Todos" : s === "ACTIVE" ? "Ativos" : "Anulados"}
            </button>
          ))}
        </div>

        {isLoading && items.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white dark:border-[#404854] dark:bg-slate-800/50">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center text-sm text-slate-600 dark:border-[#404854] dark:bg-slate-800/50 dark:text-slate-300">
            Nenhum contrato encontrado.
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((c) => (
              <li
                key={c.contractId}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-[#404854] dark:bg-slate-800/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FileSignature className="h-4 w-4 text-[#7C3AED]" />
                      <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
                        {c.title}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Arquivo: {c.originalFileName}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Criado em {new Date(c.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-100">
                    Assinados: {c.signedCount}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                    Pendentes: {c.pendingCount}
                  </span>
                  {c.cancelledCount > 0 ? (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      Cancelados: {c.cancelledCount}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    Total: {c.totalAssignments}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
};

export default ContratosAdmin;
