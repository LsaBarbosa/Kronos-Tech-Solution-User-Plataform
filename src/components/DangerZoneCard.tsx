import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DangerZoneCardProps {
    companyName: string;
    cnpj: string;
    employeeCount: number;
    onConfirm: () => void;
    isPending: boolean;
}

const DangerZoneCard = ({ companyName, cnpj, employeeCount, onConfirm, isPending }: DangerZoneCardProps) => {
    const [confirmText, setConfirmText] = useState("");
    const isMatch = confirmText === companyName;

    return (
        <Card className="border-destructive border-2">
            <CardHeader className="bg-destructive/5 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Zona de Perigo — Exclusão Permanente
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-destructive">
                        Esta operação é irreversível. Os seguintes dados serão excluídos permanentemente:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Empresa: <span className="font-medium text-foreground">{companyName}</span> (CNPJ: {cnpj})</li>
                        <li>{employeeCount} colaborador{employeeCount !== 1 ? "es" : ""} e seus registros</li>
                        <li>Registros de ponto, documentos, férias e abonos</li>
                        <li>Dados biométricos no AWS Rekognition e imagens no S3</li>
                        <li>Solicitações LGPD, consentimentos e histórico de auditoria</li>
                        <li>Avisos, usuários e acessos multiempresa</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirm-name" className="text-sm font-medium">
                        Para confirmar, digite o nome exato da empresa:
                        <span className="ml-1 font-semibold text-foreground">{companyName}</span>
                    </Label>
                    <Input
                        id="confirm-name"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Nome da empresa"
                        disabled={isPending}
                        autoComplete="off"
                        data-1p-ignore
                    />
                </div>

                <Button
                    variant="destructive"
                    className="w-full"
                    disabled={!isMatch || isPending}
                    onClick={onConfirm}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Excluindo empresa...
                        </>
                    ) : (
                        <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Permanentemente
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};

export default DangerZoneCard;
