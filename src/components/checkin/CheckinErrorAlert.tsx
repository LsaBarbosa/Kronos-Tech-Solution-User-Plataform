import { AlertCircle, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCheckin } from '@/hooks/useCheckin';

export const CheckinErrorAlert = () => {
  const { state, retry, closeCheckin } = useCheckin();
  const error = state.error;

  if (!error) {
    return null;
  }

  const getErrorTitle = (code: string): string => {
    switch (code) {
      case 'LOCATION_PERMISSION_DENIED':
        return 'Permissão de Localização Negada';
      case 'LOCATION_UNAVAILABLE':
        return 'Localização Indisponível';
      case 'LOCATION_TIMEOUT':
        return 'Tempo Limite de Localização';
      case 'CAMERA_PERMISSION_DENIED':
        return 'Permissão de Câmera Negada';
      case 'CAMERA_UNAVAILABLE':
        return 'Câmera Indisponível';
      case 'SESSION_EXPIRED':
        return 'Sessão Expirada';
      case 'FACE_NOT_RECOGNIZED':
        return 'Rosto Não Reconhecido';
      case 'OUT_OF_ALLOWED_RADIUS':
        return 'Fora da Área Permitida';
      case 'NETWORK_ERROR':
        return 'Erro de Conexão';
      default:
        return 'Erro ao Registrar Ponto';
    }
  };

  const handleRetry = async () => {
    try {
      await retry();
    } catch {
      // Error is handled by context
    }
  };

  const shouldShowSettings = error.code === 'LOCATION_PERMISSION_DENIED' ||
    error.code === 'CAMERA_PERMISSION_DENIED';

  return (
    <div className="space-y-4">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">{getErrorTitle(error.code)}</h3>
              <p className="text-sm text-red-800 mt-1">{error.message}</p>
              {shouldShowSettings && (
                <p className="text-xs text-red-700 mt-2">
                  Abra as configurações do navegador para autorizar a permissão.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={closeCheckin}
          variant="outline"
          className="flex-1"
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button
          onClick={handleRetry}
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    </div>
  );
};
