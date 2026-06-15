import { Inbox, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TimeOffApprovalViewModel } from "../types";
import TimeOffApprovalCard from "./TimeOffApprovalCard";

interface TimeOffApprovalQueueProps {
  variant: "desktop" | "mobile";
  requests: TimeOffApprovalViewModel[];
  selectedKey: number | null;
  isLoading: boolean;
  onSelect: (request: TimeOffApprovalViewModel) => void;
  onDownload?: (request: TimeOffApprovalViewModel) => void;
}

const TimeOffApprovalQueue = ({
  variant,
  requests,
  selectedKey,
  isLoading,
  onSelect,
  onDownload,
}: TimeOffApprovalQueueProps) => {
  if (isLoading && requests.length === 0) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex items-center justify-center gap-3 px-5 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" />
          <span>Carregando solicitações...</span>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 px-5 py-12 text-center text-muted-foreground">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#94A3B8]"
          >
            <Inbox className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold text-[#0F172A]">
            Nenhuma solicitação encontrada
          </p>
          <p className="max-w-md text-xs leading-5 text-[#64748B]">
            Ajuste o filtro de status ou a busca por colaborador para localizar abonos aguardando decisão.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <TimeOffApprovalCard
          key={request.record.timeRecordId}
          request={request}
          variant={variant}
          selected={selectedKey === request.record.timeRecordId}
          onSelect={onSelect}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
};

export default TimeOffApprovalQueue;
