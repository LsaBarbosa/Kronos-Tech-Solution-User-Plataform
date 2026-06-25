import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  FlaskConical,
  Loader2,
  Play,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import { FaqContextualBlock } from "@/components/faq/FaqContextualBlock";
import { FAQ_SCREEN_KEYS } from "@/constants/faqScreenKeys";
import { useToast } from "@/hooks/use-toast";
import {
  useDemoCreate,
  useDemoDelete,
  useDemoStatus,
  useDemoValidate,
} from "@/hooks/useDemoSandbox";
import type { DemoOperationCounters, DemoValidationResult } from "@/types/demo";

const CounterRow = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => (
  <div className="flex items-center justify-between py-1 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold tabular-nums">{value}</span>
  </div>
);

const CountersCard = ({
  title,
  counters,
}: {
  title: string;
  counters: DemoOperationCounters;
}) => (
  <Card className="border-border/70">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="divide-y divide-border/60">
      <CounterRow label="Empresas" value={counters.companies} />
      <CounterRow label="Usuários" value={counters.users} />
      <CounterRow label="Funcionários" value={counters.employees} />
      <CounterRow label="Registros de ponto" value={counters.pointRecords} />
      <CounterRow label="Documentos" value={counters.documents} />
      <CounterRow label="Solicitações" value={counters.requests} />
      <CounterRow label="Arquivos físicos" value={counters.files} />
      <CounterRow label="Sessões invalidadas" value={counters.sessions} />
    </CardContent>
  </Card>
);

const ValidationCard = ({ result }: { result: DemoValidationResult }) => (
  <Card
    className={
      result.clean
        ? "border-green-200 bg-green-50/50"
        : "border-amber-200 bg-amber-50/50"
    }
  >
    <CardHeader className="pb-2">
      <div className="flex items-center gap-2">
        {result.clean ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        )}
        <CardTitle className="text-sm font-semibold">
          {result.clean ? "Validação: sem resíduos" : "Validação: resíduos detectados"}
        </CardTitle>
      </div>
    </CardHeader>
    {result.issues.length > 0 && (
      <CardContent className="space-y-1">
        {result.issues.map((issue, idx) => (
          <div key={idx} className="flex gap-2 text-sm text-amber-800">
            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              <span className="font-medium">[{issue.type}]</span> {issue.description}
            </span>
          </div>
        ))}
      </CardContent>
    )}
  </Card>
);

