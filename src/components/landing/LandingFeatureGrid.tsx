import { useState } from "react";
import {
  Clock, Users, FileText, CheckSquare, Scale, Shield, PenLine, RotateCcw,
} from "lucide-react";
import { LANDING_MODULES } from "@/data/landing-page";
import type { LandingModule, LandingModuleColor } from "@/types/landing";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>> = {
  Clock, Users, FileText, CheckSquare, Scale, Shield, PenLine,
};

type ColorCfg = {
  icon: string;
  bg: string;
  border: string;
  dot: string;
  topBar: string;
  backBg: string;
  backBorder: string;
  statBg: string;
  statColor: string;
  tagBg: string;
  tagColor: string;
  tagBorder: string;
};

const COLOR_CONFIG: Record<LandingModuleColor, ColorCfg> = {
  blue: {
    icon: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", dot: "#2563EB", topBar: "#2563EB",
    backBg: "#EFF6FF", backBorder: "#BFDBFE",
    statBg: "#DBEAFE", statColor: "#1d4ed8",
    tagBg: "#EFF6FF", tagColor: "#2563EB", tagBorder: "#BFDBFE",
  },
  cyan: {
    icon: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC", dot: "#0891B2", topBar: "#22D3EE",
    backBg: "#ECFEFF", backBorder: "#A5F3FC",
    statBg: "#CFFAFE", statColor: "#0e7490",
    tagBg: "#ECFEFF", tagColor: "#0891B2", tagBorder: "#A5F3FC",
  },
  green: {
    icon: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", dot: "#16A34A", topBar: "#16A34A",
    backBg: "#F0FDF4", backBorder: "#BBF7D0",
    statBg: "#DCFCE7", statColor: "#15803D",
    tagBg: "#F0FDF4", tagColor: "#16A34A", tagBorder: "#BBF7D0",
  },
  amber: {
    icon: "#D97706", bg: "#FFFBEB", border: "#FDE68A", dot: "#D97706", topBar: "#F59E0B",
    backBg: "#FFFBEB", backBorder: "#FDE68A",
    statBg: "#FEF3C7", statColor: "#b45309",
    tagBg: "#FFFBEB", tagColor: "#D97706", tagBorder: "#FDE68A",
  },
  purple: {
    icon: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", dot: "#7C3AED", topBar: "#7C3AED",
    backBg: "#F5F3FF", backBorder: "#DDD6FE",
    statBg: "#EDE9FE", statColor: "#6D28D9",
    tagBg: "#F5F3FF", tagColor: "#7C3AED", tagBorder: "#DDD6FE",
  },
};

