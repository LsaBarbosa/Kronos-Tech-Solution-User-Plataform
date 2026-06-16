import { AlertTriangle } from "lucide-react";

interface SignaturePendingBlockersProps {
  blockers: string[];
}

const SignaturePendingBlockers = ({ blockers }: SignaturePendingBlockersProps) => {
  if (blockers.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Pendências impedindo a assinatura
          </h3>
          <p className="text-xs text-amber-900/80 dark:text-amber-100/80">
            Resolva os itens abaixo (pelos canais internos) antes de assinar o ponto:
          </p>
          <ul className="list-inside list-disc space-y-1 text-xs text-amber-900 dark:text-amber-100">
            {blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignaturePendingBlockers;
