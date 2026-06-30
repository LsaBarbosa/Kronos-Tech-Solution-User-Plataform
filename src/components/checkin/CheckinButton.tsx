import { Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCheckin } from '@/hooks/useCheckin';
import { useAuth } from '@/context/AuthContext';

export const CheckinButton = () => {
  const { state, openCheckin } = useCheckin();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  if (user?.profile?.terminalFlag) {
    return null;
  }

  const isLoading = state.status === 'submitting';

  return (
    <Button
      onClick={openCheckin}
      disabled={isLoading}
      size="sm"
      variant="default"
      className="gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Registrando...
        </>
      ) : (
        <>
          <Clock className="w-4 h-4" />
          Registrar Ponto
        </>
      )}
    </Button>
  );
};
