import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, ShieldAlert, Users } from "lucide-react";

interface NoticeMetricsProps {
  total: number;
  alerts: number;
  critical: number;
  directed: number;
}

const metricCards = [
  {
    key: "total",
    label: "Total de avisos",
    icon: Bell,
    accent: "text-primary",
  },
  {
    key: "alerts",
    label: "Alertas",
    icon: AlertTriangle,
    accent: "text-amber-600",
  },
  {
    key: "critical",
    label: "Críticos",
    icon: ShieldAlert,
    accent: "text-red-600",
  },
  {
    key: "directed",
    label: "Direcionados",
    icon: Users,
    accent: "text-slate-700",
  },
] as const;

const NoticeMetrics = ({ total, alerts, critical, directed }: NoticeMetricsProps) => {
  const values = { total, alerts, critical, directed } as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metricCards.map(({ key, label, icon: Icon, accent }) => (
        <Card key={key} className="border-border/70 shadow-sm">
          <CardContent className="flex items-start justify-between gap-4 px-4 py-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                {label}
              </p>
              <p className="text-2xl font-semibold text-foreground">{values[key]}</p>
              <Badge variant="outline" className="border-border/70 text-[11px]">
                Página atual
              </Badge>
            </div>
            <div className={`rounded-2xl border border-border/70 p-3 ${accent}`}>
              <Icon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default NoticeMetrics;
