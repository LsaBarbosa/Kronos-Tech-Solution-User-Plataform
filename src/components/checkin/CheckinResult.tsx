import { CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCheckin } from '@/hooks/useCheckin';

export const CheckinResult = () => {
  const { state, closeCheckin, resetCheckin } = useCheckin();

  const handleClose = () => {
    resetCheckin();
    closeCheckin();
  };

  const result = state.result;

  return (
    <div className="space-y-4">
      <Card className="border border-[#BBF7D0] bg-[#DCFCE7] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#15803D] shadow-[0_8px_20px_rgba(22,163,74,0.18)]"
          >
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold leading-5 text-[#15803D]">Registro realizado com sucesso</p>
            <p className="text-[11px] leading-5 text-[#15803D]/85 sm:text-xs">
              Sua marcação foi validada pelo servidor e arquivada para auditoria.
            </p>
            {result?.actionType ? (
              <span className="mt-1 inline-flex max-w-full rounded-full border border-[#BBF7D0] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.03em] text-[#15803D] sm:text-[11px]">
                Tipo: {result.actionType}
              </span>
            ) : null}
          </div>
        </div>
      </Card>

      {result?.message ? (
        <Card className="border border-[#E2E8F0] bg-white p-4 shadow-[0_10px_30px_rgba(11,18,32,0.06)]">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1D4ED8]"
            >
              <Clock className="h-4 w-4" />
            </span>
            <p className="break-words text-xs leading-6 text-[#0F172A] sm:text-sm">{result.message}</p>
          </div>
        </Card>
      ) : null}

      <Button
        onClick={handleClose}
        size="lg"
        className="h-12 w-full gap-2 rounded-2xl bg-[#102A43] px-3 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(16,42,67,0.18)] hover:bg-[#1F4E5F] sm:text-sm"
      >
        Fechar
      </Button>
    </div>
  );
};
