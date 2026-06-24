import { HelpCircle } from "lucide-react";

interface FaqEmptyStateProps {
  message?: string;
}

export function FaqEmptyState({
  message = "Nenhuma pergunta encontrada.",
}: FaqEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground">
      <HelpCircle className="h-8 w-8 opacity-40" aria-hidden="true" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
