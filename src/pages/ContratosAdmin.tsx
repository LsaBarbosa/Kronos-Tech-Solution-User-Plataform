import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, FileSignature, Loader2, Plus, RefreshCcw, ScrollText, Users } from "lucide-react";
import PageShell from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ServiceContractSignatureService } from "@/service/serviceContractSignature.service";
import { APP_PATHS } from "@/config/app-routes";
import type { ServiceContractAdminItem, ServiceContractSignatureAdminItem } from "@/types/service-contract-signature";
import { FaqContextualBlock } from "@/components/faq/FaqContextualBlock";
import { FAQ_SCREEN_KEYS } from "@/constants/faqScreenKeys";

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
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);
  const [signaturesByContract, setSignaturesByContract] = useState<Record<string, ServiceContractSignatureAdminItem[]>>({});
  const [loadingSignatures, setLoadingSignatures] = useState<string | null>(null);

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

  const toggleSignatures = useCallback(async (contract: ServiceContractAdminItem) => {
    if (expandedContractId === contract.contractId) {
      setExpandedContractId(null);
      return;
    }

    setExpandedContractId(contract.contractId);
    if (signaturesByContract[contract.contractId]) return;

    setLoadingSignatures(contract.contractId);
    try {
      const page = await ServiceContractSignatureService.listAdminSignatures({
        contractId: contract.contractId,
        status: "ACTIVE",
        page: 0,
        size: 100,
      });
      setSignaturesByContract((current) => ({
        ...current,
        [contract.contractId]: Array.isArray(page?.items) ? page.items : [],
      }));
    } catch (error) {
      setExpandedContractId(null);
      toast({
        variant: "destructive",
        title: "Falha ao carregar assinantes",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setLoadingSignatures(null);
    }
  }, [expandedContractId, signaturesByContract, toast]);

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
      mainClassName="pt-24 sm:pt-32 px-4 pb-5 sm:px-6 sm:pb-8 lg:px-8 relative z-10 overflow-x-hidden bg-[#D9E2EB]"
    >
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Card className="relative overflow-hidden border-border/70 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.55)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.20),transparent_30%)]" />
          <div className="relative bg-gradient-to-br from-[#102A43] via-[#1F4E5F] to-[#102A43] px-5 py-6 text-white sm:px-8 sm:py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ScrollText className="h-5 w-5 text-cyan-300" />
                  <Badge className="border-white/15 bg-white/10 text-white">Gestão de contratos</Badge>
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">
                    Contratos enviados
                  </h1>
                  <p className="text-sm leading-6 text-white/78">
                    Acompanhe os contratos atribuídos e suas assinaturas.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => load()}
                  disabled={isLoading}
                  className="h-10 border-white/20 bg-white/10 px-4 text-white hover:bg-white/15 hover:text-white"
                >
                  <RefreshCcw className={"mr-2 h-4 w-4 " + (isLoading ? "animate-spin" : "")} />
                  Atualizar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-10 bg-[#7C3AED] px-4 hover:bg-[#6D28D9]"
                  onClick={() => navigate(APP_PATHS.contratosEnviar)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo contrato
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {(["ALL", "ACTIVE", "VOIDED"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={
                    "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors " +
                    (statusFilter === s
                      ? "bg-white text-[#102A43]"
                      : "bg-white/10 text-white hover:bg-white/20")
                  }
                >
                  {s === "ALL" ? "Todos" : s === "ACTIVE" ? "Ativos" : "Anulados"}
                </button>
              ))}
            </div>
          </div>
        </Card>

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
                {c.signedCount > 0 ? (
                  <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 px-2 text-xs text-[#2563EB] hover:text-[#1D4ED8]"
                      onClick={() => void toggleSignatures(c)}
                      disabled={loadingSignatures === c.contractId}
                    >
                      {loadingSignatures === c.contractId ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Users className="h-3.5 w-3.5" />
                      )}
                      {expandedContractId === c.contractId ? "Ocultar assinantes" : "Ver quem assinou"}
                      {expandedContractId === c.contractId ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    {expandedContractId === c.contractId ? (
                      <div className="mt-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                        <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          Assinantes ({signaturesByContract[c.contractId]?.length ?? 0})
                        </p>
                        <ul className="space-y-1.5">
                          {(signaturesByContract[c.contractId] ?? []).map((signature) => (
                            <li
                              key={signature.signatureId}
                              className="flex flex-col gap-0.5 text-xs text-slate-700 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <span className="font-medium">{signature.employeeName || "Nome não informado"}</span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                Assinado em {new Date(signature.signedAt).toLocaleString("pt-BR")}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <FaqContextualBlock screenKey={FAQ_SCREEN_KEYS.CONTRACTS} className="mt-6" />
    </PageShell>
  );
};

export default ContratosAdmin;
