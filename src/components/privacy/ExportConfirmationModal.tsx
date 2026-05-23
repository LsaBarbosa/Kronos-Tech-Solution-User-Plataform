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
          {/* Warning Box */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900 mb-3">
              O arquivo pode conter informações sensíveis:
            </p>
            <ul className="text-xs text-amber-800 space-y-1 ml-4 list-disc">
              <li>CPF, PIS, RG</li>
              <li>Endereço residencial completo</li>
              <li>Informações de salário e benefícios</li>
              <li>Documentos e anexos enviados</li>
              <li>Histórico completo de ponto</li>
              <li>Geolocalização com coordenadas precisas</li>
              <li>Mensagens internas</li>
              <li>Logs de atividades</li>
              <li>Registros de consentimentos</li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs text-blue-900">
              <strong>Segurança:</strong> Guarde este arquivo em local seguro e não compartilhe com terceiros. O arquivo contém informações que identificam você pessoalmente.
            </p>
          </div>

          {/* Confirmation Prompt */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              Deseja continuar com a exportação?
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
