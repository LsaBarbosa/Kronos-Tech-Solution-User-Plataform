import { Link } from "react-router-dom";
import { BookOpen, Fingerprint, ScrollText, type LucideIcon } from "lucide-react";
import { APP_PATHS } from "@/config/app-routes";
import { cn } from "@/lib/utils";

interface PrivacyLink {
  to: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

const LINKS: PrivacyLink[] = [
  {
    to: APP_PATHS.privacyPolicy,
    label: "Política de Privacidade",
    shortLabel: "Política",
    icon: ScrollText,
  },
  {
    to: APP_PATHS.privacyProcessingCatalog,
    label: "Catálogo de Tratamento",
    shortLabel: "Catálogo",
    icon: BookOpen,
  },
  {
    to: APP_PATHS.privacyBiometricTerm,
    label: "Termo Biométrico",
    shortLabel: "Biometria",
    icon: Fingerprint,
  },
];

interface LoginPrivacyLinksProps {
  variant: "desktop" | "mobile";
}

const LoginPrivacyLinks = ({ variant }: LoginPrivacyLinksProps) => {
  if (variant === "desktop") {
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65">
          Privacidade e dados
        </p>
        <div className="flex flex-wrap gap-2">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220]"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-white/95 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/85"
      )}
    >
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">
        Privacidade e dados
      </p>
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        {LINKS.map(({ to, shortLabel, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-2 text-[11px] font-semibold text-[#1D4ED8] transition hover:bg-[#EFF6FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
          >
            <Icon className="h-4 w-4" />
            {shortLabel}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LoginPrivacyLinks;
