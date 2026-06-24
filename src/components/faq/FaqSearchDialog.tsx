import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaqSearchResults } from "./FaqSearchResults";
import { FaqArticleView } from "./FaqArticleView";
import { FaqLoadingState } from "./FaqLoadingState";
import { FaqEmptyState } from "./FaqEmptyState";
import { FaqErrorState } from "./FaqErrorState";
import { useFaqSearch } from "@/hooks/useFaqSearch";
import type { FaqItem } from "@/types/faq";

interface FaqSearchDialogProps {
  open: boolean;
  onClose: () => void;
  /** Screen key da tela atual para priorizar resultados */
  screenKey?: string;
}

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
        {/* Cabeçalho com busca */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedFaq(null);
              }}
              placeholder="Buscar nas perguntas frequentes…"
              aria-label="Campo de busca nas perguntas frequentes"
              className="pr-8"
            />
            {query && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => { setQuery(""); setSelectedFaq(null); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Fechar busca de ajuda"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>

        {/* Corpo com lista + detalhe em split */}
        <div className="flex flex-1 overflow-hidden">
          {/* Lista de resultados */}
          <div className="w-[45%] overflow-y-auto border-r px-4 py-4">
            {!showResults && (
              <p className="text-sm text-muted-foreground">
                Digite para buscar nas perguntas frequentes.
              </p>
            )}
            {showResults && isLoading && <FaqLoadingState count={4} />}
            {showResults && isError && <FaqErrorState />}
            {showResults && isEmpty && (
              <FaqEmptyState message="Nenhum resultado encontrado." />
            )}
            {showResults && !isLoading && !isError && results.length > 0 && (
              <FaqSearchResults
                results={results}
                selectedId={selectedFaq?.id}
                onSelect={handleSelect}
              />
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
      </DialogContent>
    </Dialog>
  );
}
