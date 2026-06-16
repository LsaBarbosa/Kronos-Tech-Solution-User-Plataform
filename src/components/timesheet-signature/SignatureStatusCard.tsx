import { CalendarCheck, FileSignature, Download } from "lucide-react";
import type { PreviousMonthSignatureStatus } from "@/types/timesheet-signature";
import { Button } from "@/components/ui/button";

const monthLabel = (year: number, month: number): string => {
  const date = new Date(year, month - 1, 1);
  const formatted = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const formatDateTime = (iso: string | null): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  } catch {
    return iso;
  }
};

interface SignatureStatusCardProps {
  status: PreviousMonthSignatureStatus;
  onDownloadSigned?: (signatureId: string) => void;
}

const SignatureStatusCard = ({ status, onDownloadSigned }: SignatureStatusCardProps) => {
  const label = monthLabel(status.referenceYear, status.referenceMonth);

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-[#F8FAFC] to-white p-5 dark:border-[#404854] dark:from-slate-800/50 dark:to-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <CalendarCheck className="h-4 w-4" />
            Mês de referência
          </div>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{label}</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Período: {status.periodStart} – {status.periodEnd}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {status.alreadySigned && status.signatureId ? (
        <div className="mt-5 space-y-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/30">
          <div className="flex items-start gap-2">
            <FileSignature className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-300" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                Assinado em {formatDateTime(status.signedAt)}
              </p>
              <p className="text-xs text-emerald-900/80 dark:text-emerald-100/80">
                O PDF baixado contém carimbo visual de assinatura eletrônica e está assinado
                digitalmente (PAdES) pelo certificado da empresa.
              </p>
              <p className="text-xs text-emerald-900/80 dark:text-emerald-100/80 break-all">
                Hash espelho: {status.pointMirrorHashSha256}
              </p>
              <p className="text-xs text-emerald-900/80 dark:text-emerald-100/80 break-all">
                Hash registros: {status.recordsSnapshotHashSha256}
              </p>
            </div>
          </div>
          {onDownloadSigned ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-900/40 dark:text-emerald-100"
              onClick={() => onDownloadSigned(status.signatureId!)}
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar documento assinado
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

const StatusBadge = ({ status }: { status: PreviousMonthSignatureStatus }) => {
  if (status.alreadySigned) {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-100">
        Assinado
      </span>
    );
  }
  if (status.eligible) {
    return (
      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-900/40 dark:text-violet-100">
        Pronto para assinar
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
      Bloqueado
    </span>
  );
};

export default SignatureStatusCard;
