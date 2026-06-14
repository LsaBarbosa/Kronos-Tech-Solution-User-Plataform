import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Loader2, LockKeyhole } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { ChangePasswordData } from "@/types/user";
import type { UsuarioSecuritySummary } from "@/features/user-profile/mappers/usuario-profile.mapper";

interface MobilePasswordFlowSheetProps {
  open: boolean;
  security: UsuarioSecuritySummary;
  isChanging: boolean;
  onOpenChange: (open: boolean) => void;
  onChangePassword: (payload: ChangePasswordData) => Promise<void>;
}

const MobilePasswordFlowSheet = ({
  open,
  security,
  isChanging,
  onOpenChange,
  onChangePassword,
}: MobilePasswordFlowSheetProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (open) {
      setStep(1);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setStep(1);
  }, [open]);

  const canSubmit = useMemo(
    () =>
      Boolean(currentPassword && newPassword && confirmPassword) &&
      newPassword === confirmPassword &&
      newPassword.length >= 8,
    [confirmPassword, currentPassword, newPassword]
  );

  const handleSubmit = async () => {
    await onChangePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="rounded-t-[24px] border-[#D8E2EC] bg-white px-0">
        <DrawerHeader className="px-5 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <DrawerTitle className="text-left text-[#102A43]">Alterar senha</DrawerTitle>
              <DrawerDescription className="text-left text-[#627D98]">
                Fluxo dedicado para troca segura. A sessão será encerrada ao confirmar.
              </DrawerDescription>
            </div>
            <Badge variant="outline" className="border-[#D8E2EC] bg-[#D9E2EB] text-[#1F4E5F]">
              Segurança
            </Badge>
          </div>
        </DrawerHeader>

        <div className="space-y-4 px-5 pb-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" aria-hidden="true" />
              <div className="space-y-1">
                <p className="font-medium">A troca encerra a sessão atual.</p>
                <p>{security.passwordWarning}</p>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#D8E2EC] bg-[#D9E2EB] p-4">
                <p className="text-sm font-medium text-[#102A43]">Antes de continuar</p>
                <p className="mt-2 text-sm leading-6 text-[#627D98]">
                  Confirme que deseja iniciar a troca. Em seguida você informará a senha atual, a nova senha e a confirmação.
                </p>
              </div>
              <Button
                type="button"
                className="h-11 w-full bg-[#102A43] text-white hover:bg-[#1F4E5F]"
                onClick={() => setStep(2)}
              >
                Continuar
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile-current-password" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">
                  Senha atual
                </Label>
                <PasswordInput
                  id="mobile-current-password"
                  className="h-11 border-[#D8E2EC] bg-white text-[#102A43]"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  disabled={isChanging}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile-new-password" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">
                  Nova senha
                </Label>
                <PasswordInput
                  id="mobile-new-password"
                  className="h-11 border-[#D8E2EC] bg-white text-[#102A43]"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={isChanging}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile-confirm-password" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">
                  Confirmar senha
                </Label>
                <PasswordInput
                  id="mobile-confirm-password"
                  className="h-11 border-[#D8E2EC] bg-white text-[#102A43]"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isChanging}
                />
              </div>

              <div className="rounded-2xl border border-[#D8E2EC] bg-[#D9E2EB] p-4 text-sm text-[#627D98]">
                <div className="flex items-start gap-2">
                  <LockKeyhole className="mt-0.5 h-4 w-4 text-[#1F4E5F]" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="font-medium text-[#102A43]">Regras de senha</p>
                    <p>{security.passwordHint}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {step === 2 ? (
          <DrawerFooter className="border-t border-[#D8E2EC] bg-[#D9E2EB] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            <Button
              type="button"
              className="h-11 w-full bg-[#102A43] text-white hover:bg-[#1F4E5F]"
              onClick={() => void handleSubmit()}
              disabled={isChanging || !canSubmit}
            >
              {isChanging ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Alterar senha
            </Button>
          </DrawerFooter>
        ) : (
          <DrawerFooter className="border-t border-[#D8E2EC] bg-[#D9E2EB] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default MobilePasswordFlowSheet;
