import { useEffect, useMemo, useState } from "react";
import { AtSign, Phone, Loader2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { onlyDigits } from "@/features/user-profile/utils/mask-sensitive-data";
import type { UsuarioContactSummary } from "@/features/user-profile/mappers/usuario-profile.mapper";
import type { UpdateOwnProfilePayload } from "@/service/user.service";

interface MobileEditContactSheetProps {
  open: boolean;
  contact: UsuarioContactSummary | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: UpdateOwnProfilePayload) => Promise<void>;
}

const MobileEditContactSheet = ({
  open,
  contact,
  isSaving,
  onOpenChange,
  onSave,
}: MobileEditContactSheetProps) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!contact) {
      setEmail("");
      setPhone("");
      return;
    }

    setEmail(contact?.email ?? "");
    setPhone(contact?.phoneDisplay || contact?.phone || "");
  }, [contact, open]);

  const canSave = useMemo(() => {
    const emailChanged = email.trim() !== (contact?.email?.trim() ?? "");
    const phoneChanged = onlyDigits(phone) !== onlyDigits(contact?.phone);
    return emailChanged || phoneChanged;
  }, [contact?.email, contact?.phone, email, phone]);

  const handleSave = async () => {
    await onSave({
      email: email.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="rounded-t-[24px] border-[#D8E2EC] bg-white px-0">
        <DrawerHeader className="px-5 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <DrawerTitle className="text-left text-[#102A43]">Editar contato</DrawerTitle>
              <DrawerDescription className="text-left text-[#627D98]">
                Ajuste somente e-mail e telefone do seu próprio perfil.
              </DrawerDescription>
            </div>
            <Badge variant="outline" className="border-[#D8E2EC] bg-[#F5F8FB] text-[#1F4E5F]">
              Próprio perfil
            </Badge>
          </div>
        </DrawerHeader>

        <div className="space-y-4 px-5 pb-4">
          <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] p-4 text-sm text-[#627D98]">
            O salvamento usa o contrato oficial de atualização do colaborador próprio.
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile-usuario-email" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">
              E-mail
            </Label>
            <div className="relative">
              <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#627D98]" />
              <Input
                id="mobile-usuario-email"
                type="email"
                autoComplete="email"
                className="h-11 border-[#D8E2EC] bg-white pl-10 text-[#102A43]"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile-usuario-phone" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">
              Telefone
            </Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#627D98]" />
              <Input
                id="mobile-usuario-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className="h-11 border-[#D8E2EC] bg-white pl-10 text-[#102A43]"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t border-[#D8E2EC] bg-[#F5F8FB] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <Button
            type="button"
            className="h-11 w-full bg-[#1F4E5F] text-white hover:bg-[#102A43]"
            onClick={() => void handleSave()}
            disabled={isSaving || !canSave}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Salvar contato
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileEditContactSheet;
