import { CheckCircle2, Loader2, MapPin, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCheckin } from '@/hooks/useCheckin';
import { useEffect } from 'react';

export const CheckinLocationStep = () => {
  const { state, requestLocation, requestCamera, clearError } = useCheckin();
  const isRequesting = state.status === 'requesting_location';
  const isReady = state.status === 'location_ready';

  useEffect(() => {
    if (state.status === 'idle' && state.error) {
      clearError();
    }
  }, [state.status, state.error, clearError]);

  const handleRequestLocation = async () => {
    try {
      await requestLocation();
      setTimeout(() => {
        requestCamera().catch(() => {
          // Error is handled by context
        });
      }, 300);
    } catch {
      // Error is handled by context and displayed in modal
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border border-[#E2E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(11,18,32,0.06)]">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1D4ED8]"
          >
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#0F172A]">Permitir geolocalização</p>
            <p className="text-xs leading-5 text-[#64748B]">
              O Kronos usa a sua localização apenas para validar o registro de ponto dentro do raio
              autorizado pela empresa.
            </p>
          </div>
        </div>
      </Card>

      {isReady && state.latitude && state.longitude ? (
        <Card className="border border-[#BBF7D0] bg-[#DCFCE7] p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#15803D]" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#15803D]">Localização capturada</p>
              <p className="text-xs leading-5 text-[#15803D]/85">
                Coordenadas registradas com sucesso.
                {state.accuracy ? (
                  <span className="block text-[11px] text-[#15803D]/75">
                    Precisão estimada: ~{Math.round(state.accuracy)} m
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <Button
        onClick={handleRequestLocation}
        disabled={isRequesting || isReady}
        size="lg"
        className="h-12 w-full gap-2 rounded-2xl bg-[#2563EB] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] hover:bg-[#1D4ED8] disabled:opacity-70"
      >
        {isRequesting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Obtendo localização...
          </>
        ) : isReady ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Localização pronta
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4" />
            Permitir localização
          </>
        )}
      </Button>

      {isReady ? (
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.14em] text-[#94A3B8]">
          Próxima etapa: captura facial
        </p>
      ) : null}
    </div>
  );
};
