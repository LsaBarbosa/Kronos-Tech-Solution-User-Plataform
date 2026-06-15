import { AlertTriangle, Inbox, Loader2, SearchX, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ApprovalStateProps {
  variant: "loading" | "empty" | "no-results" | "error";
  searchTerm?: string;
  errorMessage?: string | null;
  className?: string;
}

interface StateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  bgClass: string;
  iconClass: string;
}

const ApprovalState = ({ variant, searchTerm, errorMessage, className }: ApprovalStateProps) => {
  if (variant === "loading") {
    return (
      <Card className={cn("border-border/70 shadow-sm", className)}>
        <CardContent className="flex items-center justify-center gap-3 px-5 py-12 text-[#475569]">
          <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" aria-hidden="true" />
          <span className="text-sm font-medium">Carregando solicitações...</span>
        </CardContent>
      </Card>
    );
  }

  const config: StateConfig =
    variant === "no-results"
      ? {
          icon: SearchX,
          title: "Nenhum resultado para o filtro",
          description: searchTerm
            ? `Não encontramos solicitações para "${searchTerm}". Ajuste a busca para ampliar a fila.`
            : "Ajuste a busca para ampliar a fila.",
          bgClass: "bg-[#F1F5F9]",
          iconClass: "text-[#475569]",
        }
      : variant === "error"
        ? {
            icon: AlertTriangle,
            title: "Não foi possível carregar as solicitações",
            description: errorMessage || "Tente novamente em instantes.",
            bgClass: "bg-[#FEE2E2]",
            iconClass: "text-[#B91C1C]",
          }
        : {
            icon: Inbox,
            title: "Nenhuma solicitação pendente",
            description:
              "Quando novas solicitações forem enviadas, elas aparecerão aqui para aprovação.",
            bgClass: "bg-[#DCFCE7]",
            iconClass: "text-[#15803D]",
          };

  const Icon = config.icon;

  return (
    <Card className={cn("border-border/70 shadow-sm", className)}>
      <CardContent className="flex flex-col items-center gap-3 px-5 py-12 text-center text-[#64748B]">
        <span
          aria-hidden="true"
          className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", config.bgClass, config.iconClass)}
        >
          <Icon className="h-6 w-6" />
        </span>
        <p className="text-sm font-semibold text-[#0F172A]">{config.title}</p>
        <p className="max-w-md text-xs leading-5">{config.description}</p>
      </CardContent>
    </Card>
  );
};

export default ApprovalState;
