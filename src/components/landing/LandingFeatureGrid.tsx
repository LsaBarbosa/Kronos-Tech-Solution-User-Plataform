import { Clock, Users, FileText, CheckSquare, Scale, Shield } from "lucide-react";
import { LANDING_MODULES } from "@/data/landing-page";
import type { LandingModule } from "@/types/landing";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Clock, Users, FileText, CheckSquare, Scale, Shield,
};

const COLOR_CONFIG: Record<LandingModule["color"], {
  icon: string; bg: string; border: string; dot: string; topBar: string;
}> = {
  blue:  { icon: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", dot: "#2563EB", topBar: "#2563EB" },
  cyan:  { icon: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC", dot: "#0891B2", topBar: "#22D3EE" },
  green: { icon: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", dot: "#16A34A", topBar: "#16A34A" },
  amber: { icon: "#D97706", bg: "#FFFBEB", border: "#FDE68A", dot: "#D97706", topBar: "#F59E0B" },
};

function ModuleCard({ module }: { module: LandingModule }) {
  const Icon = ICON_MAP[module.icon];
  const cfg = COLOR_CONFIG[module.color];

  return (
    <article className="group relative bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-transparent">
      {/* Top accent bar */}
      <div
        className="h-0.5 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.topBar}, transparent)` }}
      />

      <div className="p-6 flex flex-col gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border"
          style={{ background: cfg.bg, borderColor: cfg.border }}
        >
          {Icon && <Icon size={22} style={{ color: cfg.icon }} />}
        </div>

        <div>
          <h3 className="text-base font-semibold text-[#111827] mb-2">{module.title}</h3>
          <p className="text-sm text-[#64748B] leading-relaxed">{module.description}</p>
        </div>

        <ul className="mt-auto space-y-2 pt-3 border-t border-[#F1F5F9]">
          {module.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5 text-xs text-[#64748B]">
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
    <section id="funcionalidades" className="py-24 lg:py-32 bg-[#F8FAFC] relative overflow-hidden">
      {/* Subtle background accent */}
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

        {/* Pillars */}
        <div className="mt-14 flex items-center justify-center gap-2 flex-wrap">
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
