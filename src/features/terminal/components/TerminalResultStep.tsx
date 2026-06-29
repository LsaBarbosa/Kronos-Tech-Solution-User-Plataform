import { CheckCircle2, LogOut } from "lucide-react";
import type { TerminalCheckinResult } from "@/types/terminal";

interface TerminalResultStepProps {
  result: TerminalCheckinResult;
  countdown: number;
}

const ACTION_LABELS: Record<string, string> = {
  CHECKIN: "Entrada registrada!",
  CHECKOUT: "Saída registrada!",
};

export function TerminalResultStep({ result, countdown }: TerminalResultStepProps) {
  const label = ACTION_LABELS[result.actionType] ?? "Ponto registrado!";
  const isCheckout = result.actionType === "CHECKOUT";

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full ${
          isCheckout ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
        }`}
      >
        {isCheckout ? (
          <LogOut className="h-10 w-10" />
        ) : (
          <CheckCircle2 className="h-10 w-10" />
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xl font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">{result.message}</p>
      </div>

      <p className="text-xs text-muted-foreground">
        Encerrando sessão em <span className="font-semibold tabular-nums">{countdown}s</span>
      </p>
    </div>
  );
}
