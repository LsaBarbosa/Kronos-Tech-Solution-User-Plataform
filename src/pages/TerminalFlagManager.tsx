import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, MonitorSmartphone, Sparkles, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import { fetchCompanyList, toggleTerminalFlag } from "@/service/company.service";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { toast } from "@/hooks/use-toast";

const TerminalFlagManager = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const handleBack = useCallback(() => navigate(APP_PATHS.empresa), [navigate]);

  const { data: companies = [], isLoading, isError } = useQuery({
    queryKey: ["companies-terminal-flag"],
    queryFn: fetchCompanyList,
    staleTime: 30_000,
  });

  const { mutate: toggle, isPending } = useMutation({
    mutationFn: (cnpj: string) => toggleTerminalFlag(cnpj),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies-terminal-flag"] });
      toast({ title: "Terminal exclusivo atualizado." });
    },
    onError: (error) => {
      const err = normalizeServiceError(error);
      toast({ title: "Erro ao atualizar terminal", description: err.message, variant: "destructive" });
    },
  });

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
      mainClassName="pt-24 sm:pt-32 mobile-container pb-12 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 relative z-10 bg-[#F8FAFC] overflow-x-hidden"
    >
      <div className="mx-auto w-full max-w-[960px] space-y-6 lg:space-y-8">
        <div className="flex">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="h-10 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar à empresa
          </Button>
        </div>

        <Card className="relative overflow-hidden border-border/70 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.55)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(30,41,59,0.20),transparent_30%)]" />
          <div className="relative bg-[linear-gradient(135deg,#0B1220_0%,#1E293B_52%,#334155_100%)] px-6 py-7 text-white sm:px-8 sm:py-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl space-y-3">
                <Badge className="border-white/15 bg-white/10 text-white">
                  <MonitorSmartphone className="mr-1.5 h-3.5 w-3.5" />
                  Controle de terminal
                </Badge>
                <h1 className="text-3xl font-semibold leading-tight xl:text-4xl">
                  Terminal exclusivo
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/78 sm:text-base">
                  Quando ativado, colaboradores desta empresa não podem registrar ponto pelo aplicativo.
                  O registro passa a ser obrigatório no terminal físico.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 xl:justify-end">
                <Badge className="border-white/15 bg-white/10 px-3 py-1.5 text-white">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  {companies.length} empresa{companies.length !== 1 ? "s" : ""}
                </Badge>
                <Badge className="border-slate-300/30 bg-slate-400/10 text-slate-50">
                  Acesso restrito · CTO
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {isLoading && (
          <p className="text-center text-sm text-[#64748B]">Carregando empresas...</p>
        )}

        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 px-5 py-4 text-red-700">
              <WifiOff className="h-4 w-4 shrink-0" />
              <span className="text-sm">Erro ao carregar lista de empresas. Tente novamente.</span>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && companies.length === 0 && (
          <p className="text-center text-sm text-[#64748B]">Nenhuma empresa cadastrada.</p>
        )}

        <div className="space-y-3">
          {companies.map((company) => (
            <Card
              key={company.cnpj}
              className="border-border/70 shadow-sm"
            >
              <CardContent className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#0F172A]">{company.name}</p>
                  <p className="text-xs text-[#64748B]">{company.cnpj}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      className={
                        company.active
                          ? "border-green-200 bg-green-50 text-green-700 text-[10px]"
                          : "border-slate-200 bg-slate-50 text-slate-500 text-[10px]"
                      }
                    >
                      {company.active ? "Ativa" : "Inativa"}
                    </Badge>
                    {company.terminalFlag && (
                      <Badge className="border-[#1E293B]/20 bg-[#0F172A] text-white text-[10px]">
                        <MonitorSmartphone className="mr-1 h-3 w-3" />
                        Terminal ativo
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#64748B]">
                    {company.terminalFlag ? "Terminal exclusivo" : "App habilitado"}
                  </span>
                  <Switch
                    checked={company.terminalFlag ?? false}
                    disabled={isPending}
                    onCheckedChange={() => toggle(company.cnpj)}
                    aria-label={`Toggle terminal para ${company.name}`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default TerminalFlagManager;
