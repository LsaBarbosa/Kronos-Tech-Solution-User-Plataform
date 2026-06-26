import { useEffect, useRef, useState } from "react";
import { X, Search, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { FaqArticleView } from "./FaqArticleView";
import { FaqLoadingState } from "./FaqLoadingState";
import { FaqErrorState } from "./FaqErrorState";
import { useFaqSearch } from "@/hooks/useFaqSearch";
import type { FaqItem } from "@/types/faq";
import { cn } from "@/lib/utils";

interface FaqSearchDialogProps {
  open: boolean;
  onClose: () => void;
  screenKey?: string;
}

const truncate = (text: string, maxLength: number): string =>
  text.length <= maxLength ? text : `${text.slice(0, maxLength).trimEnd()}…`;

export function FaqSearchDialog({ open, onClose, screenKey }: FaqSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, isLoading, isError, isEmpty } = useFaqSearch(query, screenKey);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(timer);
    } else {
      setQuery("");
      setSelectedFaq(null);
    }
  }, [open]);

  const showResults = query.trim().length >= 1;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl sm:h-[78vh]">
        <DialogTitle className="sr-only">Central de Ajuda</DialogTitle>
        <DialogDescription className="sr-only">
          Busque em perguntas frequentes ou tutoriais do sistema.
        </DialogDescription>

        <Command shouldFilter={false} loop className="flex flex-col h-full">
          {/* Barra de busca */}
          <div className="flex items-center gap-2 border-b bg-muted/20 px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <CommandInput
              ref={inputRef}
              value={query}
              onValueChange={(val) => { setQuery(val); setSelectedFaq(null); }}
              placeholder="Buscar tutoriais e perguntas frequentes…"
              aria-label="Campo de busca"
              className="flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus:ring-0 focus-visible:ring-0 placeholder:text-muted-foreground/60 h-auto"
            />
            {query && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => { setQuery(""); setSelectedFaq(null); }}
                className="shrink-0 text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Fechar central de ajuda"
              className="shrink-0 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Corpo: lista + detalhe */}
          <div className="flex flex-1 overflow-hidden">
            {/* Painel esquerdo — lista de resultados */}
            <div className="w-[42%] border-r flex flex-col overflow-hidden bg-muted/10">
              {!showResults && (
                <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Search className="h-5 w-5 text-muted-foreground/60" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Central de Ajuda</p>
                    <p className="text-xs text-muted-foreground">
                      Digite para buscar tutoriais, passo a passo e perguntas frequentes.
                    </p>
                  </div>
                </div>
              )}

              {showResults && isLoading && (
                <div className="p-4">
                  <FaqLoadingState count={4} />
                </div>
              )}

              {showResults && isError && (
                <div className="p-4">
                  <FaqErrorState />
                </div>
              )}

              {showResults && !isLoading && !isError && (
                <CommandList
                  aria-label="Resultados da busca"
                  className="flex-1 overflow-y-auto px-2 py-2"
                >
                  {isEmpty && (
                    <CommandEmpty>
                      <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
                        <p className="text-sm text-muted-foreground">Nenhum resultado para "{query}".</p>
                        <p className="text-xs text-muted-foreground/60">Tente outras palavras-chave.</p>
                      </div>
                    </CommandEmpty>
                  )}
                  {results.length > 0 && (
                    <CommandGroup>
                      {results.map((faq) => (
                        <CommandItem
                          key={faq.id}
                          value={faq.id}
                          onSelect={() => setSelectedFaq(faq)}
                          aria-label={faq.title}
                          className={cn(
                            "flex items-start gap-2.5 rounded-lg px-3 py-2.5 mb-1 cursor-pointer transition-all",
                            "border border-transparent",
                            selectedFaq?.id === faq.id
                              ? "border-primary/30 bg-primary/8 shadow-sm"
                              : "hover:bg-background hover:border-border/60",
                            "data-[selected=true]:border-primary/30 data-[selected=true]:bg-primary/8"
                          )}
                        >
                          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-sm font-medium leading-snug line-clamp-2">{faq.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {truncate(faq.shortAnswer, 90)}
                            </p>
                            <Badge variant="outline" className="h-4 px-1.5 text-[10px] font-normal">
                              {faq.category.name}
                            </Badge>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              )}
            </div>

            {/* Painel direito — detalhe do artigo */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {selectedFaq ? (
                <FaqArticleView faq={selectedFaq} onNavigate={onClose} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <BookOpen className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <p className="text-sm font-medium text-foreground">Selecione um artigo</p>
                    <p className="text-xs text-muted-foreground">
                      Clique em um resultado à esquerda para ver o tutorial completo aqui.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
