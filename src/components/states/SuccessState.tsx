import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessStateProps {
  title: string;
  description?: string;
  className?: string;
}

export const SuccessState = ({ title, description, className }: SuccessStateProps) => (
  <div
    role="status"
    aria-live="polite"
    className={cn("flex flex-col items-center justify-center gap-3 py-8 text-center", className)}
  >
    <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  </div>
);
