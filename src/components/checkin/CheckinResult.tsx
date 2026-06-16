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
      <Card className="border border-[#BBF7D0] bg-[#DCFCE7] p-5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#15803D] shadow-[0_8px_20px_rgba(22,163,74,0.18)]"
          >
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-[#15803D]">Registro realizado com sucesso</p>
            <p className="text-xs leading-5 text-[#15803D]/85">
              Sua marcação foi validada pelo servidor e arquivada para auditoria.
            </p>
            {result?.actionType ? (
              <span className="mt-1 inline-flex rounded-full border border-[#BBF7D0] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#15803D]">
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
            <p className="text-sm leading-6 text-[#0F172A]">{result.message}</p>
          </div>
        </Card>
      ) : null}

      <Button
        onClick={handleClose}
        size="lg"
        className="h-12 w-full gap-2 rounded-2xl bg-[#102A43] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(16,42,67,0.18)] hover:bg-[#1F4E5F]"
      >
        Fechar
      </Button>
    </div>
  );
};
