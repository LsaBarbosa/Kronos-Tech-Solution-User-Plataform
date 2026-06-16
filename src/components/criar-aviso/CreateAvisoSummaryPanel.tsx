import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Hash, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateAvisoViewModel } from "./useCreateAvisoViewModel";

interface CreateAvisoSummaryPanelProps {
  viewModel: CreateAvisoViewModel;
}

export const CreateAvisoSummaryPanel = ({ viewModel }: CreateAvisoSummaryPanelProps) => {
  const {
    formState,
    tipoLabel,
    tipoTone,
    recipientsLabel,
    titleLength,
    messageLength,
    isMessageTooLong,
    isFormValid,
  } = viewModel;
  const { title } = formState;

  return (
    <Card className="border border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.08)]">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">
            Governança
          </p>
          <p className="text-lg font-semibold text-[#102A43]">Prévia do aviso</p>
        </div>

        <div className="space-y-3 text-sm text-[#334E68]">
          <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <Hash className="mt-0.5 h-5 w-5 shrink-0 text-[#1F4E5F]" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#627D98]">
                Título
              </p>
              <p className="text-sm font-medium text-[#102A43]">
                {title.trim() || "Não definido"}
              </p>
              <p className="text-[11px] text-[#94A3B8]">{titleLength} caractere(s)</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#1F4E5F]" />
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#627D98]">
                Prioridade
              </p>
              <Badge
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-semibold",
                  tipoTone.badge
                )}
              >
                <span className={cn("mr-1 h-1.5 w-1.5 rounded-full", tipoTone.dot)} />
                {tipoLabel}
              </Badge>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <Users className="mt-0.5 h-5 w-5 shrink-0 text-[#1F4E5F]" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#627D98]">
                Destinatários
              </p>
              <p className="text-sm font-medium text-[#102A43]">{recipientsLabel}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#1F4E5F]" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#627D98]">
                Mensagem
              </p>
              <p className="text-sm font-medium text-[#102A43]">
                {messageLength} caractere(s)
              </p>
              <p
                className={cn(
                  "text-[11px]",
                  isMessageTooLong ? "text-[#B91C1C]" : "text-[#94A3B8]"
                )}
              >
                {isMessageTooLong
                  ? "Acima do recomendado (500)"
                  : "Dentro do limite recomendado"}
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "rounded-2xl border px-3 py-2 text-xs font-semibold",
            isFormValid
              ? "border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]"
              : "border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]"
          )}
        >
          {isFormValid
            ? "Tudo pronto para postar"
            : "Preencha título, prioridade e mensagem para habilitar o envio"}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateAvisoSummaryPanel;
