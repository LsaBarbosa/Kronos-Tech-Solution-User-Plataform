import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckinButton } from './CheckinButton';
import ClockComponent from '@/components/Clock';
import { cn } from '@/lib/utils';

export const CheckinDashboardCard = () => {
  const dashboardCardClassName = 'border border-border bg-card shadow-sm hover:shadow-md transition-shadow rounded-xl cursor-pointer';
  const interactiveCardClassName = 'hover:shadow-md hover:scale-[1.02] transition-all duration-300';

  return (
    <Card className={cn(dashboardCardClassName, interactiveCardClassName)}>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Registro de Ponto</p>
            <p className="text-sm text-muted-foreground">Marque sua entrada ou saída</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-background p-3 border border-border">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Horário local</p>
              <div className="text-sm font-semibold text-foreground">
                <ClockComponent />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            ✓ A marcação será validada por localização e biometria facial.
          </p>

          <CheckinButton />
        </div>
      </CardContent>
    </Card>
  );
};
