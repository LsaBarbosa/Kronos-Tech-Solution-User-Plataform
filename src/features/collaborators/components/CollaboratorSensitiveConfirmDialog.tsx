import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { CollaboratorMutationTarget } from "../types/collaborator-view.types";

type CollaboratorSensitiveConfirmDialogProps = {
  open: boolean;
  target: CollaboratorMutationTarget | null;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export const CollaboratorSensitiveConfirmDialog = ({
  open,
  target,
  isLoading,
  onOpenChange,
  onConfirm,
}: CollaboratorSensitiveConfirmDialogProps) => {
  if (!target) {
    return null;
  }

  const isActive = target.active;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar alteração de acesso</AlertDialogTitle>
          <AlertDialogDescription>
            Você tem certeza que deseja <strong>{isActive ? "desativar" : "reativar"}</strong> a conta de{" "}
            <strong>{target.fullName}</strong>?
            <span className="mt-2 block text-sm text-muted-foreground">
              Essa ação mantém rastreabilidade e afeta somente o vínculo de acesso do usuário.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={isActive ? "bg-[#DC2626] hover:bg-[#B91C1C]" : "bg-[#2563EB] hover:bg-[#1E3A8A]"}
          >
            {isActive ? "Desativar" : "Reativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
