import { cn } from "@/lib/utils";

interface FaqCategoryChipsProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export function FaqCategoryChips({ categories, selected, onSelect }: FaqCategoryChipsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar por categoria"
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
    >
      <button
        type="button"
        role="tab"
        aria-selected={selected === null}
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          selected === null
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-muted text-muted-foreground hover:bg-muted/80"
        )}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          role="tab"
          aria-selected={selected === cat}
          onClick={() => onSelect(cat)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            selected === cat
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
