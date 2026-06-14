import { useMemo, useState } from "react";
import { AlertTriangle, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import type { ChangePasswordData } from "@/types/user";
import type { UsuarioSecuritySummary } from "@/features/user-profile/mappers/usuario-profile.mapper";

interface SecurityPasswordCardProps {
  security: UsuarioSecuritySummary;
  isChanging: boolean;
  error?: string | null;
  onChangePassword: (payload: ChangePasswordData) => Promise<void>;
}

const SecurityPasswordCard = ({
  security,
  isChanging,
  error,
  onChangePassword,
}: SecurityPasswordCardProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    <Card className="rounded-[24px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl text-[#102A43]">Segurança da conta</CardTitle>
            <CardDescription className="text-[#627D98]">
              Troque sua senha com segurança. A sessão será encerrada após a confirmação.
            </CardDescription>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D8E2EC] bg-[#F5F8FB] px-3 py-1 text-xs font-semibold text-[#1F4E5F]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Proteção ativa
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <p className="font-medium">Senha indisponivel</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-700" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-medium">A troca encerra a sessão atual.</p>
                  <p>{security.passwordWarning}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="usuario-current-password" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">
                  Senha atual
                </Label>
                <PasswordInput
                  id="usuario-current-password"
                  className="h-11 border-[#D8E2EC] bg-white text-[#102A43]"
                  placeholder="Digite sua senha atual"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  disabled={isChanging}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usuario-new-password" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">
                  Nova senha
                </Label>
                <PasswordInput
                  id="usuario-new-password"
                  className="h-11 border-[#D8E2EC] bg-white text-[#102A43]"
                  placeholder="Mínimo de 8 caracteres"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={isChanging}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usuario-confirm-password" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">
                  Confirmar senha
                </Label>
                <PasswordInput
                  id="usuario-confirm-password"
                  className="h-11 border-[#D8E2EC] bg-white text-[#102A43]"
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isChanging}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] p-4 text-sm text-[#627D98]">
              <div className="flex items-start gap-2">
                <LockKeyhole className="mt-0.5 h-4 w-4 text-[#1F4E5F]" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-medium text-[#102A43]">Regras de senha</p>
                  <p>{security.passwordHint}</p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              className="h-11 w-full bg-[#102A43] text-white hover:bg-[#1F4E5F]"
              onClick={() => void handleSubmit()}
              disabled={isChanging || !canSubmit || Boolean(error)}
            >
              {isChanging ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Alterar senha e encerrar sessão
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityPasswordCard;
