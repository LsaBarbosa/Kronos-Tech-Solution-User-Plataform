import { useState, useCallback } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { preloadCsrfToken } from "@/service/csrf.service";
import { checkUsernameAvailability, createUser } from "@/service/collaborator-management.service";
import { safeLogger } from "@/utils/security/safeLogger";
import { COLLABORATOR_ROLE_OPTIONS, type CollaboratorAccessRole } from "../create/constants";

interface CreateAccessModalProps {
  open: boolean;
  employeeId: string;
  employeeName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAccessModal = ({
  open,
  employeeId,
  employeeName,
  onClose,
  onSuccess,
}: CreateAccessModalProps) => {
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState<CollaboratorAccessRole>("PARTNER");
  const [availability, setAvailability] = useState<"available" | "unavailable" | "checking" | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    setUsername("");
    setUserRole("PARTNER");
    setAvailability(null);
    onClose();
  }, [onClose]);

  const handleCheckUsername = useCallback(async () => {
    if (username.length < 4) {
      toast({ title: "Usuário inválido", description: "Mínimo 4 caracteres.", variant: "destructive" });
      return;
    }
    setIsChecking(true);
    setAvailability("checking");
    try {
      const available = await checkUsernameAvailability(username);
      if (!available) {
        toast({ title: "Nome de usuário indisponível", description: "Já está em uso.", variant: "destructive" });
        setAvailability("unavailable");
      } else {
        toast({ title: "Nome de usuário disponível!" });
        setAvailability("available");
      }
    } catch (error) {
      safeLogger.error("Erro ao verificar username:", error);
      toast({ title: "Erro de rede", variant: "destructive" });
      setAvailability(null);
    } finally {
      setIsChecking(false);
    }
  }, [username, toast]);

  const handleSubmit = useCallback(async () => {
    if (availability !== "available") {
      toast({ title: "Verifique o nome de usuário antes de continuar.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await preloadCsrfToken();
      await createUser({ username, role: userRole, employeeId });
      toast({ title: "Acesso criado!", description: `Usuário "${username}" vinculado a ${employeeName}.` });
      handleClose();
      onSuccess();
    } catch (error) {
      safeLogger.error("Erro ao criar acesso:", error);
      toast({
        title: "Erro ao criar acesso",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [availability, username, userRole, employeeId, employeeName, handleClose, onSuccess, toast]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md rounded-[28px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-blue-500" />
            Criar acesso ao sistema
          </DialogTitle>
          <DialogDescription>
            Definindo login para <strong>{employeeName}</strong>. A senha inicial será enviada por e-mail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nome de usuário</label>
            <div className="flex gap-2">
              <Input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/\s/g, ""));
                  setAvailability(null);
                }}
                placeholder="ex: joao.silva"
                className="h-11 flex-1 rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleCheckUsername()}
                disabled={isChecking || username.length < 4}
                className="h-11 shrink-0 rounded-xl"
              >
                {isChecking ? "..." : "Verificar"}
              </Button>
            </div>
            {availability === "available" && (
              <p className="text-xs text-emerald-600">Nome de usuário disponível.</p>
            )}
            {availability === "unavailable" && (
              <p className="text-xs text-rose-600">Nome de usuário já em uso.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Perfil de acesso</label>
            <div className="grid grid-cols-2 gap-3">
              {COLLABORATOR_ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setUserRole(opt.value)}
                  className={cn(
                    "rounded-[14px] border p-3 text-left transition-all",
                    userRole === opt.value
                      ? "border-blue-400 bg-blue-50 text-blue-800"
                      : "border-slate-200 bg-white text-slate-600"
                  )}
                >
                  <div className="text-sm font-semibold">{opt.label}</div>
                  <div className="mt-0.5 text-xs">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            A senha inicial é gerada automaticamente e enviada por e-mail.
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="h-11 flex-1 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting || availability !== "available"}
              className="h-11 flex-1 rounded-xl"
            >
              {isSubmitting ? "Criando..." : "Criar acesso"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAccessModal;
