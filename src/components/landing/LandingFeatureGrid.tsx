import { Clock, Users, FileText, CheckSquare, Scale, Shield } from "lucide-react";
import { LANDING_MODULES } from "@/data/landing-page";
import type { LandingModule } from "@/types/landing";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  Clock, Users, FileText, CheckSquare, Scale, Shield,
};

const COLOR_CONFIG: Record<LandingModule["color"], {
  glow: string;
  gradient: string;
  icon: string;
  dot: string;
  badge: string;
  badgeBg: string;
}> = {
  blue: {
    glow: "rgba(37,99,235,0.15)",
    gradient: "linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(30,58,138,0.1) 100%)",
    icon: "#2563EB",
    dot: "#2563EB",
    badge: "#93C5FD",
    badgeBg: "rgba(37,99,235,0.12)",
  },
  cyan: {
    glow: "rgba(34,211,238,0.15)",
    gradient: "linear-gradient(135deg, rgba(34,211,238,0.15) 0%, rgba(8,145,178,0.08) 100%)",
    icon: "#22D3EE",
    dot: "#0891B2",
    badge: "#67E8F9",
    badgeBg: "rgba(34,211,238,0.12)",
  },
  green: {
    glow: "rgba(22,163,74,0.15)",
    gradient: "linear-gradient(135deg, rgba(22,163,74,0.18) 0%, rgba(20,83,45,0.1) 100%)",
    icon: "#16A34A",
    dot: "#16A34A",
    badge: "#86EFAC",
    badgeBg: "rgba(22,163,74,0.12)",
  },
  amber: {
    glow: "rgba(245,158,11,0.15)",
    gradient: "linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(180,83,9,0.1) 100%)",
    icon: "#F59E0B",
    dot: "#D97706",
    badge: "#FCD34D",
    badgeBg: "rgba(245,158,11,0.12)",
  },
};

function ModuleCard({ module }: { module: LandingModule }) {
  const Icon = ICON_MAP[module.icon];
  const cfg = COLOR_CONFIG[module.color];

  return (
    <article
      className="group relative rounded-2xl border border-white/8 overflow-hidden transition-all duration-300 hover:border-white/18 hover:-translate-y-1"
      style={{ background: "rgba(255,255,255,0.03)" }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${cfg.glow}, transparent 65%)` }}
      />

      {/* Top gradient bar */}
      <div
        className="h-0.5 w-full opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.icon}, transparent)` }}
      />

      <div className="p-6 flex flex-col gap-4">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.gradient }}
        >
          {Icon && <Icon size={22} style={{ color: cfg.icon }} />}
        </div>

        <div>
          <h3 className="text-base font-semibold text-white mb-2">{module.title}</h3>
          <p className="text-sm text-[#64748B] leading-relaxed">{module.description}</p>
        </div>

        <ul className="mt-auto space-y-2 pt-2 border-t border-white/6">
          {module.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5 text-xs text-[#94A3B8]">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: cfg.dot }}
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function LandingFeatureGrid() {
  return (
    <section id="funcionalidades" className="py-24 lg:py-32 relative overflow-hidden bg-[#030d1a]">
      {/* Section glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: "radial-gradient(ellipse, #2563EB 0%, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#22D3EE] uppercase tracking-widest mb-4">
            <span className="w-8 h-px bg-[#22D3EE]/40" />
            Funcionalidades
            <span className="w-8 h-px bg-[#22D3EE]/40" />
          </span>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-5 leading-tight">
            Tudo que sua operação precisa,{" "}
            <span className="landing-gradient-text">integrado.</span>
          </h2>
          <p className="text-[#64748B] text-lg leading-relaxed">
            Do registro de ponto ao relatório fiscal — centralize processos, reduza planilhas e
            organize evidências com rastreabilidade completa.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {LANDING_MODULES.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>

        {/* Pillars row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {[
            { label: "Tempo", color: "#2563EB" },
            { label: "·", color: "#ffffff22" },
            { label: "Pessoas", color: "#22D3EE" },
            { label: "·", color: "#ffffff22" },
            { label: "Conformidade", color: "#16A34A" },
            { label: "·", color: "#ffffff22" },
            { label: "Resultados", color: "#F59E0B" },
          ].map(({ label, color }, i) => (
            <span
              key={i}
              className="text-sm font-semibold"
              style={{ color }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
