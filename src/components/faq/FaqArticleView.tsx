import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { FAQ_SCREEN_ROUTES } from "@/constants/faqScreenKeys";
import { getFaqById } from "@/service/faq.service";
import { FaqMarkdownRenderer } from "./FaqMarkdownRenderer";
import type { FaqItem } from "@/types/faq";

interface FaqArticleViewProps {
  faq: FaqItem;
  onBack?: () => void;
  showBackButton?: boolean;
  /** Chamado antes de navegar para a tela do recurso (ex.: fechar o dialog) */
  onNavigate?: () => void;
}

/**
 * Exibe o conteúdo completo de um FAQ.
 * Quando fullAnswer está ausente (vindos de endpoints de lista/busca), busca
 * automaticamente o detalhe via getFaqById para garantir a resposta completa.
 */
export function FaqArticleView({ faq, onBack, showBackButton = false, onNavigate }: FaqArticleViewProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role ?? "";

  const needsFetch = faq.fullAnswer === undefined;
  const { data: fullArticle, isLoading } = useQuery({
    queryKey: ["faq", faq.id, "detail"],
    queryFn: () => getFaqById(faq.id),
    enabled: needsFetch,
    staleTime: 5 * 60 * 1000,
  });

  const article = needsFetch && fullArticle ? fullArticle : faq;
  const screens = (article.relatedScreens ?? []).filter((sk) => sk in FAQ_SCREEN_ROUTES);

  const handleNavigate = (path: string) => {
    onNavigate?.();
    navigate(path);
  };

  return (
    <div className="flex flex-col gap-4">
      {showBackButton && onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar para a lista de perguntas"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Voltar
        </button>
      )}

      {/* Cabeçalho do artigo */}
      <div className="space-y-2">
        <Badge variant="secondary" className="text-xs font-medium">
          {article.category.name}
        </Badge>
        <h2 className="text-base font-semibold leading-snug text-foreground">{article.title}</h2>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="space-y-2 py-1" aria-label="Carregando conteúdo…" aria-busy="true">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
          <Skeleton className="h-3 w-full mt-4" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      ) : article.fullAnswer ? (
        <FaqMarkdownRenderer content={article.fullAnswer} className="min-h-0" />
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed">{article.shortAnswer}</p>
      )}

      {/* Botões de navegação para o recurso */}
      {!isLoading && screens.length > 0 && (
        <div className="mt-1 rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">
            Acessar no sistema
          </p>
          <div className="flex flex-wrap gap-2">
            {screens.map((sk) => {
              const route = FAQ_SCREEN_ROUTES[sk];
              return (
                <Button
                  key={sk}
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => handleNavigate(route.path(role))}
                  aria-label={`Ir para ${route.label}`}
                >
                  {route.label}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          Carregando tutorial…
        </div>
      )}
    </div>
  );
}
