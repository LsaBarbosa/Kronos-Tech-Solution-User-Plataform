import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FilePlus2, ShieldCheck, Sparkles } from "lucide-react";

interface PrivacyHeroProps {
  variant: "desktop" | "mobile";
  userName?: string;
  onExport?: () => void;
  onNewRequest?: () => void;
  isExporting?: boolean;
}

const PrivacyHero = ({
  variant,
  userName,
  onExport,
  onNewRequest,
  isExporting,
}: PrivacyHeroProps) => {
  if (variant === "mobile") {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <div className="bg-[linear-gradient(135deg,#0B1220_0%,#101A33_52%,#1E3A8A_100%)] px-5 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                  Privacidade
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">LGPD</p>
                <h1 className="text-xl font-semibold leading-tight">Meus dados</h1>
                <p className="text-sm leading-6 text-white/78">
                  Consentimento, exportação, solicitações, histórico, revogação, catálogo e DPO em um só lugar.
                </p>
              </div>
            </div>
            <Badge className="shrink-0 border-white/15 bg-white/10 text-white">Titular</Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="border-white/15 bg-white/10 text-white">Direitos LGPD</Badge>
            <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-50">Autonomia</Badge>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-border/70 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.20),transparent_30%)]" />
      <div className="relative bg-[linear-gradient(135deg,#0B1220_0%,#101A33_52%,#1E3A8A_100%)] px-6 py-7 text-white sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/15 bg-white/10 text-white">Privacy Rights Center</Badge>
              <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-50">LGPD</Badge>
              <Badge className="border-white/15 bg-white/10 text-white">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {userName ? `Olá, ${userName.split(" ")[0]}` : "Bem-vindo"}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/68">
                Direitos do titular
              </p>
              <h1 className="text-3xl font-semibold leading-tight xl:text-4xl">
                Controle seus dados pessoais e direitos LGPD
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-white/78 sm:text-base">
                Gerencie consentimento biométrico, exporte seus dados, abra solicitações LGPD, consulte
                histórico de termos, entenda a revogação, leia o catálogo de tratamento, a política de
                privacidade e fale com o DPO.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 xl:w-[320px]">
            <Button
              type="button"
              size="lg"
              onClick={onExport}
              disabled={isExporting}
              className="h-12 w-full gap-1 bg-white text-[#0B1220] hover:bg-white/90"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Preparando JSON..." : "Exportar JSON"}
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={onNewRequest}
              className="h-12 w-full gap-1 bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
            >
              <FilePlus2 className="h-4 w-4" />
              Criar solicitação
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PrivacyHero;
