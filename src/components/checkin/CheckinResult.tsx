import { CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCheckin } from '@/context/CheckinContext';

export const CheckinResult = () => {
  const { state, closeCheckin, resetCheckin } = useCheckin();

  const handleClose = () => {
    resetCheckin();
    closeCheckin();
  };

  const result = state.result;

  return (
    <div className="space-y-4">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Registro Realizado com Sucesso</h3>
              {result?.actionType && (
                <p className="text-xs text-green-700 mt-1">
                  Tipo: {result.actionType}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {result?.message && (
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{result.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleClose}
        className="w-full"
        size="lg"
      >
        Fechar
      </Button>
    </div>
  );
};
