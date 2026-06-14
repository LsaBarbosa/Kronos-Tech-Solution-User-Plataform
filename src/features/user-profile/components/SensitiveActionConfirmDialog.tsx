import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SensitiveActionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  warning?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isSubmitting: boolean;
  onConfirm: () => void | Promise<void>;
}

const SensitiveActionConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  warning,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isSubmitting,
  onConfirm,
}: SensitiveActionConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-foreground">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" aria-hidden="true" />
              <div className="space-y-1">
                <p className="font-medium text-destructive">Ação sensível</p>
                <p>{warning ?? "Confirme com atenção antes de continuar."}</p>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button type="button" variant="outline" className="h-11" disabled={isSubmitting}>
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="h-11"
            onClick={() => void onConfirm()}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SensitiveActionConfirmDialog;
