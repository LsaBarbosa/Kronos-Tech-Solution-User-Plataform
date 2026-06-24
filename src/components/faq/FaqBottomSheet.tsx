import { useEffect, useRef, useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaqCategoryChips } from "./FaqCategoryChips";
import { FaqLoadingState } from "./FaqLoadingState";
import { FaqEmptyState } from "./FaqEmptyState";
import { FaqErrorState } from "./FaqErrorState";
import { FaqArticleView } from "./FaqArticleView";
import { useFaqSearch } from "@/hooks/useFaqSearch";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { FaqItem } from "@/types/faq";

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

  // Foco automático ao abrir
  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => window.clearTimeout(timer);
    } else {
      setQuery("");
      setSelectedCategory(null);
      setSelectedFaq(null);
    }
  }, [open]);

  // Derivar categorias únicas dos resultados
  const categories = Array.from(
    new Set(results.map((r) => r.category.name))
  );

  const filtered =
    selectedCategory
      ? results.filter((r) => r.category.name === selectedCategory)
      : results;

  const showResults = query.trim().length >= 1;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        side="bottom"
        className="flex flex-col gap-0 rounded-t-xl p-0"
        style={{ height: "92dvh" }}
        aria-label="Busca de ajuda e perguntas frequentes"
      >
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            {selectedFaq ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFaq(null)}
                aria-label="Voltar para a lista de perguntas"
                className="gap-1 px-1"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Voltar
              </Button>
            ) : (
              <SheetTitle className="text-base font-semibold">Ajuda</SheetTitle>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Fechar ajuda"
              className="px-2"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-hidden px-4 py-3">
          {selectedFaq ? (
            /* Tela de detalhe */
            <div className="overflow-y-auto flex-1">
              <FaqArticleView faq={selectedFaq} />
            </div>
          ) : (
            /* Tela de lista */
            <>
              {/* Campo de busca */}
              <div className="relative mb-3">
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedCategory(null);
                  }}
                  placeholder="Buscar nas perguntas frequentes…"
                  aria-label="Campo de busca nas perguntas frequentes"
                  className="pr-8"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Limpar busca"
                    onClick={() => { setQuery(""); setSelectedCategory(null); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Chips de categoria */}
              {showResults && !isLoading && categories.length > 1 && (
                <div className="mb-3">
                  <FaqCategoryChips
                    categories={categories}
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                  />
                </div>
              )}

              {/* Resultados */}
              <div className="flex-1 overflow-y-auto">
                {!showResults && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Digite para buscar nas perguntas frequentes.
                  </p>
                )}
                {showResults && isLoading && <FaqLoadingState count={3} />}
                {showResults && isError && <FaqErrorState />}
                {showResults && isEmpty && (
                  <FaqEmptyState message="Nenhum resultado encontrado." />
                )}
                {showResults && !isLoading && !isError && filtered.length > 0 && (
                  <Accordion type="single" collapsible className="w-full">
                    {filtered.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id}>
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
                          <div className="space-y-3 pb-2">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {truncate(faq.shortAnswer, 200)}
                            </p>
                            <Button
                              variant="link"
                              size="sm"
                              className="px-0 h-auto text-xs"
                              onClick={() => setSelectedFaq(faq)}
                              aria-label={`Ver resposta completa: ${faq.title}`}
                            >
                              Ver resposta completa
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
