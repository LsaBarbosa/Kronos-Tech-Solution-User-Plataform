import React, { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ExportConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

const ExportConfirmationModal = ({
  open,
  onOpenChange,
  onConfirm,
}: ExportConfirmationModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Confirmar Exportação de Dados
          </DialogTitle>
          <DialogDescription>
            Você está prestes a exportar seus dados pessoais
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* What's Included */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900 mb-2">
              O arquivo incluirá todos os seus dados armazenados:
            </p>
            <ul className="text-xs text-slate-700 space-y-1 ml-4 list-disc">
              <li>Informações pessoais (CPF, RG, endereço)</li>
              <li>Dados de contrato e folha de pagamento</li>
              <li>Registro de ponto e geolocalização</li>
              <li>Documentos e anexos enviados</li>
              <li>Mensagens e comunicações internas</li>
              <li>Histórico de atividades e logs</li>
              <li>Dados de consentimento e preferências</li>
            </ul>
          </div>

          {/* Sensitive Data Warning */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900 mb-2">
              ⚠️ Dados sensíveis inclusos
            </p>
            <p className="text-xs text-amber-800">
              Este arquivo pode conter informações sensíveis como biometria, dados de saúde em documentos, ou coordenadas geográficas precisas. Trate-o com cuidado.
            </p>
          </div>

          {/* Security Instructions */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              🔒 Como armazenar com segurança
            </p>
            <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
              <li>Salve em local seguro no seu computador</li>
              <li>Proteja com uma senha se possível</li>
              <li>Não compartilhe o arquivo com terceiros</li>
              <li>Considere armazená-lo em mídia criptografada</li>
            </ul>
          </div>

          {/* Download and Audit Info */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-700">
              <strong>📥 Download:</strong> O arquivo será baixado diretamente no navegador.
            </p>
            <p className="text-xs text-slate-700 mt-2">
              <strong>📋 Auditoria:</strong> Esta exportação será registrada nos logs de auditoria para conformidade com LGPD.
            </p>
          </div>

          {/* Confirmation Prompt */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Entendo os riscos e desejo continuar com a exportação.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              "Confirmar Exportação"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportConfirmationModal;
