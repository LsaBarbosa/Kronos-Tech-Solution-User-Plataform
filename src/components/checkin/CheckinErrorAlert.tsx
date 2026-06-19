import { AlertOctagon, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCheckin } from '@/hooks/useCheckin';

const getErrorTitle = (code: string): string => {
  switch (code) {
    case 'LOCATION_PERMISSION_DENIED':
      return 'Permissão de localização negada';
    case 'LOCATION_UNAVAILABLE':
      return 'Localização indisponível';
    case 'LOCATION_TIMEOUT':
      return 'Tempo limite ao obter localização';
    case 'CAMERA_PERMISSION_DENIED':
      return 'Permissão de câmera negada';
    case 'CAMERA_UNAVAILABLE':
      return 'Câmera indisponível';
    case 'SESSION_EXPIRED':
      return 'Sessão expirada';
    case 'FACE_NOT_RECOGNIZED':
      return 'Rosto não reconhecido';
    case 'OUT_OF_ALLOWED_RADIUS':
      return 'Fora da área permitida';
    case 'NETWORK_ERROR':
      return 'Erro de conexão';
    default:
      return 'Erro ao registrar ponto';
  }
};

export const CheckinErrorAlert = () => {
  const { state, retry, closeCheckin } = useCheckin();
  const error = state.error;

  if (!error) {
    return null;
  }

  const handleRetry = async () => {
    try {
      await retry();
    } catch {
      // Error is handled by context
    }
  };

  const shouldShowSettings =
    error.code === 'LOCATION_PERMISSION_DENIED' || error.code === 'CAMERA_PERMISSION_DENIED';

  return (
    <div className="space-y-4">
      <Card className="border border-[#FECACA] bg-[#FEE2E2] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#B91C1C] shadow-[0_8px_20px_rgba(220,38,38,0.18)]"
          >
            <AlertOctagon className="h-5 w-5" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold leading-5 text-[#7F1D1D]">{getErrorTitle(error.code)}</p>
            <p className="break-words text-[11px] leading-5 text-[#B91C1C] sm:text-xs">{error.message}</p>
            {shouldShowSettings ? (
              <p className="text-[10px] leading-5 text-[#B91C1C]/85 sm:text-[11px]">
                Abra as configurações do navegador para autorizar a permissão e tente novamente.
              </p>
            ) : null}
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-2 min-[426px]:flex-row">
        <Button
          onClick={closeCheckin}
          variant="outline"
          className="h-11 w-full gap-2 rounded-2xl border-[#E2E8F0] px-3 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9] min-[426px]:flex-1 sm:text-sm"
        >
          <X className="h-4 w-4" />
          Cancelar
        </Button>
        <Button
          onClick={handleRetry}
          className="h-11 w-full gap-2 rounded-2xl bg-[#2563EB] px-3 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] hover:bg-[#1D4ED8] min-[426px]:flex-1 sm:text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
};
