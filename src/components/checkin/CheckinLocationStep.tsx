import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { useCheckin } from '@/context/CheckinContext';
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
      <Card className="border-primary/20 bg-gradient-to-br from-[#F8FAFC] to-white">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <MapPin className="w-12 h-12 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Permitir Localização</h3>
              <CardDescription className="mt-1">
                Precisamos da sua localização para validar o registro de ponto.
              </CardDescription>
            </div>
          </div>
        </CardContent>
      </Card>

      {isReady && state.latitude && state.longitude && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-sm text-green-800">
              ✓ Localização capturada com sucesso.
              {state.accuracy && (
                <span className="block text-xs mt-1">
                  Precisão: ~{Math.round(state.accuracy)}m
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleRequestLocation}
        disabled={isRequesting || isReady}
        className="w-full"
        size="lg"
      >
        {isRequesting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Obtendo Localização...
          </>
        ) : isReady ? (
          <>
            <MapPin className="w-4 h-4 mr-2" />
            Localização Pronta
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4 mr-2" />
            Permitir Localização
          </>
        )}
      </Button>

      {isReady && (
        <p className="text-xs text-muted-foreground text-center">
          Próxima etapa: câmera para captura facial
        </p>
      )}
    </div>
  );
};
