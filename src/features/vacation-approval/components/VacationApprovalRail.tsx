import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Inbox, ShieldCheck, Settings2 } from "lucide-react";

interface VacationApprovalRailProps {
  className?: string;
}

const RAIL_ITEMS = [
  { label: "Resumo", icon: Home, target: "summary" },
  { label: "Inbox", icon: Inbox, target: "inbox" },
  { label: "Detalhe", icon: ShieldCheck, target: "detail" },
  { label: "Ações", icon: Settings2, target: "decision" },
];

export const VacationApprovalRail = ({ className }: VacationApprovalRailProps) => {
  const scrollToTarget = (target: string) => {
    const element = document.getElementById(target);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside
      className={cn(
        "sticky top-28 hidden h-fit w-[88px] flex-col items-center gap-4 rounded-[28px] border border-slate-800 bg-[#0B1220] px-3 py-4 text-white shadow-2xl lg:flex",
        className
      )}
      aria-label="Navegação da mesa de aprovação"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-white shadow-lg">
        K
      </div>

      <div className="flex w-full flex-1 flex-col items-center justify-center gap-3">
        {RAIL_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <Button
              key={item.target}
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => scrollToTarget(item.target)}
              aria-label={item.label}
              className="h-11 w-11 rounded-2xl border border-white/10 text-white hover:bg-white/10 hover:text-white"
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </Button>
          );
        })}
      </div>

      <div className="h-2 w-8 rounded-full bg-cyan-300/70" />
    </aside>
  );
};
