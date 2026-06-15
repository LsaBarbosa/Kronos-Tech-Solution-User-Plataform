import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Megaphone, ShieldAlert, Users, MessagesSquare } from "lucide-react";
import type { NoticePermissionCopy } from "./notice-ui.helpers";

interface NoticeHeroProps {
  variant: "desktop" | "mobile";
  canCreate: boolean;
  onCreate: () => void;
  permissionCopy: NoticePermissionCopy;
}

const desktopBadges = [
  { label: "Leitura rastreável", icon: MessagesSquare },
  { label: "Priorização por impacto", icon: ShieldAlert },
  { label: "Destinatário segmentado", icon: Users },
];

const NoticeHero = ({ variant, canCreate, onCreate, permissionCopy }: NoticeHeroProps) => {
  if (variant === "mobile") {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <div className="bg-[linear-gradient(135deg,#0B1220_0%,#101A33_52%,#1E3A8A_100%)] px-5 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-3">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-cyan-300" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                  Avisos
                </span>
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-semibold leading-tight">
                  Comunicação interna com prioridade e destinatário
                </h1>
                <p className="text-sm leading-6 text-white/78">
                  Leia os avisos recebidos, acompanhe o nível de prioridade e abra o detalhe em um toque.
                </p>
              </div>
            </div>
            <Badge className={cn("shrink-0 border-white/15", permissionCopy.badgeClass)}>
              {permissionCopy.title}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="border-white/15 bg-white/10 text-white">
              Prioridade operacional
            </Badge>
            <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-50">
              Destinatário visível
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-border/70 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.20),transparent_30%)]" />
      <div className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />

      <div className="relative bg-[linear-gradient(135deg,#0B1220_0%,#101A33_52%,#1E3A8A_100%)] px-6 py-7 text-white sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/15 bg-white/10 text-white">
                Central de comunicação interna
              </Badge>
              <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-50">
                Prioridade e destinatário
              </Badge>
              <Badge className={cn("border-white/15", permissionCopy.badgeClass)}>
                {permissionCopy.title}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/68">
                Avisos Kronos
              </p>
              <h1 className="text-3xl font-semibold leading-tight xl:text-4xl">
                Comunicação interna com prioridade e destinatário
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-white/78 sm:text-base">
                Centralize o envio, a leitura e a remoção de comunicados com rastreabilidade,
                leitura detalhada e filtros claros.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {desktopBadges.map(({ label, icon: Icon }) => (
                <Badge
                  key={label}
                  className="border-white/15 bg-white/10 px-3 py-1.5 text-white"
                >
                  <Icon className="mr-2 h-3.5 w-3.5" />
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 xl:w-[280px]">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                Operação atual
              </p>
              <p className="mt-2 text-sm leading-6 text-white/85">{permissionCopy.description}</p>
            </div>

            {canCreate ? (
              <Button
                type="button"
                size="lg"
                onClick={onCreate}
                className="h-12 w-full bg-white text-[#0B1220] hover:bg-white/90"
              >
                <Megaphone className="h-4 w-4" />
                Novo aviso
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NoticeHero;
