import { useState } from "react";
import { HelpCircle, ChevronRight, BookOpen } from "lucide-react";
import { useContextualFaqs } from "@/hooks/useContextualFaqs";
import { FaqLoadingState } from "./FaqLoadingState";
import { FaqEmptyState } from "./FaqEmptyState";
import { FaqErrorState } from "./FaqErrorState";
import { FaqArticleView } from "./FaqArticleView";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/types/faq";

interface FaqContextualBlockProps {
  screenKey: string;
  limit?: number;
  className?: string;
}

export function FaqContextualBlock({ screenKey, limit = 5, className }: FaqContextualBlockProps) {
  const { items, isLoading, isError, isEmpty } = useContextualFaqs(screenKey, limit);
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);

  return (
    <section
      aria-label="Perguntas frequentes desta tela"
      className={cn("rounded-xl border bg-card shadow-sm overflow-hidden", className)}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <HelpCircle className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            {selectedFaq ? "Tutorial" : "Dúvidas frequentes"}
          </h2>
        </div>
        {!selectedFaq && !isLoading && items.length > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {items.length} {items.length === 1 ? "artigo" : "artigos"}
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="px-4 py-3">
        {isLoading && <FaqLoadingState count={3} />}
        {isError && <FaqErrorState message="Não foi possível carregar as perguntas desta tela." />}
        {isEmpty && !isLoading && !isError && (
          <FaqEmptyState message="Sem perguntas para esta tela." />
        )}

        {!isLoading && !isError && items.length > 0 && (
          <>
            {selectedFaq ? (
              <FaqArticleView
                faq={selectedFaq}
                onBack={() => setSelectedFaq(null)}
                showBackButton
              />
            ) : (
              <ul className="divide-y divide-border/60" role="list">
                {items.map((faq) => (
                  <li key={faq.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedFaq(faq)}
                      aria-label={`Ver tutorial: ${faq.title}`}
                      className="group w-full flex items-start gap-3 py-3 text-left transition-colors hover:bg-muted/40 rounded-md px-1 -mx-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60 group-hover:text-primary transition-colors" aria-hidden="true" />
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {faq.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {faq.shortAnswer}
                        </p>
                        <Badge variant="outline" className="text-xs h-5 px-1.5 font-normal">
                          {faq.category.name}
                        </Badge>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  );
}
