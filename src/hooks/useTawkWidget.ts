import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getChatConfig, getChatIdentity } from "@/service/support-chat.service";
import { safeLogger } from "@/utils/security/safeLogger";
import { sanitizeTawkAttributes, sanitizeTawkTags, resolveKronosModule } from "@/utils/tawk-helpers";

declare global {
  interface Window {
    Tawk_API?: {
      onLoad?: () => void;
      setAttributes?: (attrs: Record<string, string>, cb?: (err?: Error) => void) => void;
      addTags?: (tags: string[], cb?: (err?: Error) => void) => void;
      endChat?: () => void;
      hideWidget?: () => void;
      showWidget?: () => void;
      minimize?: () => void;
      maximize?: () => void;
      isChatMinimized?: () => boolean;
    };
    Tawk_LoadStart?: Date;
  }
}

interface UseTawkWidgetOptions {
  isAuthenticated: boolean;
}

const TAWK_USER_KEY = "kronos:tawk:userId";

async function applyTawkIdentity(
  cancelledRef: { current: boolean },
  pathname: string
): Promise<void> {
  try {
    const identity = await getChatIdentity();
    if (cancelledRef.current) return;

    const previousUserId = sessionStorage.getItem(TAWK_USER_KEY);

    if (previousUserId && previousUserId !== identity.userId) {
      try { window.Tawk_API?.endChat?.(); } catch { /* ignore */ }
      sessionStorage.removeItem(TAWK_USER_KEY);
      safeLogger.info("[support-chat] Sessão TAWK.to anterior limpa antes de trocar usuário.");
    }

    if (cancelledRef.current) return;

    if (window.Tawk_API?.setAttributes) {
      const allAttributes = sanitizeTawkAttributes({
        name: identity.name,
        email: identity.email,
        hash: identity.hash,
        id: identity.userId,
        ...identity.attributes,
        "current-route": pathname,
        "current-module": resolveKronosModule(pathname),
      });

      window.Tawk_API.setAttributes(allAttributes, (err) => {
        if (err) {
          safeLogger.warn("Tawk.to setAttributes error:", err);
          return;
        }
        sessionStorage.setItem(TAWK_USER_KEY, identity.userId);
        safeLogger.info("[support-chat] Identidade TAWK.to aplicada ao usuário autenticado.");

        const allTags = sanitizeTawkTags([
          ...identity.tags,
          `modulo-${resolveKronosModule(pathname)}`,
        ]);

        if (allTags.length > 0) {
          window.Tawk_API?.addTags?.(allTags, (tagErr) => {
            if (tagErr) safeLogger.warn("Tawk.to addTags error:", tagErr);
          });
        }
      });
    }
  } catch (err) {
    safeLogger.warn("Tawk.to: falha ao aplicar identidade:", err);
  }
}

export function useTawkWidget({ isAuthenticated }: UseTawkWidgetOptions) {
  const scriptLoadedRef = useRef(false);
  const cancelledRef = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) return;

    cancelledRef.current = false;

    const init = async () => {
      try {
        const config = await getChatConfig();
        if (cancelledRef.current || !config.enabled || !config.propertyId || !config.widgetId) return;

        if (!window.Tawk_API) {
          window.Tawk_API = {};
          window.Tawk_LoadStart = new Date();
        }

        if (!scriptLoadedRef.current) {
          window.Tawk_API.onLoad = async () => {
            window.Tawk_API?.minimize?.();
            await applyTawkIdentity(cancelledRef, location.pathname);
          };

          const script = document.createElement("script");
          script.async = true;
          script.src = `https://embed.tawk.to/${config.propertyId}/${config.widgetId}`;
          script.charset = "UTF-8";
          script.setAttribute("crossorigin", "anonymous");
          document.body.appendChild(script);
          scriptLoadedRef.current = true;
        } else {
          // Re-login: script already loaded, widget was hidden on logout
          window.Tawk_API?.showWidget?.();
          window.Tawk_API?.minimize?.();
          await applyTawkIdentity(cancelledRef, location.pathname);
        }
      } catch (err) {
        safeLogger.warn("Falha ao inicializar chat Tawk.to:", err);
      }
    };

    void init();
    return () => {
      cancelledRef.current = true;
    };
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update route context in Tawk.to whenever the user navigates
  useEffect(() => {
    if (!isAuthenticated || !scriptLoadedRef.current) return;

    const contextAttributes = sanitizeTawkAttributes({
      "current-route": location.pathname,
      "current-module": resolveKronosModule(location.pathname),
      "last-page-view-at": new Date().toISOString(),
    });

    window.Tawk_API?.setAttributes?.(contextAttributes, (err) => {
      if (err) safeLogger.warn("Tawk.to: falha ao atualizar rota:", err);
    });
  }, [isAuthenticated, location.pathname]);

  // Logout cleanup: end conversation and hide widget until next login
  useEffect(() => {
    if (isAuthenticated || !scriptLoadedRef.current) return;

    try {
      window.Tawk_API?.endChat?.();
      window.Tawk_API?.hideWidget?.();
      safeLogger.info("[support-chat] Widget TAWK.to ocultado no logout.");
    } catch (err) {
      safeLogger.warn("Tawk.to: falha ao ocultar widget:", err);
    }
    sessionStorage.removeItem(TAWK_USER_KEY);
  }, [isAuthenticated]);
}
