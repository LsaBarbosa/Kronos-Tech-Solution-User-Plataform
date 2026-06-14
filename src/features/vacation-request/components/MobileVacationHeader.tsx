import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MobileVacationHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

const MobileVacationHeader = ({ title, subtitle, className }: MobileVacationHeaderProps) => {
  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-b-[28px] bg-[#0B1220] px-4 pb-5 pt-4 text-white shadow-[0_20px_60px_rgba(11,18,32,0.24)]",
        className
      )}
    >
      <div className="absolute -right-10 -top-4 h-32 w-32 rounded-full border border-white/15 opacity-70" />
      <div className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-[#22D3EE]/8 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#2563EB] text-lg font-semibold text-white">
            K
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold tracking-tight">{title}</p>
            <p className="text-sm text-[#DCE7F5]">{subtitle}</p>
          </div>
        </div>

        <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
          Seguro
        </Badge>
      </div>
    </header>
  );
};

export default MobileVacationHeader;

