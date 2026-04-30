import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export const ErrorState = ({
  title = "Não foi possível concluir a operação.",
  description,
  action,
  className,
}: ErrorStateProps) => (
  <div
    role="alert"
    className={cn("flex flex-col items-center justify-center gap-3 py-8 text-center", className)}
  >
    <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {action}
  </div>
);
