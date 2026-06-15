import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FolderLock, ShieldCheck, Lock, UploadCloud } from "lucide-react";
import type { UploadScopeCopy } from "../upload-ui.helpers";

interface UploadHeroProps {
  variant: "desktop" | "mobile";
  scope: UploadScopeCopy;
  recipientName?: string;
}

const desktopBadges = [
  { label: "Upload protegido", icon: ShieldCheck },
  { label: "Compressão de imagem", icon: UploadCloud },
  { label: "Validação automática", icon: Lock },
];

const UploadHero = ({ variant, scope, recipientName }: UploadHeroProps) => {
  if (variant === "mobile") {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <div className="bg-[linear-gradient(135deg,#0B1220_0%,#101A33_52%,#1E3A8A_100%)] px-5 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-3">
              <div className="flex items-center gap-2">
                <FolderLock className="h-5 w-5 text-cyan-300" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                  Enviar documento
                </span>
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-semibold leading-tight">
                  Cofre de envio documental
                </h1>
                <p className="text-sm leading-6 text-white/78">
                  Envie documentos pessoais com escopo seguro e validação automática de tipo e tamanho.
                </p>
              </div>
            </div>
            <Badge className={cn("shrink-0 border-white/15", scope.badgeClass)}>{scope.badge}</Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="border-white/15 bg-white/10 text-white">PDF/JPG/PNG</Badge>
            <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-50">≤ 5MB</Badge>
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
              <Badge className="border-white/15 bg-white/10 text-white">Secure Upload Vault</Badge>
              <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-50">LGPD</Badge>
              <Badge className={cn("border-white/15", scope.badgeClass)}>{scope.badge}</Badge>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/68">
                Envio documental Kronos
              </p>
              <h1 className="text-3xl font-semibold leading-tight xl:text-4xl">
                Cofre de envio documental
              </h1>
              <p className="text-xl font-medium text-white/85">
                Envie documentos pessoais com escopo, validação e rastreabilidade
              </p>
              <p className="max-w-3xl text-sm leading-6 text-white/78 sm:text-base">
                Defina destinatário (quando permitido), selecione o arquivo e valide tipo/tamanho.
                Imagens podem ser comprimidas automaticamente antes do envio.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {desktopBadges.map(({ label, icon: Icon }) => (
                <Badge key={label} className="border-white/15 bg-white/10 px-3 py-1.5 text-white">
                  <Icon className="mr-2 h-3.5 w-3.5" />
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 xl:w-[300px]">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                Destinatário previsto
              </p>
              <p className="mt-2 text-sm leading-6 text-white/85">
                {recipientName ?? "Selecione um colaborador ou utilize o seu próprio perfil."}
              </p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">
                {scope.title}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UploadHero;
