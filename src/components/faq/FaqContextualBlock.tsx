import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { useContextualFaqs } from "@/hooks/useContextualFaqs";
import { FaqLoadingState } from "./FaqLoadingState";
import { FaqEmptyState } from "./FaqEmptyState";
import { FaqErrorState } from "./FaqErrorState";
import { FaqArticleView } from "./FaqArticleView";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/types/faq";

interface FaqContextualBlockProps {
  /** Screen key da tela atual */
  screenKey: string;
  /** Número máximo de itens a exibir */
  limit?: number;
  /** Classe CSS extra */
  className?: string;
}

/**
 * Exibe FAQs contextuais relevantes para a tela informada.
 * Apenas renderiza o que o back-end retorna — não decide por role no front-end.
 */
export function FaqContextualBlock({ screenKey, limit = 5, className }: FaqContextualBlockProps) {
  const { items, isLoading, isError, isEmpty } = useContextualFaqs(screenKey, limit);
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);

  return (
    <section
      aria-label="Perguntas frequentes desta tela"
      className={cn("rounded-lg border bg-card p-4 space-y-3", className)}
    >
      <div className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold">Perguntas frequentes</h2>
      </div>

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
            <Accordion type="single" collapsible className="w-full">
              {items.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border-b last:border-0">
                  <AccordionTrigger
                    className="text-left text-sm font-medium py-3"
                    aria-label={`Expandir resposta: ${faq.title}`}
                  >
                    <div className="flex flex-col gap-1 pr-2">
                      <span>{faq.title}</span>
                      <Badge variant="outline" className="w-fit text-xs">
                        {faq.category.name}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pb-1">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {faq.shortAnswer}
                      </p>
                      <button
                        type="button"
                        className="text-xs text-primary underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => setSelectedFaq(faq)}
                        aria-label={`Ver resposta completa: ${faq.title}`}
                      >
                        Ver resposta completa
                      </button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </>
      )}
    </section>
  );
}
