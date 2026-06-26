import { Badge } from "@/components/ui/badge";
import type { FaqItem } from "@/types/faq";
import { cn } from "@/lib/utils";

interface FaqSearchResultsProps {
  results: FaqItem[];
  selectedId?: string | null;
  onSelect: (faq: FaqItem) => void;
}

const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
};

export function FaqSearchResults({ results, selectedId, onSelect }: FaqSearchResultsProps) {
  return (
    <ul role="listbox" aria-label="Resultados da busca" className="space-y-1">
      {results.map((faq) => (
        <li key={faq.id} role="option" aria-selected={selectedId === faq.id}>
          <button
            type="button"
            onClick={() => onSelect(faq)}
            className={cn(
              "w-full rounded-md border px-3 py-3 text-left transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selectedId === faq.id
                ? "border-primary bg-primary/5"
                : "border-transparent bg-muted/40 hover:bg-muted"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-snug">{faq.title}</p>
              <Badge variant="outline" className="shrink-0 text-xs">
                {faq.category.name}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {truncate(faq.shortAnswer, 100)}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}
