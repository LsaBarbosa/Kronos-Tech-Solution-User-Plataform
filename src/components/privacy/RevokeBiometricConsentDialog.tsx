import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RevokeBiometricConsentDialogProps {
  open: boolean;
  isSubmitting: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
}

const RevokeBiometricConsentDialog = ({
  open,
  isSubmitting,
  onConfirm,
  onOpenChange,
}: RevokeBiometricConsentDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <DialogTitle>Revogar consentimento biometrico</DialogTitle>
            <DialogDescription>
              Essa acao desativa o uso da biometria facial na sua conta.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-3 text-sm text-muted-foreground">
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-foreground">
          Ao confirmar, sua imagem facial e os templates biometricos usados para reconhecimento
          serao removidos dos provedores configurados.
        </div>
        <div className="flex items-start gap-2 rounded-md border bg-muted/40 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" aria-hidden="true" />
          <div className="space-y-1">
            <p>O login facial e validacoes biometricas deixarao de funcionar.</p>
            <p>
              Seu historico de aceite podera ser preservado como evidencia legal conforme politica
              de retencao.
            </p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="button" variant="destructive" onClick={() => void onConfirm()} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Confirmar revogacao
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default RevokeBiometricConsentDialog;