function FlipCard({ module, minH }: { module: LandingModule; minH: string }) {
  const [flipped, setFlipped] = useState(false);
  const Icon = ICON_MAP[module.icon];
  const cfg = COLOR_CONFIG[module.color];

  const isHighlight = module.highlight;

  return (
    <div
      className={`landing-flip-wrapper cursor-pointer select-none ${minH}`}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      aria-pressed={flipped}
      aria-label={flipped ? `Fechar detalhes de ${module.title}` : `Ver detalhes de ${module.title}`}
    >
      <div className={`landing-flip-inner h-full ${flipped ? "landing-flipped" : ""}`}>

        {/* ── FRONT ── */}
        <div
          className={`landing-flip-front bg-white border transition-shadow duration-200 group ${
            isHighlight
              ? "shadow-[0_0_0_2px_#7C3AED30,0_8px_32px_rgba(124,58,237,0.12)]"
              : "border-[#E2E8F0] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-transparent"
          }`}
          style={isHighlight ? { borderColor: cfg.border } : undefined}
        >
          {/* Highlight badge */}
          {isHighlight && (
            <div className="absolute top-4 right-4 z-10">
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                style={{ color: cfg.icon, background: cfg.tagBg, borderColor: cfg.tagBorder }}
              >
                Destaque
              </span>
            </div>
          )}

          {/* Top color bar */}
          <div
            className="h-0.5 w-full"
            style={{ background: `linear-gradient(90deg, transparent, ${cfg.topBar}, transparent)` }}
          />

          <div className={`p-6 flex flex-col gap-4 h-full ${isHighlight ? "lg:flex-row lg:gap-8 lg:items-start" : ""}`}>
            {/* Icon + title */}
            <div className={isHighlight ? "lg:w-64 flex-shrink-0" : ""}>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border mb-4"
                style={{ background: cfg.bg, borderColor: cfg.border }}
              >
                {Icon && <Icon size={22} style={{ color: cfg.icon }} />}
              </div>
              <h3 className="text-base font-semibold text-[#111827] mb-2">{module.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{module.description}</p>
            </div>

            {/* Features */}
            <div className={`flex flex-col gap-2 ${isHighlight ? "flex-1" : "mt-auto pt-3 border-t border-[#F1F5F9]"}`}>
              {isHighlight && <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest mb-1">Principais recursos</p>}
              <ul className={`${isHighlight ? "grid sm:grid-cols-2 gap-2" : "space-y-2"}`}>
                {module.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-xs text-[#64748B]">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.dot }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Click hint */}
          <div className="absolute bottom-3 right-4">
            <span className="text-[9px] text-[#CBD5E1] font-medium">clique para detalhes →</span>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className="landing-flip-back border"
          style={{ background: cfg.backBg, borderColor: cfg.backBorder }}
        >
          {/* Top color bar */}
          <div
            className="h-0.5 w-full"
            style={{ background: `linear-gradient(90deg, transparent, ${cfg.topBar}, transparent)` }}
          />

          <div className={`p-6 flex flex-col gap-4 h-full overflow-auto ${isHighlight ? "lg:flex-row lg:gap-8 lg:items-start" : ""}`}>
            {/* Back header */}
            <div className={isHighlight ? "lg:w-64 flex-shrink-0" : ""}>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border mb-3"
                style={{ background: "white", borderColor: cfg.border }}
              >
                {Icon && <Icon size={18} style={{ color: cfg.icon }} />}
              </div>
              <h3 className="text-sm font-bold text-[#111827] mb-1">{module.backTitle}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">{module.backDescription}</p>

              {/* Stats */}
              <div className={`grid grid-cols-3 gap-2 mt-4 ${isHighlight ? "" : ""}`}>
                {module.backStats.map(({ value, label }) => (
                  <div
                    key={label}
                    className="rounded-xl p-2.5 text-center border"
                    style={{ background: cfg.statBg, borderColor: cfg.backBorder }}
                  >
                    <p className="text-sm font-extrabold" style={{ color: cfg.statColor }}>{value}</p>
                    <p className="text-[9px] text-[#64748B] leading-tight mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Details list */}
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest mb-3">
                Detalhes
              </p>
              <ul className="space-y-2.5">
                {module.backDetails.map(({ label, value }) => (
                  <li key={label} className="flex gap-3 bg-white/70 rounded-xl px-3 py-2.5 border border-white">
                    <span
                      className="text-[10px] font-bold flex-shrink-0 mt-0.5 min-w-[90px]"
                      style={{ color: cfg.icon }}
                    >
                      {label}
                    </span>
                    <span className="text-xs text-[#374151] leading-snug">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Close hint */}
          <div className="absolute bottom-3 right-4 flex items-center gap-1">
            <RotateCcw size={10} className="text-[#CBD5E1]" />
            <span className="text-[9px] text-[#CBD5E1] font-medium">clique para voltar</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingFeatureGrid() {
  const regular = LANDING_MODULES.filter((m) => !m.highlight);
  const highlighted = LANDING_MODULES.filter((m) => m.highlight);

  return (
    <section id="funcionalidades" className="py-24 lg:py-32 bg-[#F8FAFC] relative overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, #2563EB30, transparent)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563EB] uppercase tracking-widest mb-4">
            <span className="w-8 h-px bg-[#2563EB]/30" />
            Funcionalidades
            <span className="w-8 h-px bg-[#2563EB]/30" />
          </span>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#111827] mb-5 leading-tight">
            Tudo que sua operação precisa,{" "}
            <span className="landing-gradient-text">integrado.</span>
          </h2>
          <p className="text-[#64748B] text-lg leading-relaxed">
            Clique em qualquer card para ver os detalhes. Do registro de ponto ao relatório fiscal
            — rastreabilidade completa em cada módulo.
          </p>
        </div>

        {/* Regular grid — 6 cards 3×2 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {regular.map((module) => (
            <FlipCard key={module.id} module={module} minH="min-h-[320px]" />
          ))}
        </div>

        {/* Highlighted card — full width */}
        {highlighted.map((module) => (
          <div key={module.id}>
            <FlipCard module={module} minH="min-h-[260px] lg:min-h-[240px]" />
          </div>
        ))}

        {/* Pillars */}
        <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
          {[
            { label: "Tempo", color: "#2563EB" },
            { label: "·", color: "#CBD5E1" },
            { label: "Pessoas", color: "#0891B2" },
            { label: "·", color: "#CBD5E1" },
            { label: "Conformidade", color: "#16A34A" },
            { label: "·", color: "#CBD5E1" },
            { label: "Resultados", color: "#D97706" },
          ].map(({ label, color }, i) => (
            <span key={i} className="text-sm font-semibold" style={{ color }}>{label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
