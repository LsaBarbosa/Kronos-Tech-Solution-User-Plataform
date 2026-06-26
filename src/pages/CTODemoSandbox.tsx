import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  FlaskConical,
  Loader2,
  Plus,
  RotateCcw,
  Shield,
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

const CTODemoSandbox = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: status, isLoading: isStatusLoading, isError: isStatusError, refetch } = useDemoStatus();
  const createMutation = useDemoCreate();
  const deleteMutation = useDemoDelete();
  const validateMutation = useDemoValidate();

  const isBusy =
    createMutation.isPending ||
    deleteMutation.isPending ||
    validateMutation.isPending;

  const handleCreate = useCallback(async () => {
    setShowCreateDialog(false);
    try {
      const result = await createMutation.mutateAsync();
      toast({
        title: "Demo criada com sucesso",
        description: `Empresa "${result.companyName}" e usuário "${result.username}" prontos.`,
      });
    } catch {
      toast({
        title: "Erro ao criar demo",
        description: "Tente novamente ou verifique o kill switch.",
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
          ? "Todos os dados foram apagados."
          : `${result.validation.issues.length} resíduo(s) detectado(s) — verifique abaixo.`,
        variant: result.validation.clean ? "default" : "destructive",
      });
    } catch {
      toast({
        title: "Erro ao remover demo",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  }, [deleteMutation, toast]);

  const handleValidate = useCallback(async () => {
    try {
      const result = await validateMutation.mutateAsync();
      toast({
        title: result.clean ? "Sem resíduos" : "Resíduos detectados",
        description: result.clean
          ? "O ambiente está limpo."
          : `${result.issues.length} problema(s) encontrado(s).`,
        variant: result.clean ? "default" : "destructive",
      });
    } catch {
      toast({ title: "Erro na validação", description: "Tente novamente.", variant: "destructive" });
    }
  }, [validateMutation, toast]);

  const sandboxBlocked = status?.killSwitch === true;
  const sandboxDisabled = !isStatusLoading && !isStatusError && status?.enabled === false;
  const sandboxExists = status?.exists === true;
  const canCreate = !isBusy && !isStatusLoading && !sandboxBlocked && status?.enabled === true && !sandboxExists;
  const canDelete = !isBusy && !isStatusLoading && !sandboxBlocked && sandboxExists;

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={() => setSidebarOpen((p) => !p)}
      mainClassName="pt-24 sm:pt-32 mobile-container pb-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] overflow-x-hidden relative z-10"
    >
      <div className="mx-auto w-full max-w-3xl space-y-6">

        {/* Voltar */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(APP_PATHS.empresa)}
          className="h-10 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>

        {/* Header */}
        <Card className="overflow-hidden border-border/70 shadow-md">
          <div className="bg-[linear-gradient(135deg,#451A03_0%,#78350F_52%,#D97706_100%)] px-6 py-6 text-white sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <FlaskConical className="h-8 w-8 shrink-0 text-amber-200" />
                <div>
                  <h1 className="text-xl font-semibold sm:text-2xl">Demo Sandbox CTO</h1>
                  <p className="text-sm text-amber-100/80">
                    Ambiente controlado · sem impacto em produção
                  </p>
                </div>
              </div>
              {!isStatusLoading && status && (
                <div className="flex flex-wrap gap-2">
                  <Badge className={status.enabled ? "border-green-300/30 bg-green-500/20 text-green-100" : "border-white/20 bg-white/10 text-white"}>
                    {status.enabled ? "Habilitado" : "Desabilitado"}
                  </Badge>
                  {status.killSwitch && (
                    <Badge className="border-red-300/30 bg-red-500/20 text-red-100">
                      Kill switch ativo
                    </Badge>
                  )}
                  <Badge className={status.exists ? "border-amber-300/30 bg-amber-500/20 text-amber-100" : "border-white/20 bg-white/10 text-white"}>
                    {status.exists ? "Sandbox ativa" : "Sem sandbox"}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Bloqueios */}
        {sandboxBlocked && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 py-4">
              <Shield className="h-5 w-5 shrink-0 text-red-600" />
              <p className="text-sm font-semibold text-red-800">
                Kill switch ativo — todas as operações de criação e deleção estão bloqueadas.
              </p>
            </CardContent>
          </Card>
        )}

        {sandboxDisabled && !sandboxBlocked && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700" />
              <p className="text-sm font-semibold text-amber-800">
                Demo sandbox está desabilitado nas configurações do servidor.
              </p>
            </CardContent>
          </Card>
        )}

        {isStatusError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center justify-between gap-3 py-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                <p className="text-sm font-semibold text-red-800">
                  Não foi possível carregar o status da sandbox.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => void refetch()}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading inicial */}
        {isStatusLoading && (
          <Card className="border-border/70">
            <CardContent className="flex items-center justify-center gap-3 py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Carregando status da sandbox…</span>
            </CardContent>
          </Card>
        )}

        {/* Estado: loading de operação */}
        {isBusy && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="flex items-center gap-3 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-amber-700" />
              <p className="text-sm font-semibold text-amber-800">
                {createMutation.isPending && "Criando ambiente de demo… isso pode levar alguns segundos."}
                {deleteMutation.isPending && "Removendo ambiente de demo… aguarde."}
                {validateMutation.isPending && "Validando ambiente…"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Estado: sandbox não existe → ação principal CRIAR */}
        {!isStatusLoading && !isStatusError && status && !sandboxExists && !isBusy && (
          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#0F172A]">Nenhuma sandbox ativa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[#64748B] leading-6">
                Crie o ambiente de demonstração com empresa, usuário e dados sintéticos pré-carregados.
                A operação é idempotente — se houver resíduos de uma execução anterior, serão removidos
                antes da criação.
              </p>
              <div className="rounded-lg border border-border/60 bg-[#F8FAFC] px-4 py-3 text-sm space-y-1">
                <p className="font-medium text-[#0F172A]">O que será criado:</p>
                <ul className="list-disc list-inside text-[#64748B] space-y-0.5">
                  <li>Empresa: <strong>Kronos Teste</strong></li>
                  <li>Usuário: <strong>kronos_teste</strong> (MANAGER)</li>
                  <li>Funcionário, registros de ponto, documentos e solicitações sintéticas</li>
                </ul>
              </div>
              <Button
                size="lg"
                className="w-full gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold"
                disabled={!canCreate}
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-5 w-5" />
                CRIAR DEMO
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Estado: sandbox existe → mostrar info + ações */}
        {!isStatusLoading && !isStatusError && status && sandboxExists && !isBusy && (
          <Card className="border-green-200 bg-green-50/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-base text-green-900">Sandbox ativa</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Empresa</p>
                  <p className="font-semibold text-[#0F172A]">{status.companyName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Usuário</p>
                  <p className="font-semibold text-[#0F172A]">{status.username}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Chave</p>
                  <p className="font-mono font-semibold text-[#0F172A]">{status.sandboxKey}</p>
                </div>
                {status.lastOperation && (
                  <div className="sm:col-span-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Última operação</p>
                    <div className="flex items-center gap-2 flex-wrap">
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
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  size="lg"
                  variant="destructive"
                  className="flex-1 gap-2"
                  disabled={!canDelete}
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  DELETAR DEMO
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 gap-2 border-slate-300"
                  disabled={isBusy}
                  onClick={() => void handleValidate()}
                >
                  {validateMutation.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <RotateCcw className="h-4 w-4" />
                  }
                  VALIDAR
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultado de validação */}
        {validateMutation.data && !isBusy && (
          <Card className={validateMutation.data.clean ? "border-green-200 bg-green-50/50" : "border-amber-200 bg-amber-50/50"}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {validateMutation.data.clean
                  ? <CheckCircle className="h-4 w-4 text-green-600" />
                  : <AlertTriangle className="h-4 w-4 text-amber-600" />
                }
                <CardTitle className="text-sm font-semibold">
                  {validateMutation.data.clean ? "Validação: sem resíduos" : "Validação: resíduos detectados"}
                </CardTitle>
              </div>
            </CardHeader>
            {validateMutation.data.issues.length > 0 && (
              <CardContent className="space-y-1">
                {validateMutation.data.issues.map((issue, idx) => (
                  <div key={idx} className="flex gap-2 text-sm text-amber-800">
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span><span className="font-medium">[{issue.type}]</span> {issue.description}</span>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        )}

        {/* Resultado de criação */}
        {createMutation.data && !isBusy && (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <CardTitle className="text-sm font-semibold">Demo criada com sucesso</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-green-800 space-y-1">
              <p>Empresa: <strong>{createMutation.data.companyName}</strong></p>
              <p>Usuário: <strong>{createMutation.data.username}</strong></p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
                <span>Empresas criadas: {createMutation.data.created.companies}</span>
                <span>Usuários: {createMutation.data.created.users}</span>
                <span>Funcionários: {createMutation.data.created.employees}</span>
                <span>Registros de ponto: {createMutation.data.created.pointRecords}</span>
                <span>Documentos: {createMutation.data.created.documents}</span>
                <span>Solicitações: {createMutation.data.created.requests}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultado de deleção */}
        {deleteMutation.data && !isBusy && (
          <Card className={deleteMutation.data.validation.clean ? "border-green-200 bg-green-50/50" : "border-amber-200 bg-amber-50/50"}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {deleteMutation.data.validation.clean
                  ? <CheckCircle className="h-4 w-4 text-green-600" />
                  : <AlertTriangle className="h-4 w-4 text-amber-600" />
                }
                <CardTitle className="text-sm font-semibold">
                  {deleteMutation.data.validation.clean ? "Demo removida com sucesso" : "Demo removida com avisos"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span>Empresas removidas: {deleteMutation.data.removed.companies}</span>
                <span>Usuários: {deleteMutation.data.removed.users}</span>
                <span>Funcionários: {deleteMutation.data.removed.employees}</span>
                <span>Registros de ponto: {deleteMutation.data.removed.pointRecords}</span>
                <span>Documentos: {deleteMutation.data.removed.documents}</span>
                <span>Sessões invalidadas: {deleteMutation.data.removed.sessions}</span>
              </div>
              {deleteMutation.data.validation.issues.map((issue, idx) => (
                <div key={idx} className="flex gap-2 text-xs text-amber-800">
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span><span className="font-medium">[{issue.type}]</span> {issue.description}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmação de criação */}
      <AlertDialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-amber-600" />
              Criar ambiente de demo?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Será criada a empresa <strong>Kronos Teste</strong> com o usuário <strong>kronos_teste</strong> e dados sintéticos.
              Se já existir um ambiente anterior, ele será limpo automaticamente antes da criação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-700 hover:bg-green-800 text-white"
              onClick={() => void handleCreate()}
            >
              Sim, criar demo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação de deleção */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="h-5 w-5" />
              Confirmar deleção do sandbox
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá <strong>todos os dados da empresa demo</strong> — usuários, funcionários,
              registros, documentos, solicitações e arquivos físicos. A operação é irreversível.
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
