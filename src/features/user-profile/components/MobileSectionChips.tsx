import type { ReactNode } from "react";
import { IdCard, LockKeyhole, ShieldCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UsuarioMobileSection } from "./user-profile.types";

const usuarioMobileSectionItems: Array<{
  value: UsuarioMobileSection;
  label: string;
  icon: ReactNode;
}> = [
  {
    value: "identidade",
    label: "Identidade",
    icon: <IdCard className="h-4 w-4" />,
  },
  {
    value: "contato",
    label: "Contato",
    icon: <Phone className="h-4 w-4" />,
  },
  {
    value: "senha",
    label: "Senha",
    icon: <LockKeyhole className="h-4 w-4" />,
  },
  {
    value: "lgpd",
    label: "LGPD",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
];

interface MobileSectionChipsProps {
  value: UsuarioMobileSection;
  onChange: (section: UsuarioMobileSection) => void;
}

const MobileSectionChips = ({ value, onChange }: MobileSectionChipsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {usuarioMobileSectionItems.map((item) => {
        const active = item.value === value;

        return (
          <Button
            key={item.value}
            type="button"
            variant={active ? "default" : "outline"}
            className={cn(
              "h-11 shrink-0 rounded-full px-4",
              active ? "bg-[#1F4E5F] text-white hover:bg-[#102A43]" : "border-[#D8E2EC] bg-white text-[#102A43]"
            )}
            onClick={() => onChange(item.value)}
          >
            {item.icon}
            {item.label}
          </Button>
        );
      })}
    </div>
  );
};

export default MobileSectionChips;
