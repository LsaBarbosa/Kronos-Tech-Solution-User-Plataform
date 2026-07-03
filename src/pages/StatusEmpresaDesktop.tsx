import { useState } from "react";
import { Building2, ChevronLeft, CheckCircle, PowerOff, Power } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface StatusEmpresaDesktopProps {
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
    companyName: string;
    cnpj: string;
    active: boolean;
    employeeCount: number;
    isPending: boolean;
    success: boolean;
    onConfirm: () => void;
}

const StatusEmpresaDesktop = ({
    sidebarOpen,
    onToggleSidebar,
    companyName,
    cnpj,
    active,
    employeeCount,
    isPending,
    success,
    onConfirm,
}: StatusEmpresaDesktopProps) => {
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = useState(false);

    const newStatus = !active;
    const actionLabel = active ? "Inativar empresa" : "Reativar empresa";
    const actionIcon = active ? PowerOff : Power;
    const ActionIcon = actionIcon;

    return (
        <PageShell
            sidebarOpen={sidebarOpen}
            toggleSidebar={onToggleSidebar}
            mainClassName="pt-24 sm:pt-32 mobile-container pb-12 px-4 sm:px-6 lg:px-8 space-y-6 relative z-10 bg-[#F8FAFC] overflow-x-hidden"
        >
            <div className="mx-auto w-full max-w-[960px] space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(APP_PATHS.empresaBuscar)}
                        className="h-10 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Voltar à lista
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-[#102A43]">Gerenciar Status da Empresa</h1>
                        <p className="text-muted-foreground text-sm">
                            Inative ou reative uma empresa e todos os seus colaboradores.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Building2 className="h-4 w-4" />
                                    Empresa selecionada
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Nome</p>
                                    <p className="font-semibold">{companyName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">CNPJ</p>
                                    <code className="text-sm">{cnpj}</code>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Status atual</p>
                                    <Badge variant={active ? "default" : "secondary"} className="mt-1">
                                        {active ? "Ativa" : "Inativa"}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Colaboradores</p>
                                    <Badge variant="outline">{employeeCount} registrado{employeeCount !== 1 ? "s" : ""}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        {success ? (
                            <Card className="border-green-200">
                                <CardHeader className="bg-green-50 rounded-t-lg">
                                    <CardTitle className="flex items-center gap-2 text-green-700">
                                        <CheckCircle className="h-5 w-5" />
                                        Status alterado com sucesso
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        A empresa <span className="font-semibold text-foreground">{companyName}</span> foi{" "}
                                        <span className="font-semibold">{newStatus ? "reativada" : "inativada"}</span>.{" "}
                                        {newStatus
                                            ? `${employeeCount} colaborador${employeeCount !== 1 ? "es recuperaram" : " recuperou"} acesso ao sistema.`
                                            : `${employeeCount} colaborador${employeeCount !== 1 ? "es perderão" : " perderá"} acesso na próxima requisição.`}
                                    </p>
                                    <Button onClick={() => navigate(APP_PATHS.empresaBuscar)} className="w-full">
                                        Voltar à lista de empresas
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className={active ? "border-amber-200" : "border-emerald-200"}>
                                <CardHeader className={`rounded-t-lg ${active ? "bg-amber-50" : "bg-emerald-50"}`}>
                                    <CardTitle className={`flex items-center gap-2 text-base ${active ? "text-amber-700" : "text-emerald-700"}`}>
                                        <ActionIcon className="h-5 w-5" />
                                        {actionLabel}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        {active ? (
                                            <>
                                                <p>Ao inativar esta empresa:</p>
                                                <ul className="list-disc list-inside space-y-1 text-sm">
                                                    <li><span className="font-medium text-foreground">{employeeCount} colaborador{employeeCount !== 1 ? "es" : ""}</span> perderão acesso ao sistema</li>
                                                    <li>Nenhum dado será apagado — tudo permanece no banco</li>
                                                    <li>O acesso é bloqueado na próxima requisição de cada colaborador</li>
                                                    <li>A operação pode ser revertida a qualquer momento</li>
                                                </ul>
                                            </>
                                        ) : (
                                            <>
                                                <p>Ao reativar esta empresa:</p>
                                                <ul className="list-disc list-inside space-y-1 text-sm">
                                                    <li><span className="font-medium text-foreground">{employeeCount} colaborador{employeeCount !== 1 ? "es" : ""}</span> recuperarão acesso ao sistema</li>
                                                    <li>Todos os dados permanecem intactos</li>
                                                    <li>O acesso é restaurado imediatamente</li>
                                                </ul>
                                            </>
                                        )}
                                    </div>

                                    <Button
                                        variant={active ? "destructive" : "default"}
                                        className={!active ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                                        onClick={() => setDialogOpen(true)}
                                        disabled={isPending}
                                    >
                                        <ActionIcon className="h-4 w-4 mr-2" />
                                        {isPending ? "Processando..." : actionLabel}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{actionLabel}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {active
                                ? `${employeeCount} colaborador${employeeCount !== 1 ? "es" : ""} perderão acesso ao sistema na próxima requisição. A empresa poderá ser reativada a qualquer momento.`
                                : `${employeeCount} colaborador${employeeCount !== 1 ? "es" : ""} recuperarão acesso ao sistema. Confirmar reativação?`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => { setDialogOpen(false); onConfirm(); }}
                            className={active ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                        >
                            {active ? "Inativar" : "Reativar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageShell>
    );
};

export default StatusEmpresaDesktop;
