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

interface StatusEmpresaMobileProps {
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

const StatusEmpresaMobile = ({
    sidebarOpen,
    onToggleSidebar,
    companyName,
    cnpj,
    active,
    employeeCount,
    isPending,
    success,
    onConfirm,
}: StatusEmpresaMobileProps) => {
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = useState(false);

    const newStatus = !active;
    const actionLabel = active ? "Inativar empresa" : "Reativar empresa";
    const ActionIcon = active ? PowerOff : Power;

    return (
        <PageShell
            sidebarOpen={sidebarOpen}
            toggleSidebar={onToggleSidebar}
            mainClassName="pt-20 pb-28 px-4 space-y-4 relative z-10 bg-[#F8FAFC] overflow-x-hidden"
        >
            <div className="space-y-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(APP_PATHS.empresaBuscar)}
                    className="h-9 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Voltar
                </Button>

                <div>
                    <h1 className="text-xl font-bold text-[#102A43] leading-tight">
                        Gerenciar Status
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Inative ou reative a empresa e seus colaboradores.
                    </p>
                </div>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4" />
                            Empresa selecionada
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        <p className="font-semibold text-sm">{companyName}</p>
                        <code className="text-xs text-muted-foreground block">{cnpj}</code>
                        <div className="flex gap-2 flex-wrap">
                            <Badge variant={active ? "default" : "secondary"} className="text-xs">
                                {active ? "Ativa" : "Inativa"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {employeeCount} colaborador{employeeCount !== 1 ? "es" : ""}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {success ? (
                    <Card className="border-green-200">
                        <CardHeader className="bg-green-50 rounded-t-lg pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm text-green-700">
                                <CheckCircle className="h-4 w-4" />
                                Status alterado com sucesso
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Empresa {newStatus ? "reativada" : "inativada"}.{" "}
                                {newStatus
                                    ? `${employeeCount} colaborador${employeeCount !== 1 ? "es recuperaram" : " recuperou"} acesso.`
                                    : `Acesso bloqueado na próxima requisição.`}
                            </p>
                            <Button size="sm" onClick={() => navigate(APP_PATHS.empresaBuscar)} className="w-full">
                                Voltar à lista
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className={active ? "border-amber-200" : "border-emerald-200"}>
                        <CardHeader className={`pb-2 rounded-t-lg ${active ? "bg-amber-50" : "bg-emerald-50"}`}>
                            <CardTitle className={`flex items-center gap-2 text-sm ${active ? "text-amber-700" : "text-emerald-700"}`}>
                                <ActionIcon className="h-4 w-4" />
                                {actionLabel}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3 space-y-3">
                            <p className="text-xs text-muted-foreground">
                                {active
                                    ? `${employeeCount} colaborador${employeeCount !== 1 ? "es" : ""} perderão acesso na próxima requisição. Nenhum dado é apagado.`
                                    : `${employeeCount} colaborador${employeeCount !== 1 ? "es" : ""} recuperarão acesso imediatamente.`}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Botão fixado no rodapé — padrão mobile */}
            {!success && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D8E2EC] p-4 z-50">
                    <Button
                        variant={active ? "destructive" : "default"}
                        className={`w-full ${!active ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                        onClick={() => setDialogOpen(true)}
                        disabled={isPending}
                    >
                        <ActionIcon className="h-4 w-4 mr-2" />
                        {isPending ? "Processando..." : actionLabel}
                    </Button>
                </div>
            )}

            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent className="mx-4">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{actionLabel}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {active
                                ? `${employeeCount} colaborador${employeeCount !== 1 ? "es" : ""} perderão acesso na próxima requisição. A empresa pode ser reativada depois.`
                                : `${employeeCount} colaborador${employeeCount !== 1 ? "es" : ""} recuperarão acesso. Confirmar?`}
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

export default StatusEmpresaMobile;
