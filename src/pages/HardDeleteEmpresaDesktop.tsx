import { CheckCircle, ChevronLeft, AlertTriangle, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageShell from "@/components/PageShell";
import DangerZoneCard from "@/components/DangerZoneCard";
import { APP_PATHS } from "@/config/app-routes";
import type { CompanyHardDeleteResultDTO } from "@/types/company";

interface HardDeleteEmpresaDesktopProps {
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
    companyName: string;
    cnpj: string;
    employeeCount: number;
    isPending: boolean;
    result: CompanyHardDeleteResultDTO | undefined;
    onConfirm: () => void;
}

const HardDeleteEmpresaDesktop = ({
    sidebarOpen,
    onToggleSidebar,
    companyName,
    cnpj,
    employeeCount,
    isPending,
    result,
    onConfirm,
}: HardDeleteEmpresaDesktopProps) => {
    const navigate = useNavigate();

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
                        <h1 className="text-2xl font-bold text-destructive">Excluir Empresa Permanentemente</h1>
                        <p className="text-muted-foreground text-sm">Esta ação não pode ser desfeita.</p>
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
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Colaboradores</p>
                                    <Badge variant="secondary">{employeeCount} registrado{employeeCount !== 1 ? "s" : ""}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        {result ? (
                            <Card className="border-green-200">
                                <CardHeader className="bg-green-50 rounded-t-lg">
                                    <CardTitle className="flex items-center gap-2 text-green-700">
                                        <CheckCircle className="h-5 w-5" />
                                        Empresa excluída com sucesso
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Empresa</p>
                                            <p className="font-medium">{result.companyName}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Colaboradores removidos</p>
                                            <p className="font-semibold text-lg">{result.employeesDeleted}</p>
                                        </div>
                                    </div>

                                    {result.externalCleanupFailures > 0 && (
                                        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 space-y-2">
                                            <p className="text-sm font-medium text-amber-700 flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                {result.externalCleanupFailures} falha{result.externalCleanupFailures !== 1 ? "s" : ""} em sistemas externos
                                            </p>
                                            <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside">
                                                {result.externalFailureDetails.map((detail, i) => (
                                                    <li key={i}>{detail}</li>
                                                ))}
                                            </ul>
                                            <p className="text-xs text-amber-600">
                                                Os dados do banco foram removidos. Verifique manualmente os sistemas externos listados.
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => navigate(APP_PATHS.empresaBuscar)}
                                        className="w-full"
                                    >
                                        Voltar à lista de empresas
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <DangerZoneCard
                                companyName={companyName}
                                cnpj={cnpj}
                                employeeCount={employeeCount}
                                onConfirm={onConfirm}
                                isPending={isPending}
                            />
                        )}
                    </div>
                </div>
            </div>
        </PageShell>
    );
};

export default HardDeleteEmpresaDesktop;
