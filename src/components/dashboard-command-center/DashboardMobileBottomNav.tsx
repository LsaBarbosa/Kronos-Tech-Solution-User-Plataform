import { Clock, Home, MessageSquareWarning, User2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardMobileBottomNavProps {
  activeKey?: "home" | "ponto" | "avisos" | "perfil";
  newWarnings: number;
  onHome: () => void;
  onPonto: () => void;
  onAvisos: () => void;
  onPerfil: () => void;
}

interface NavItem {
  key: "home" | "ponto" | "avisos" | "perfil";
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  badge?: number;
}

const DashboardMobileBottomNav = ({
  activeKey = "home",
  newWarnings,
  onHome,
  onPonto,
  onAvisos,
  onPerfil,
}: DashboardMobileBottomNavProps) => {
  const items: NavItem[] = [
    { key: "home", label: "Home", icon: Home, onClick: onHome },
    { key: "ponto", label: "Ponto", icon: Clock, onClick: onPonto },
    {
      key: "avisos",
      label: "Avisos",
      icon: MessageSquareWarning,
      onClick: onAvisos,
      badge: newWarnings > 0 ? newWarnings : undefined,
    },
    { key: "perfil", label: "Perfil", icon: User2, onClick: onPerfil },
  ];

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-white/95 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/85"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-4 gap-1">
        {items.map(({ key, label, icon: Icon, onClick, badge }) => {
          const isActive = activeKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={onClick}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2",
                isActive ? "bg-[#EFF6FF] text-[#1D4ED8]" : "text-[#64748B] hover:bg-[#F1F5F9]"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              {badge ? (
                <span className="absolute right-2 top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full border border-white bg-[#DC2626] px-1 text-[10px] font-bold text-white">
                  {badge > 9 ? "9+" : badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default DashboardMobileBottomNav;
