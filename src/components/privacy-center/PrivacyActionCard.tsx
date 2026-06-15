import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PrivacyActionCardProps {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  tone: string;
  children?: ReactNode;
  className?: string;
}

const PrivacyActionCard = ({
  icon: Icon,
  label,
  title,
  description,
  tone,
  children,
  className,
}: PrivacyActionCardProps) => {
  return (
    <Card className={cn("border-border/70 shadow-sm", className)}>
      <div className="flex items-start gap-3 border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
        <span
          aria-hidden="true"
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white",
            tone
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">
            {label}
          </p>
          <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>
          <p className="text-xs leading-5 text-[#64748B]">{description}</p>
        </div>
      </div>
      {children ? <CardContent className="px-5 py-5">{children}</CardContent> : null}
    </Card>
  );
};

export default PrivacyActionCard;
