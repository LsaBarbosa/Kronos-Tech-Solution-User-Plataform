import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CONTEXT_STATUS_CARDS } from "./status-registro-helpers";

const StatusContextCards = () => {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {CONTEXT_STATUS_CARDS.map(({ status, title, description, icon: Icon, tone }) => (
        <Card key={status} className="border-border/70 shadow-sm">
          <CardContent className="space-y-3 px-4 py-4">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                  tone
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">
                  {status}
                </p>
                <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
              </div>
            </div>
            <p className="text-xs leading-5 text-[#64748B]">{description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatusContextCards;
