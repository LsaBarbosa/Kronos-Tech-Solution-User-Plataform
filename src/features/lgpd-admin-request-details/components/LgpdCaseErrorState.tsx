import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LgpdCaseErrorStateProps {
  message: string;
  onBack: () => void;
}

export const LgpdCaseErrorState = ({ message, onBack }: LgpdCaseErrorStateProps) => (
  <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-3 rounded-2xl border border-[#FECACA] bg-[#FEE2E2] px-6 py-12 text-center">
    <AlertCircle className="h-10 w-10 text-[#B91C1C]" />
    <p className="text-sm font-semibold text-[#7F1D1D]">Não foi possível carregar o caso</p>
    <p className="max-w-md text-xs text-[#B91C1C]">{message}</p>
    <Button
      type="button"
      onClick={onBack}
      className="mt-1 rounded-2xl bg-[#B91C1C] px-4 text-sm font-semibold text-white hover:bg-[#7F1D1D]"
    >
      Voltar para lista
    </Button>
  </div>
);

export default LgpdCaseErrorState;
