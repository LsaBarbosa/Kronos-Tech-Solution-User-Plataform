import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { getDocumentRoleCopy, type DocumentRole } from "../documents-ui.helpers";

interface DocumentScopeCardsProps {
  activeRole: DocumentRole;
}

const ROLES: Array<"CTO" | "MANAGER" | "PARTNER"> = ["CTO", "MANAGER", "PARTNER"];

const DocumentScopeCards = ({ activeRole }: DocumentScopeCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {ROLES.map((role) => {
        const copy = getDocumentRoleCopy(role);
        const isActive = activeRole === role;
        const Icon = copy.icon;

        return (
          <Card
            key={role}
            className={cn(
              "relative overflow-hidden border bg-white shadow-sm transition",
              isActive ? "ring-2 ring-[#2563EB] ring-offset-2" : "border-border/70 opacity-90"
            )}
            aria-current={isActive ? "true" : undefined}
          >
            <div
              className={cn(
                "h-1 w-full",
                role === "CTO" && "bg-[#7C3AED]",
                role === "MANAGER" && "bg-[#2563EB]",
                role === "PARTNER" && "bg-[#0D9488]"
              )}
            />
            <CardContent className="space-y-3 px-5 py-5">
              <div className="flex items-center justify-between gap-2">
                <Badge className={cn("border", copy.badgeClass)}>{copy.badge}</Badge>
                {isActive ? (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#16A34A]"
                    aria-label="Escopo ativo"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Ativo
                  </span>
                ) : null}
              </div>

              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    role === "CTO" && "bg-[#EDE9FE] text-[#5B21B6]",
                    role === "MANAGER" && "bg-[#DBEAFE] text-[#1D4ED8]",
                    role === "PARTNER" && "bg-[#CCFBF1] text-[#115E59]"
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
      })}
    </div>
  );
};

export default DocumentScopeCards;
