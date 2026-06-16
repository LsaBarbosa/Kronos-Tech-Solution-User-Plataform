import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LgpdErrorPanelProps {
  message: string;
  onRetry: () => void;
  isLoading: boolean;
}

export const LgpdErrorPanel = ({ message, onRetry, isLoading }: LgpdErrorPanelProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#FECACA] bg-[#FEE2E2] px-6 py-12 text-center">
      <AlertCircle className="h-10 w-10 text-[#B91C1C]" />
      <p className="text-sm font-semibold text-[#7F1D1D]">Erro ao carregar solicitações</p>
      <p className="max-w-md text-xs text-[#B91C1C]">{message}</p>
      <Button
        type="button"
        onClick={onRetry}
        disabled={isLoading}
        className="mt-1 gap-2 rounded-2xl bg-[#B91C1C] px-4 text-sm font-semibold text-white hover:bg-[#7F1D1D] disabled:opacity-60"
      >
        <RotateCcw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  );
};

export default LgpdErrorPanel;
