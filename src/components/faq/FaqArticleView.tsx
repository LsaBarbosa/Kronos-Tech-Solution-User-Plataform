import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FaqItem } from "@/types/faq";

interface FaqArticleViewProps {
  faq: FaqItem;
  onBack?: () => void;
  showBackButton?: boolean;
}

/**
 * Exibe o conteúdo completo de um FAQ.
 * Renderiza fullAnswer como texto puro para evitar XSS.
 */
export function FaqArticleView({ faq, onBack, showBackButton = false }: FaqArticleViewProps) {
  return (
    <div className="space-y-4">
      {showBackButton && onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          aria-label="Voltar para a lista de perguntas"
          className="gap-1 px-0 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </Button>
      )}

      <div className="space-y-2">
        <Badge variant="outline" className="text-xs">
          {faq.category.name}
        </Badge>
        <h2 className="text-base font-semibold leading-snug">{faq.title}</h2>
      </div>

      <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {faq.fullAnswer}
      </div>

      {faq.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2">
          {faq.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
