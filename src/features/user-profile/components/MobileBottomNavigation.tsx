import type { ReactNode } from "react";
import { IdCard, Phone, LockKeyhole, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UsuarioMobileSection } from "./user-profile.types";

interface MobileBottomNavigationProps {
  value: UsuarioMobileSection;
  onChange: (section: UsuarioMobileSection) => void;
}

const mobileBottomNavItems: Array<{
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

const MobileBottomNavigation = ({ value, onChange }: MobileBottomNavigationProps) => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#D8E2EC] bg-white/96 backdrop-blur-xl">
      <div className="mx-auto grid max-w-3xl grid-cols-4 gap-2 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {mobileBottomNavItems.map((item) => {
          const active = item.value === value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border px-2 text-[11px] font-semibold transition-colors",
                active
                  ? "border-[#1F4E5F] bg-[#1F4E5F] text-white"
                  : "border-[#D8E2EC] bg-[#F5F8FB] text-[#627D98]"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNavigation;
