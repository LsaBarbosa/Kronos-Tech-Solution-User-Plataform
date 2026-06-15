import { Clock as ClockIcon, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Clock from "@/components/Clock";
import { useCheckin } from "@/hooks/useCheckin";

interface DashboardOperationalClockProps {
  variant: "desktop" | "mobile";
}

const DashboardOperationalClock = ({ variant }: DashboardOperationalClockProps) => {
  const { openCheckin } = useCheckin();

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border/60 bg-[#F8FAFC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8]"
          >
            <ClockIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Registro de ponto
            </p>
            <h2 className="text-base font-semibold text-[#0F172A] sm:text-lg">
              Marque sua entrada ou saída
            </h2>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={openCheckin}
          aria-label="Abrir fluxo de registro de ponto"
          className="h-10 gap-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
        >
          <Fingerprint className="h-4 w-4" />
          Registrar ponto
        </Button>
      </div>
      <CardContent
        className={
          variant === "desktop"
            ? "flex min-h-[200px] items-center justify-center px-5 py-7"
            : "flex items-center justify-center px-4 py-6"
        }
      >
        <div className="rounded-2xl border border-border/60 bg-white px-6 py-5 text-center shadow-sm">
          <Clock />
          <p className="mt-3 text-xs text-[#64748B]">Hora oficial do servidor Kronos.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardOperationalClock;
