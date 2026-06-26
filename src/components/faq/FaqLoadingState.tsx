import { Skeleton } from "@/components/ui/skeleton";

interface FaqLoadingStateProps {
  count?: number;
}

export function FaqLoadingState({ count = 3 }: FaqLoadingStateProps) {
  return (
    <div role="status" aria-live="polite" aria-label="Carregando perguntas frequentes" className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-md border p-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      ))}
    </div>
  );
}
