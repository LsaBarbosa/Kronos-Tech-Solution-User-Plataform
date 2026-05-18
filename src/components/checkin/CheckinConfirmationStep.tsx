import { CheckCircle, Loader2, RefreshCcw, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCheckin } from '@/context/CheckinContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

  const handleRefazer = () => {
    // This would need to be handled by navigating back to camera step
    // For now, we'll just go back to idle state
  };

  const now = format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", {
    locale: ptBR,
  });

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-[#F8FAFC] to-white">
        <CardHeader>
          <CardTitle className="text-base">Confirmação de Registro</CardTitle>
          <CardDescription>Verifique os dados antes de confirmar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Localização capturada</p>
                <p className="text-xs text-muted-foreground">
                  {state.latitude?.toFixed(6)}, {state.longitude?.toFixed(6)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Imagem facial capturada</p>
                <p className="text-xs text-muted-foreground">Validação será feita pelo servidor</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Data e Hora</p>
                <p className="text-xs text-muted-foreground">{now}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-xs text-amber-800">
              Ao confirmar, sua marcação será enviada para validação. O resultado será exibido na próxima etapa.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          onClick={handleRefazer}
          variant="outline"
          disabled={isSubmitting}
          className="flex-1"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refazer Foto
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="flex-1"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Confirmando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Confirmar Registro
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
