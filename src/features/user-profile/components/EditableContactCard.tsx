import { useEffect, useMemo, useState } from "react";
import { AtSign, Loader2, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { onlyDigits } from "@/features/user-profile/utils/mask-sensitive-data";
import type { UsuarioContactSummary } from "@/features/user-profile/mappers/usuario-profile.mapper";
import type { UpdateOwnProfilePayload } from "@/service/user.service";

interface EditableContactCardProps {
  contact: UsuarioContactSummary | null;
  isSaving: boolean;
  error?: string | null;
  onSave: (payload: UpdateOwnProfilePayload) => Promise<void>;
}

const EditableContactCard = ({ contact, isSaving, error, onSave }: EditableContactCardProps) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!contact) {
      setEmail("");
      setPhone("");
      return;
    }

    setEmail(contact.email ?? "");
    setPhone(contact.phoneDisplay || contact.phone || "");
  }, [contact]);

  const originalPhoneDigits = useMemo(() => onlyDigits(contact?.phone), [contact?.phone]);
  const currentPhoneDigits = onlyDigits(phone);
  const hasChanges = useMemo(() => {
    const originalEmail = contact?.email?.trim() ?? "";
    const currentEmail = email.trim();

    return originalEmail !== currentEmail || originalPhoneDigits !== currentPhoneDigits;
  }, [contact?.email, currentPhoneDigits, email, originalPhoneDigits]);

  const handleSubmit = async () => {
    await onSave({
      email: email.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <Card className="rounded-[24px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl text-[#102A43]">Contato editável</CardTitle>
            <CardDescription className="text-[#627D98]">
              Atualize somente seu e-mail e telefone. A edição é limitada ao próprio perfil.
            </CardDescription>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D8E2EC] bg-[#D9E2EB] px-3 py-1 text-xs font-semibold text-[#1F4E5F]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Edição própria
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <p className="font-medium">Contato indisponivel</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-[#D8E2EC] bg-[#D9E2EB] p-4 text-sm text-[#627D98]">
              <p className="font-medium text-[#102A43]">Resumo atual</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl border border-white bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">E-mail</p>
                  <p className="mt-1 break-words text-sm font-medium text-[#102A43]">{contact?.email || "Nao informado"}</p>
                </div>
                <div className="rounded-2xl border border-white bg-white p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Telefone</p>
                  <p className="mt-1 break-words text-sm font-medium text-[#102A43]">
                    {contact?.phoneDisplay || contact?.phone || "Nao informado"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="usuario-email" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">
                  E-mail
                </Label>
                <div className="relative">
                  <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#627D98]" />
                  <Input
                    id="usuario-email"
                    type="email"
                    autoComplete="email"
                    className="h-11 border-[#D8E2EC] bg-white pl-10 text-[#102A43] placeholder:text-[#627D98]"
                    placeholder="seu.email@empresa.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usuario-phone" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">
                  Telefone
                </Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#627D98]" />
                  <Input
                    id="usuario-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className="h-11 border-[#D8E2EC] bg-white pl-10 text-[#102A43] placeholder:text-[#627D98]"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#D8E2EC] bg-white p-4 text-sm text-[#627D98]">
              <p className="font-medium text-[#102A43]">Segurança de perfil</p>
              <p className="mt-2 leading-6">
                A atualização usa o mesmo contrato do colaborador próprio e nunca permite alteração de empresa, papel ou salário.
              </p>
            </div>
            <Button
              type="button"
              className={cn("h-11 w-full bg-[#1F4E5F] text-white hover:bg-[#102A43]", !hasChanges && "opacity-70")}
              onClick={() => void handleSubmit()}
              disabled={isSaving || !hasChanges || Boolean(error)}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Salvar contato
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EditableContactCard;
