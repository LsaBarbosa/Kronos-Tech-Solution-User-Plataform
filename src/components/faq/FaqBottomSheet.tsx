import { useEffect, useRef, useState } from "react";
import { X, ArrowLeft, Search, BookOpen, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaqCategoryChips } from "./FaqCategoryChips";
import { FaqLoadingState } from "./FaqLoadingState";
import { FaqEmptyState } from "./FaqEmptyState";
import { FaqErrorState } from "./FaqErrorState";
import { FaqArticleView } from "./FaqArticleView";
import { useFaqSearch } from "@/hooks/useFaqSearch";
import type { FaqItem } from "@/types/faq";
import { cn } from "@/lib/utils";

interface FaqBottomSheetProps {
  open: boolean;
  onClose: () => void;
  screenKey?: string;
}

const truncate = (text: string, maxLength: number) =>
  text.length <= maxLength ? text : `${text.slice(0, maxLength).trimEnd()}…`;

export function FaqBottomSheet({ open, onClose, screenKey }: FaqBottomSheetProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, isLoading, isError, isEmpty } = useFaqSearch(query, screenKey);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 200);
      return () => window.clearTimeout(timer);
    } else {
      setQuery("");
      setSelectedCategory(null);
      setSelectedFaq(null);
    }
  }, [open]);

  const categories = Array.from(new Set(results.map((r) => r.category.name)));
  const filtered = selectedCategory ? results.filter((r) => r.category.name === selectedCategory) : results;
  const showResults = query.trim().length >= 1;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        side="bottom"
        className="flex flex-col gap-0 rounded-t-2xl p-0 overflow-hidden"
        style={{ height: "92dvh" }}
        aria-label="Central de Ajuda"
      >
        {/* Handle visual */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-1 w-10 rounded-full bg-border" aria-hidden="true" />
        </div>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-4 pb-3 shrink-0">
          {selectedFaq ? (
            <button
              type="button"
              onClick={() => setSelectedFaq(null)}
              aria-label="Voltar para a lista"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Voltar
            </button>
          ) : (
            <SheetTitle className="text-base font-semibold">Central de Ajuda</SheetTitle>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fechar ajuda"
            className="h-8 w-8 p-0 rounded-full"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Conteúdo principal */}
        {selectedFaq ? (
          /* Vista de artigo */
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <FaqArticleView faq={selectedFaq} onNavigate={onClose} />
          </div>
        ) : (
          /* Vista de lista */
          <div className="flex flex-1 flex-col overflow-hidden px-4">
            {/* Campo de busca */}
            <div className="relative mb-3 shrink-0">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none"
                aria-hidden="true"
              />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedCategory(null); }}
                placeholder="Buscar tutoriais e dúvidas…"
                aria-label="Campo de busca"
                className="pl-9 pr-8"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => { setQuery(""); setSelectedCategory(null); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Chips de categoria */}
            {showResults && !isLoading && categories.length > 1 && (
              <div className="mb-3 shrink-0">
                <FaqCategoryChips
                  categories={categories}
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </div>
            )}

            {/* Lista de resultados */}
            <div className="flex-1 overflow-y-auto pb-4">
              {!showResults && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Search className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1 max-w-[220px]">
                    <p className="text-sm font-medium">Buscar na Central de Ajuda</p>
                    <p className="text-xs text-muted-foreground">
                      Digite uma dúvida ou tema para encontrar o tutorial.
                    </p>
                  </div>
                </div>
              )}

              {showResults && isLoading && <FaqLoadingState count={3} />}
              {showResults && isError && <FaqErrorState />}
              {showResults && !isLoading && !isError && isEmpty && (
                <FaqEmptyState message="Nenhum resultado encontrado." />
              )}

              {showResults && !isLoading && !isError && filtered.length > 0 && (
                <ul className="divide-y divide-border/40" role="list">
                  {filtered.map((faq) => (
                    <li key={faq.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedFaq(faq)}
                        aria-label={`Abrir tutorial: ${faq.title}`}
                        className={cn(
                          "group w-full flex items-start gap-3 py-3.5 text-left",
                          "rounded-md transition-colors hover:bg-muted/50",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          "px-1 -mx-1"
                        )}
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                          <BookOpen className="h-4 w-4 text-muted-foreground/70 group-hover:text-primary transition-colors" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {faq.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {truncate(faq.shortAnswer, 110)}
                          </p>
                          <Badge variant="outline" className="h-4 px-1.5 text-[10px] font-normal">
                            {faq.category.name}
                          </Badge>
                        </div>
                        <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
