import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { getUploadRoleCopy, type UploadRole } from "../upload-ui.helpers";

interface UploadScopeCardProps {
  activeRole: UploadRole;
}

const KNOWN_ROLES = new Set(["CTO", "MANAGER", "PARTNER"]);

const UploadScopeCard = ({ activeRole }: UploadScopeCardProps) => {
  if (!KNOWN_ROLES.has(activeRole)) {
    return null;
  }

  const copy = getUploadRoleCopy(activeRole);
  const Icon = copy.icon;

  return (
    <Card
      className="relative overflow-hidden border border-border/70 bg-white shadow-sm ring-2 ring-[#2563EB] ring-offset-2"
      aria-current="true"
    >
      <div
        className={cn(
          "h-1 w-full",
          activeRole === "CTO" && "bg-[#7C3AED]",
          activeRole === "MANAGER" && "bg-[#2563EB]",
          activeRole === "PARTNER" && "bg-[#0D9488]"
        )}
      />
      <CardContent className="space-y-3 px-5 py-5">
        <div className="flex items-center justify-between gap-2">
          <Badge className={cn("border", copy.badgeClass)}>{copy.badge}</Badge>
          <span
            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#16A34A]"
            aria-label="Escopo ativo"
          >
            <Check className="h-3.5 w-3.5" />
            Ativo
          </span>
        </div>

        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              activeRole === "CTO" && "bg-[#EDE9FE] text-[#5B21B6]",
              activeRole === "MANAGER" && "bg-[#DBEAFE] text-[#1D4ED8]",
              activeRole === "PARTNER" && "bg-[#CCFBF1] text-[#115E59]"
            )}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#0F172A]">{copy.title}</p>
            <p className="text-xs leading-5 text-[#64748B]">{copy.description}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-[#F8FAFC] px-3 py-2 text-[11px] leading-5 text-[#475569]">
          <p>
            <span className="font-semibold text-[#0F172A]">Escopo:</span> {copy.scope}
          </p>
          <p className="mt-1">
            <span className="font-semibold text-[#0F172A]">Restrição:</span> {copy.restriction}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadScopeCard;
