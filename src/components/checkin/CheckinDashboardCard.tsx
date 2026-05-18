import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckinButton } from './CheckinButton';
import ClockComponent from '@/components/Clock';
import { cn } from '@/lib/utils';

export const CheckinDashboardCard = () => {
  const dashboardCardClassName = 'border-0 bg-gradient-to-br from-[#F8FAFC] to-white shadow-sm hover:shadow-md transition-shadow rounded-xl cursor-pointer';
  const interactiveCardClassName = 'hover:shadow-md hover:scale-[1.02] transition-all duration-300';

  return (
    <Card className={cn(dashboardCardClassName, interactiveCardClassName)}>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#3B82F6]">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-semibold text-[#111827]">Registro de Ponto</p>
            <p className="text-sm text-[#6B7280]">Marque sua entrada ou saída</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-white/50 p-3 border border-[#E5E7EB]">
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Horário local</p>
              <p className="text-sm font-semibold text-[#111827]">
                <ClockComponent />
              </p>
            </div>
          </div>

          <p className="text-xs text-[#6B7280]">
            ✓ A marcação será validada por localização e biometria facial.
          </p>

          <CheckinButton />
        </div>
      </CardContent>
    </Card>
  );
};
