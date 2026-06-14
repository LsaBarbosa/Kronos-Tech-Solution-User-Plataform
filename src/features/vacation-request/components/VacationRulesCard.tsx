import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ListChecks, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VacationRulesCardProps {
  className?: string;
}

const rules = [
  "O período precisa ser atual ou futuro.",
  "A data final não pode ser anterior à inicial.",
  "O manager selecionado será responsável pela análise.",
  "Após o envio, cada dia do período será registrado para aprovação.",
];

const VacationRulesCard = ({ className }: VacationRulesCardProps) => {
  return (
    <Card
      id="vacation-rules"
      className={cn("rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_16px_40px_rgba(16,26,51,0.08)]", className)}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            Regras
          </Badge>
        </div>
        <CardTitle className="text-xl text-[#0F172A]">Critério de negócio</CardTitle>
        <CardDescription className="text-[#64748B]">
          A solicitação entra em fluxo de aprovação e não confirma férias antes da análise do manager.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {rules.map((rule, index) => (
            <div
              key={rule}
              className="flex items-start gap-3 rounded-[22px] border border-[#E2E8F0] bg-[#F8FAFC] p-4"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0F172A]">Regra {index + 1}</p>
                <p className="mt-1 text-sm leading-6 text-[#64748B]">{rule}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[22px] border border-[#FEF3C7] bg-[#FEF3C7] p-4 text-sm text-[#9A3412]">
          <div className="flex items-start gap-2">
            <ListChecks className="mt-0.5 h-4 w-4 text-[#F59E0B]" />
            <p>O status esperado após o envio é <span className="font-semibold">Pendente de aprovação</span>.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VacationRulesCard;

