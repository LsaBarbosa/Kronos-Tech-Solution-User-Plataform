import { CalendarClock, Loader2, MapPin, Send, UserCheck, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCheckin } from '@/hooks/useCheckin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReviewLineProps {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: string;
}

const ReviewLine = ({ icon: Icon, iconClass, label, value }: ReviewLineProps) => (
  <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
    <span
      aria-hidden="true"
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
    >
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0 space-y-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
        {label}
      </p>
      <p className="text-sm font-medium text-[#0F172A] break-words">{value}</p>
    </div>
  </div>
);

export const CheckinConfirmationStep = () => {
  const { state, submitCheckin } = useCheckin();
  const isSubmitting = state.status === 'submitting';

  const handleConfirm = async () => {
    try {
      await submitCheckin();
    } catch {
      // Error is handled by context
    }
  };

  const now = format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", {
    locale: ptBR,
  });

  const coords =
    state.latitude !== null && state.longitude !== null
      ? `${state.latitude?.toFixed(6)}, ${state.longitude?.toFixed(6)}`
      : '—';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <ReviewLine
          icon={MapPin}
          iconClass="bg-[#EFF6FF] text-[#1D4ED8]"
          label="Localização"
          value={coords}
        />
        <ReviewLine
          icon={UserCheck}
          iconClass="bg-[#EDE9FE] text-[#5B21B6]"
          label="Imagem facial"
          value="Capturada — validação no servidor"
        />
        <ReviewLine
          icon={CalendarClock}
          iconClass="bg-[#DCFCE7] text-[#15803D]"
          label="Data e hora"
          value={now}
        />
      </div>

      <Card className="border border-[#FCD34D] bg-[#FEF3C7] p-3">
        <p className="text-xs leading-5 text-[#92400E]">
          Ao confirmar, sua marcação será enviada para validação. O resultado aparecerá na próxima
          etapa.
        </p>
      </Card>

      <Button
        onClick={handleConfirm}
        disabled={isSubmitting}
        size="lg"
        className="h-12 w-full gap-2 rounded-2xl bg-[#2563EB] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] hover:bg-[#1D4ED8] disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Confirmando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Confirmar registro
          </>
        )}
      </Button>
    </div>
  );
};
