import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, FolderLock, ShieldCheck, Lock, FileSearch, UploadCloud } from "lucide-react";
import { APP_PATHS } from "@/config/app-routes";
import type { DocumentScopeCopy } from "../documents-ui.helpers";

interface DocumentsHeroProps {
  variant: "desktop" | "mobile";
  scope: DocumentScopeCopy;
}

const desktopBadges = [
  { label: "Escopo por permissão", icon: ShieldCheck },
  { label: "Download rastreável", icon: FileSearch },
  { label: "Acesso protegido", icon: Lock },
];

const DocumentsHero = ({ variant, scope }: DocumentsHeroProps) => {
  if (variant === "mobile") {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <div className="bg-gradient-to-br from-[#102A43] via-[#1F4E5F] to-[#102A43] px-5 py-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-3">
              <div className="flex items-center gap-2">
                <FolderLock className="h-5 w-5 text-cyan-300" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                  Documentos
                </span>
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-semibold leading-tight">Busca documental</h1>
                <p className="text-sm leading-6 text-white/78">
                  Encontre documentos trabalhistas com escopo seguro: colaborador, tipo e visibilidade.
                </p>
              </div>
            </div>
            <Badge className={cn("shrink-0 border-white/15", scope.badgeClass)}>{scope.badge}</Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="border-white/15 bg-white/10 text-white">Busca segura</Badge>
            <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-50">LGPD</Badge>
          </div>

          <Button
            asChild
            size="sm"
            className="mt-4 h-11 w-full gap-1 bg-white text-[#0B1220] hover:bg-white/90"
          >
            <Link to={APP_PATHS.enviarDocumentoColaborador}>
              <UploadCloud className="h-4 w-4" />
              Enviar documento
              <ArrowUpRight className="ml-auto h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-border/70 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.55)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.20),transparent_30%)]" />
      <div className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />

      <div className="relative bg-gradient-to-br from-[#102A43] via-[#1F4E5F] to-[#102A43] px-6 py-7 text-white sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/15 bg-white/10 text-white">Secure Document Vault</Badge>
              <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-50">LGPD</Badge>
              <Badge className={cn("border-white/15", scope.badgeClass)}>{scope.badge}</Badge>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/68">
                Documentos Kronos
              </p>
              <h1 className="text-3xl font-semibold leading-tight xl:text-4xl">Busca documental</h1>
              <p className="text-xl font-medium text-white/85">
                Encontre documentos trabalhistas com escopo seguro
              </p>
              <p className="max-w-3xl text-sm leading-6 text-white/78 sm:text-base">
                Selecione colaborador (quando permitido), tipo documental e data. A visibilidade,
                o download e a exclusão respeitam a sua permissão e ficam registrados para auditoria.
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
                Operação atual
              </p>
              <p className="mt-2 text-sm leading-6 text-white/85">{scope.description}</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">
                {scope.title}
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="h-12 w-full gap-1 bg-white text-[#0B1220] hover:bg-white/90"
            >
              <Link to={APP_PATHS.enviarDocumentoColaborador}>
                <UploadCloud className="h-4 w-4" />
                Enviar documento
                <ArrowUpRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DocumentsHero;
