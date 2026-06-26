import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FaqErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function FaqErrorState({
  message = "Não foi possível carregar as perguntas. Tente novamente.",
  onRetry,
}: FaqErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 py-8 text-destructive"
    >
      <AlertCircle className="h-8 w-8 opacity-70" aria-hidden="true" />
      <p className="text-sm text-center">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} aria-label="Tentar carregar as perguntas novamente">
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
