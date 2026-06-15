import { Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import LgpdRequestsList from "@/components/privacy/LgpdRequestsList";

interface PrivacyRecentRequestsProps {
  refreshKey: number;
}

const PrivacyRecentRequests = ({ refreshKey }: PrivacyRecentRequestsProps) => {
  return (
    <Card className="border-border/70 shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Solicitações recentes
          </p>
          <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">Seu histórico LGPD</h2>
        </div>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#92400E]"
        >
          <Inbox className="h-4.5 w-4.5" />
        </span>
      </div>
      <CardContent className="px-5 py-5">
        <LgpdRequestsList refreshKey={refreshKey} />
      </CardContent>
    </Card>
  );
};

export default PrivacyRecentRequests;
