import { AlertTriangle, CalendarCheck, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { VacationApprovalViewModel } from "../types";
import VacationApprovalCard from "./VacationApprovalCard";

interface VacationApprovalQueueProps {
  variant: "desktop" | "mobile";
  requests: VacationApprovalViewModel[];
  selectedKey: string | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  searchTerm: string;
  onSelect: (request: VacationApprovalViewModel) => void;
  onRetry: () => void;
}

const VacationApprovalQueue = ({
  variant,
  requests,
  selectedKey,
  isLoading,
  isError,
  errorMessage,
  searchTerm,
  onSelect,
  onRetry,
}: VacationApprovalQueueProps) => {
  if (isLoading && requests.length === 0) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex items-center justify-center gap-3 px-5 py-12 text-[#475569]">
          <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" aria-hidden="true" />
          <span className="text-sm font-medium">Carregando solicitações...</span>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 px-5 py-12 text-center text-[#64748B]">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEE2E2] text-[#B91C1C]"
          >
            <AlertTriangle className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold text-[#0F172A]">
            Não foi possível carregar as solicitações
          </p>
          <p className="max-w-md text-xs leading-5">
            {errorMessage || "Tente novamente em instantes."}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
            className="h-10 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
          >
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 px-5 py-12 text-center text-[#64748B]">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#94A3B8]"
          >
            {searchTerm ? <Inbox className="h-6 w-6" /> : <CalendarCheck className="h-6 w-6" />}
          </span>
          <p className="text-sm font-semibold text-[#0F172A]">
            {searchTerm
              ? `Nenhum resultado para "${searchTerm}"`
              : "Nenhuma solicitação encontrada"}
          </p>
          <p className="max-w-md text-xs leading-5">
            Ajuste o filtro de status ou a busca por colaborador para localizar férias aguardando decisão.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <VacationApprovalCard
          key={request.key}
          request={request}
          variant={variant}
          selected={selectedKey === request.key}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default VacationApprovalQueue;
