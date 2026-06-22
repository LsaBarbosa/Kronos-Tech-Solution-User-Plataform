import { Clock, Users, FileText, CheckSquare, Scale, Shield } from "lucide-react";
import { LANDING_MODULES } from "@/data/landing-page";
import type { LandingModule } from "@/types/landing";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Clock,
  Users,
  FileText,
  CheckSquare,
  Scale,
  Shield,
};

const COLOR_MAP: Record<LandingModule["color"], { bg: string; icon: string; badge: string }> = {
  blue: {
    bg: "bg-[#2563EB]/10",
    icon: "text-[#2563EB]",
    badge: "bg-[#2563EB]/10 text-[#2563EB]",
  },
  cyan: {
    bg: "bg-[#22D3EE]/10",
    icon: "text-[#0891B2]",
    badge: "bg-[#22D3EE]/10 text-[#0891B2]",
  },
  green: {
    bg: "bg-[#16A34A]/10",
    icon: "text-[#16A34A]",
    badge: "bg-[#16A34A]/10 text-[#16A34A]",
  },
  amber: {
    bg: "bg-[#F59E0B]/10",
    icon: "text-[#F59E0B]",
    badge: "bg-[#F59E0B]/10 text-[#F59E0B]",
  },
};

function ModuleCard({ module }: { module: LandingModule }) {
  const Icon = ICON_MAP[module.icon];
  const colors = COLOR_MAP[module.color];

  return (
    <article className="bg-white rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-lg hover:border-[#2563EB]/20 transition-all duration-200 flex flex-col gap-4">
      <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
        {Icon && <Icon size={24} className={colors.icon} />}
      </div>

      <div>
        <h3 className="text-base font-semibold text-[#111827] mb-2">{module.title}</h3>
        <p className="text-sm text-[#64748B] leading-relaxed">{module.description}</p>
      </div>

      <ul className="mt-auto space-y-1.5">
        {module.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-xs text-[#475569]">
            <span className={`w-1.5 h-1.5 rounded-full ${colors.icon} bg-current flex-shrink-0`} />
            {feature}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function LandingFeatureGrid() {
  return (
    <section id="funcionalidades" className="py-20 lg:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-[#2563EB] uppercase tracking-widest mb-3">
            Funcionalidades
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-4">
            Tudo que sua operação precisa, integrado.
          </h2>
          <p className="text-[#64748B] text-lg">
            Do registro de ponto ao relatório fiscal: centralize processos, reduza planilhas e
            organize evidências com rastreabilidade completa.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LANDING_MODULES.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>

        {/* Center diagram — desktop only */}
        <div className="hidden lg:flex mt-16 items-center justify-center">
          <div className="relative bg-white rounded-2xl border border-[#E2E8F0] px-8 py-6 shadow-sm max-w-2xl w-full text-center">
            <p className="text-sm font-semibold text-[#111827] mb-2">
              Quatro pilares de valor Kronos
            </p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {["Tempo", "Pessoas", "Conformidade", "Resultados"].map((pillar, i) => (
                <div key={pillar} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#2563EB]">{pillar}</span>
                  {i < 3 && <span className="text-[#22D3EE]">·</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
