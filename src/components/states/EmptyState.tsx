import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export const EmptyState = ({ title, description, icon, className }: EmptyStateProps) => (
  <div
    className={cn("flex flex-col items-center justify-center gap-3 py-8 text-center", className)}
    aria-live="polite"
  >
    <div className="text-muted-foreground" aria-hidden="true">
      {icon ?? <FileText className="h-10 w-10" />}
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  </div>
);
