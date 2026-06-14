import { AlertCircle, FileText, History, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";
import { shortHashValue } from "@/features/user-profile/utils/mask-sensitive-data";
import type { UsuarioConsentHistorySummary } from "@/features/user-profile/mappers/usuario-profile.mapper";

interface ConsentEvidenceListProps {
  items: UsuarioConsentHistorySummary[];
  loading?: boolean;
  error?: string | null;
}

const ConsentEvidenceList = ({
  items,
  loading = false,
  error,
}: ConsentEvidenceListProps) => {
  const evidenceCount = items.filter((item) => item.evidenceAvailable).length;

  if (error) {
    return (
      <Card className="rounded-[24px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-lg text-[#102A43]">Histórico de consentimentos</CardTitle>
              <CardDescription className="max-w-2xl text-[#627D98]">
                Evidências resumidas dos consentimentos do seu próprio perfil. Registros completos permanecem protegidos.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-[#D8E2EC] bg-[#D9E2EB] text-[#635BFF]">
              <History className="mr-1 h-3.5 w-3.5" />
              Erro
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-red-700" aria-hidden="true" />
              <div className="space-y-1">
                <p className="font-medium">Nao foi possivel carregar o histórico</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading && items.length === 0) {
    return (
      <Card className="rounded-[24px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
        <CardHeader className="space-y-2">
          <div className="h-5 w-56 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded-full bg-slate-100" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[24px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg text-[#102A43]">Histórico de consentimentos</CardTitle>
            <CardDescription className="max-w-2xl text-[#627D98]">
              Evidências resumidas dos consentimentos do seu próprio perfil. Registros completos permanecem protegidos.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-[#D8E2EC] bg-[#D9E2EB] text-[#635BFF]">
            <History className="mr-1 h-3.5 w-3.5" />
            {items.length} registros
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <EmptyState
            compact
            icon={<FileText className="h-6 w-6" />}
            title="Sem evidências registradas"
            description="Nenhum consentimento foi encontrado para o usuário autenticado."
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-[#D8E2EC] bg-[#D9E2EB] text-[#102A43]">
                {evidenceCount} com evidência
              </Badge>
              <Badge variant="outline" className="border-[#D8E2EC] bg-[#D9E2EB] text-[#102A43]">
                {items.length - evidenceCount} sem documento
              </Badge>
            </div>

            <ScrollArea className="h-[420px] rounded-[22px] border border-[#D8E2EC] bg-white">
              <div className="space-y-3 p-4">
                {items.map((item) => (
                  <article
                    key={item.consentId}
                    className={cn(
                      "rounded-2xl border p-4 shadow-sm",
                      item.statusTone === "active"
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#102A43]">{item.title}</p>
                        <p className="text-xs text-[#627D98]">
                          {item.typeLabel} • Versão {item.version} • {item.legalBasis}
                        </p>
                      </div>
                      <StatusPill variant={item.statusTone}>{item.statusLabel}</StatusPill>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-2xl border border-[#D8E2EC] bg-white p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Concedido em</p>
                        <p className="mt-1 text-sm font-medium text-[#102A43]">{item.grantedAtLabel}</p>
                      </div>
                      <div className="rounded-2xl border border-[#D8E2EC] bg-white p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Revogado em</p>
                        <p className="mt-1 text-sm font-medium text-[#102A43]">{item.revokedAtLabel}</p>
                      </div>
                      <div className="rounded-2xl border border-[#D8E2EC] bg-white p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Evidência</p>
                        <p className="mt-1 text-sm font-medium text-[#102A43]">
                          {item.evidenceAvailable
                            ? `Documento ${shortHashValue(item.evidenceDocumentId)}`
                            : "Sem documento armazenado"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[#D8E2EC] bg-[#D9E2EB] p-3 text-xs text-[#627D98]">
                        <p className="font-semibold uppercase tracking-[0.18em] text-[#627D98]">Aceite a partir de</p>
                        <p className="mt-1 text-sm font-medium text-[#102A43]">{item.acceptedFrom}</p>
                      </div>
                      <div className="rounded-2xl border border-[#D8E2EC] bg-[#D9E2EB] p-3 text-xs text-[#627D98]">
                        <p className="font-semibold uppercase tracking-[0.18em] text-[#627D98]">Revogação a partir de</p>
                        <p className="mt-1 text-sm font-medium text-[#102A43]">{item.revokedFrom}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsentEvidenceList;
