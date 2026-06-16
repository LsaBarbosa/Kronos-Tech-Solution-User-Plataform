import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LgpdRequestType } from "@/service/lgpd.service";
import { isExportableType, isSensitiveType } from "../utils/lgpdCaseFormatters";

interface LgpdCaseDescriptionProps {
  type: LgpdRequestType | string;
  description: string;
  resolutionNotes?: string | null;
  variant: "desktop" | "mobile";
}

export const LgpdCaseDescription = ({
  type,
  description,
  resolutionNotes,
  variant,
}: LgpdCaseDescriptionProps) => {
  const sensitive = isSensitiveType(type);
  const exportable = isExportableType(type);
  return (
    <Card className="border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(11,18,32,0.06)]">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
            {variant === "mobile" ? "Descrição" : "Descrição pública"}
          </p>
        </div>
        <div
          className={cn(
            "rounded-2xl border bg-[#F8FAFC] p-3 text-sm leading-6 text-[#0F172A]",
            "border-[#E2E8F0]"
          )}
        >
          {description?.trim() || "Sem descrição informada."}
        </div>

        <div className="flex flex-wrap gap-2">
          {sensitive ? (
            <Badge className="rounded-full border border-[#DDD6FE] bg-[#EDE9FE] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#5B21B6]">
              dados sensíveis
            </Badge>
          ) : (
            <Badge className="rounded-full border border-[#99F6E4] bg-[#CCFBF1] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#0F766E]">
              dados pessoais
            </Badge>
          )}
          {exportable ? (
            <Badge className="rounded-full border border-[#BBF7D0] bg-[#DCFCE7] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#15803D]">
              exportável
            </Badge>
          ) : (
            <Badge className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#475569]">
              sem exportação
            </Badge>
          )}
        </div>

        {resolutionNotes ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64748B]">
              Notas de resolução
            </p>
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-sm leading-6 text-[#0F172A]">
              {resolutionNotes}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
};

export default LgpdCaseDescription;
