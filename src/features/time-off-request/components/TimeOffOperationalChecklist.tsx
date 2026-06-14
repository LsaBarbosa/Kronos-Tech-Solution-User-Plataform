import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle, ClipboardCheck, FileLock2, Scale } from "lucide-react";

interface TimeOffOperationalChecklistProps {
  onOpenAttachmentPolicy?: () => void;
  variant?: "desktop" | "mobile";
  className?: string;
}

const checklistItems = [
  {
    icon: ClipboardCheck,
    title: "Período coerente",
    description: "Informe início, fim e horários do ajuste sem inverter a sequência.",
  },
  {
    icon: Scale,
    title: "Manager definido",
    description: "O gestor selecionado será o responsável pela análise.",
  },
  {
    icon: FileLock2,
    title: "Evidência protegida",
    description: "O anexo é opcional, validado e usado somente no fluxo de aprovação.",
  },
  {
    icon: AlertCircle,
    title: "Acompanhamento",
    description: "Após o envio, cada dia do período será registrado para aprovação.",
  },
] as const;

const TimeOffOperationalChecklist = ({ onOpenAttachmentPolicy, variant = "desktop", className }: TimeOffOperationalChecklistProps) => {
  const isMobile = variant === "mobile";

  return (
    <Card className={cn("rounded-[28px] border border-[#D8E2EC] bg-white shadow-[0_16px_40px_rgba(16,42,67,0.10)]", className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#B3C2D0] bg-[#E9EEF4] text-[#102A43]">
            LGPD / rastreabilidade
          </Badge>
        </div>
        <CardTitle className={cn("text-[#102A43]", isMobile ? "text-xl" : "text-2xl")}>Checklist operacional</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {checklistItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex gap-3 rounded-[20px] border border-[#D8E2EC] bg-[#F8FAFC] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F4E5F] text-white">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#102A43]">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-[#627D98]">{item.description}</p>
              </div>
            </div>
          );
        })}

        {onOpenAttachmentPolicy ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-full border-[#D8E2EC] bg-white text-[#102A43]"
            onClick={onOpenAttachmentPolicy}
          >
            Ver política de anexo
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default TimeOffOperationalChecklist;
