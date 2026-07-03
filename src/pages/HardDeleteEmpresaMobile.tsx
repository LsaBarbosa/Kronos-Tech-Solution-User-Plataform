import { CheckCircle, ChevronLeft, AlertTriangle, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageShell from "@/components/PageShell";
import DangerZoneCard from "@/components/DangerZoneCard";
import { APP_PATHS } from "@/config/app-routes";
import type { CompanyHardDeleteResultDTO } from "@/types/company";

interface HardDeleteEmpresaMobileProps {
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
    companyName: string;
    cnpj: string;
    employeeCount: number;
    isPending: boolean;
    result: CompanyHardDeleteResultDTO | undefined;
    onConfirm: () => void;
}

const HardDeleteEmpresaMobile = ({
    sidebarOpen,
    onToggleSidebar,
    companyName,
    cnpj,
    employeeCount,
    isPending,
    result,
    onConfirm,
}: HardDeleteEmpresaMobileProps) => {
    const navigate = useNavigate();

    return (
        <PageShell
            sidebarOpen={sidebarOpen}
            toggleSidebar={onToggleSidebar}
            mainClassName="pt-20 pb-12 px-4 space-y-4 relative z-10 bg-[#F8FAFC] overflow-x-hidden"
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
                    <h1 className="text-xl font-bold text-destructive leading-tight">
                        Excluir Empresa Permanentemente
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Esta ação não pode ser desfeita.</p>
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
                        <Badge variant="secondary" className="text-xs">
                            {employeeCount} colaborador{employeeCount !== 1 ? "es" : ""}
                        </Badge>
                    </CardContent>
                </Card>

                {result ? (
                    <Card className="border-green-200">
                        <CardHeader className="bg-green-50 rounded-t-lg pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm text-green-700">
                                <CheckCircle className="h-4 w-4" />
                                Empresa excluída
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <p className="text-sm">
                                <span className="text-muted-foreground">Colaboradores removidos: </span>
                                <span className="font-semibold">{result.employeesDeleted}</span>
                            </p>

                            {result.externalCleanupFailures > 0 && (
                                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-1">
                                    <p className="text-xs font-medium text-amber-700 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {result.externalCleanupFailures} falha{result.externalCleanupFailures !== 1 ? "s" : ""} em sistemas externos
                                    </p>
                                    <ul className="text-xs text-amber-600 space-y-0.5 list-disc list-inside">
                                        {result.externalFailureDetails.map((detail, i) => (
                                            <li key={i}>{detail}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <Button
                                size="sm"
                                onClick={() => navigate(APP_PATHS.empresaBuscar)}
                                className="w-full"
                            >
                                Voltar à lista
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
        </PageShell>
    );
};

export default HardDeleteEmpresaMobile;