const CTODemoSandbox = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: status, isLoading: isStatusLoading } = useDemoStatus();
  const createMutation = useDemoCreate();
  const deleteMutation = useDemoDelete();
  const validateMutation = useDemoValidate();

  const isBusy =
    createMutation.isPending ||
    deleteMutation.isPending ||
    validateMutation.isPending;

  const handleCreate = useCallback(async () => {
    try {
      const result = await createMutation.mutateAsync();
      toast({
        title: "Demo criada com sucesso",
        description: `Empresa: ${result.companyName} · Usuário: ${result.username}`,
      });
    } catch {
      toast({
        title: "Erro ao criar demo",
        description: "Verifique o kill switch ou tente novamente.",
        variant: "destructive",
      });
    }
  }, [createMutation, toast]);

  const handleDelete = useCallback(async () => {
    setShowDeleteDialog(false);
    try {
      const result = await deleteMutation.mutateAsync();
      toast({
        title: result.validation.clean ? "Demo removida com sucesso" : "Demo removida com avisos",
        description: result.validation.clean
          ? "Todos os dados foram apagados sem resíduos."
          : "Alguns resíduos foram detectados — verifique a validação.",
        variant: result.validation.clean ? "default" : "destructive",
      });
    } catch {
      toast({
        title: "Erro ao remover demo",
        description: "Tente novamente ou verifique o kill switch.",
        variant: "destructive",
      });
    }
  }, [deleteMutation, toast]);

  const handleValidate = useCallback(async () => {
    try {
      const result = await validateMutation.mutateAsync();
      toast({
        title: result.clean ? "Validação: sem resíduos" : "Validação: resíduos detectados",
        description: result.clean
          ? "O ambiente está limpo."
          : `${result.issues.length} problema(s) encontrado(s).`,
        variant: result.clean ? "default" : "destructive",
      });
    } catch {
      toast({
        title: "Erro ao validar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  }, [validateMutation, toast]);

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={() => setSidebarOpen((p) => !p)}
      mainClassName="pt-24 sm:pt-32 mobile-container pb-12 px-4 sm:px-6 lg:px-8 space-y-6 bg-[#F8FAFC] overflow-x-hidden"
    >
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(APP_PATHS.administracao)}
          className="h-10 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>

        <Card className="relative overflow-hidden border-border/70 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.55)]">
          <div className="relative bg-[linear-gradient(135deg,#451A03_0%,#78350F_52%,#D97706_100%)] px-6 py-7 text-white sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <FlaskConical className="h-8 w-8 shrink-0 text-amber-200" />
                <div>
                  <h1 className="text-2xl font-semibold">Demo Sandbox CTO</h1>
                  <p className="text-sm text-amber-100/80">
                    Ambiente controlado de demonstração — sem impacto em produção
                  </p>
                </div>
              </div>
              {!isStatusLoading && status && (
                <div className="flex flex-wrap gap-2">
                  <Badge className="border-white/20 bg-white/10 text-white">
                    {status.enabled ? "Habilitado" : "Desabilitado"}
                  </Badge>
                  {status.killSwitch && (
                    <Badge className="border-red-300/30 bg-red-500/20 text-red-100">
                      Kill switch ativo
                    </Badge>
                  )}
                  <Badge
                    className={
                      status.exists
                        ? "border-green-300/30 bg-green-500/20 text-green-100"
                        : "border-white/20 bg-white/10 text-white"
                    }
                  >
                    {status.exists ? "Sandbox existe" : "Sem sandbox"}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Card>

        {status?.killSwitch && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 py-4">
              <XCircle className="h-5 w-5 shrink-0 text-red-600" />
              <p className="text-sm font-semibold text-red-800">
                Kill switch ativo — operações de criação e deleção estão bloqueadas.
              </p>
            </CardContent>
          </Card>
        )}

        {!status?.enabled && !isStatusLoading && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700" />
              <p className="text-sm font-semibold text-amber-800">
                Demo sandbox está desabilitado nas configurações do servidor.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Button
            size="lg"
            className="gap-2 bg-green-700 hover:bg-green-800 text-white"
            onClick={() => void handleCreate()}
            disabled={isBusy || status?.killSwitch || !status?.enabled}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            CRIAR DEMO
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
            onClick={() => void handleValidate()}
            disabled={isBusy}
          >
            {validateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            VALIDAR
          </Button>

          <Button
            size="lg"
            variant="destructive"
            className="gap-2"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isBusy || status?.killSwitch || !status?.exists}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            DELETAR DEMO
          </Button>
        </div>

        {status && (
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-base">Configuração atual</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Empresa</p>
                <p className="font-semibold">{status.companyName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Usuário</p>
                <p className="font-semibold">{status.username}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Chave</p>
                <p className="font-mono font-semibold">{status.sandboxKey}</p>
              </div>
              {status.lastOperation && (
                <div className="sm:col-span-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Última operação
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{status.lastOperation.operation}</Badge>
                    <Badge variant="outline">{status.lastOperation.status}</Badge>
                    {status.lastOperation.finishedAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(status.lastOperation.finishedAt).toLocaleString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {createMutation.data && (
          <div className="space-y-3">
            <CountersCard title="Dados criados" counters={createMutation.data.created} />
            <ValidationCard result={createMutation.data.validation} />
          </div>
        )}

        {deleteMutation.data && (
          <div className="space-y-3">
            <CountersCard title="Dados removidos" counters={deleteMutation.data.removed} />
            <ValidationCard result={deleteMutation.data.validation} />
          </div>
        )}

        {validateMutation.data && (
          <ValidationCard result={validateMutation.data} />
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="h-5 w-5" />
              Confirmar deleção do sandbox
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá <strong>todos os dados da empresa demo</strong>, incluindo
              usuários, funcionários, registros de ponto, documentos, solicitações e arquivos
              físicos no servidor. A operação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => void handleDelete()}
            >
              Sim, deletar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <FaqContextualBlock screenKey={FAQ_SCREEN_KEYS.DASHBOARD} className="mt-6" />
    </PageShell>
  );
};

export default CTODemoSandbox;
