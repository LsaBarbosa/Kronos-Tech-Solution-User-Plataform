import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  /** Screen key da tela atual para priorizar resultados */
  screenKey?: string;
}

const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
};

export function FaqSearchDialog({ open, onClose, screenKey }: FaqSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, isLoading, isError, isEmpty } = useFaqSearch(query, screenKey);

  // Foco automático ao abrir
  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(timer);
    } else {
      setQuery("");
      setSelectedFaq(null);
    }
  }, [open]);

  const handleSelect = (faq: FaqItem) => {
    setSelectedFaq(faq);
  };

  const handleBack = () => {
    setSelectedFaq(null);
  };

  const showResults = query.trim().length >= 1;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl sm:h-[70vh]"
        aria-label="Busca de ajuda e perguntas frequentes"
      >
        {/*
          Command do cmdk gerencia navegação por teclado automaticamente:
          - ArrowUp/ArrowDown navega entre CommandItem
          - Enter seleciona o item focado (via onSelect)
          - Escape é capturado pelo Dialog (fecha o modal)
          shouldFilter=false: filtragem feita pelo back-end via useFaqSearch
        */}
        <Command shouldFilter={false} loop className="flex flex-col h-full">
          {/* Cabeçalho com busca */}
          <div className="flex items-center gap-2 border-b px-2 py-1">
            <CommandInput
              ref={inputRef}
              value={query}
              onValueChange={(val) => {
                setQuery(val);
                setSelectedFaq(null);
              }}
              placeholder="Buscar nas perguntas frequentes…"
              aria-label="Campo de busca nas perguntas frequentes"
              className="flex-1"
            />
            {query && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => { setQuery(""); setSelectedFaq(null); }}
                className="shrink-0 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Fechar busca de ajuda"
              className="shrink-0"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>

          {/* Corpo com lista + detalhe em split */}
          <div className="flex flex-1 overflow-hidden">
            {/* Lista de resultados — CommandList trata foco e scroll */}
            <div className="w-[45%] border-r flex flex-col overflow-hidden">
              {!showResults && (
                <p className="p-4 text-sm text-muted-foreground">
                  Digite para buscar nas perguntas frequentes.
                </p>
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
                  aria-label="Resultados da busca de perguntas frequentes"
                  className="flex-1 overflow-y-auto max-h-full px-2 py-2"
                >
                  {isEmpty && (
                    <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                  )}
                  {results.length > 0 && (
                    <CommandGroup>
                      {results.map((faq) => (
                        <CommandItem
                          key={faq.id}
                          value={faq.id}
                          onSelect={() => handleSelect(faq)}
                          aria-label={faq.title}
                          className={cn(
                            "flex flex-col items-start gap-1 rounded-md border px-3 py-3 mb-1 cursor-pointer",
                            "data-[selected=true]:border-primary data-[selected=true]:bg-primary/5"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 w-full">
                            <p className="text-sm font-medium leading-snug">{faq.title}</p>
                            <Badge variant="outline" className="shrink-0 text-xs">
                              {faq.category.name}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {truncate(faq.shortAnswer, 100)}
                          </p>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              )}
            </div>

            {/* Painel de detalhe */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {selectedFaq ? (
                <FaqArticleView faq={selectedFaq} onBack={handleBack} showBackButton />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Selecione uma pergunta para ver a resposta.
                </div>
              )}
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
