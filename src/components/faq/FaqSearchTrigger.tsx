import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaqSearchDialog } from "./FaqSearchDialog";
import { FaqBottomSheet } from "./FaqBottomSheet";
import { useResponsiveMode, DESKTOP_BREAKPOINT_QUERY } from "@/hooks/useResponsiveMode";
import { useLocation } from "react-router-dom";
import { FAQ_SCREEN_KEY_BY_PATH } from "./faqPathMapping";

interface FaqSearchTriggerProps {
  /** Classe CSS extra para o botão */
  className?: string;
  /** Variante para contexto de uso (header desktop vs mobile) */
  variant?: "icon" | "icon-text";
}

export function FaqSearchTrigger({ className, variant = "icon" }: FaqSearchTriggerProps) {
  const [open, setOpen] = useState(false);
  const { isDesktop } = useResponsiveMode(DESKTOP_BREAKPOINT_QUERY);
  const location = useLocation();

  const screenKey = FAQ_SCREEN_KEY_BY_PATH[location.pathname] ?? undefined;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Abrir busca de ajuda e perguntas frequentes"
        className={className}
      >
        <HelpCircle className="h-5 w-5" aria-hidden="true" />
        {variant === "icon-text" && (
          <span className="ml-1 text-sm">Ajuda</span>
        )}
      </Button>

      {isDesktop ? (
        <FaqSearchDialog
          open={open}
          onClose={() => setOpen(false)}
          screenKey={screenKey}
        />
      ) : (
        <FaqBottomSheet
          open={open}
          onClose={() => setOpen(false)}
          screenKey={screenKey}
        />
      )}
    </>
  );
}
