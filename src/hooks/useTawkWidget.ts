import { useEffect, useRef } from "react";
import { getChatConfig, getChatIdentity } from "@/service/support-chat.service";
import { safeLogger } from "@/utils/security/safeLogger";

declare global {
  interface Window {
    Tawk_API?: {
      onLoad?: () => void;
      setAttributes?: (attrs: Record<string, string>, cb?: (err?: Error) => void) => void;
      login?: (data: { hash: string; userId: string; name: string; email: string }, cb?: (err?: Error) => void) => void;
      logout?: (cb?: (err?: Error) => void) => void;
      hideWidget?: () => void;
      showWidget?: () => void;
    };
    Tawk_LoadStart?: Date;
  }
}

interface UseTawkWidgetOptions {
  isAuthenticated: boolean;
}

export function useTawkWidget({ isAuthenticated }: UseTawkWidgetOptions) {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || loadedRef.current) return;

    let cancelled = false;

    const init = async () => {
      try {
        const config = await getChatConfig();
        if (cancelled || !config.enabled || !config.propertyId || !config.widgetId) return;

        if (!window.Tawk_API) {
          window.Tawk_API = {};
          window.Tawk_LoadStart = new Date();
        }

        // Set up identity in onLoad — identity fetch happens AFTER script loads
        // so a failure in identity doesn't prevent the widget from appearing
        window.Tawk_API.onLoad = async () => {
          try {
            const identity = await getChatIdentity();
            if (window.Tawk_API?.setAttributes) {
              window.Tawk_API.setAttributes(
                {
                  name: identity.name,
                  email: identity.email,
                  hash: identity.hash,
                  id: identity.userId,
                },
                (err) => {
                  if (err) safeLogger.warn("Tawk.to setAttributes error:", err);
                }
              );
            }
          } catch (err) {
            safeLogger.warn("Tawk.to: falha ao buscar identidade segura:", err);
          }
        };

        const scriptUrl = `https://embed.tawk.to/${config.propertyId}/${config.widgetId}`;
        const script = document.createElement("script");
        script.async = true;
        script.src = scriptUrl;
        script.charset = "UTF-8";
        script.setAttribute("crossorigin", "*");
        document.body.appendChild(script);
        scriptRef.current = script;
        loadedRef.current = true;
      } catch (err) {
        safeLogger.warn("Falha ao inicializar chat Tawk.to:", err);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Logout cleanup
  useEffect(() => {
    if (!isAuthenticated && loadedRef.current) {
      if (window.Tawk_API?.logout) {
        window.Tawk_API.logout();
      } else if (window.Tawk_API?.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    }
  }, [isAuthenticated]);
}
