import { ArrowRight, CheckCircle, Clock, Shield, Users, Zap } from "lucide-react";
import logoAzul from "@/assets/brand/logo-azul.png";
import { HERO_STATS } from "@/data/landing-page";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export function LandingHero() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white"
      aria-label="Seção principal"
    >
      {/* Light blob backgrounds */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="landing-blob landing-blob-1-light" />
        <div className="landing-blob landing-blob-2-light" />
        <div className="landing-blob landing-blob-3-light" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#2563EB 1px, transparent 1px), linear-gradient(90deg, #2563EB 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-36 lg:pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* ── Left column ── */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#EFF6FF] border border-[#BFDBFE]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563EB] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]" />
              </span>
              <span className="text-[#1d4ed8] text-xs font-semibold tracking-wide">
                Plataforma corporativa de RH e compliance
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl font-extrabold leading-[1.1] tracking-tight text-[#111827]">
              Gestão de ponto, pessoas e{" "}
              <span className="landing-gradient-text">conformidade</span>{" "}
              em uma única plataforma.
            </h1>

            <p className="text-lg text-[#64748B] leading-relaxed max-w-lg">
              Centralize jornada, documentos, aprovações, privacidade LGPD e relatórios legais.
              Reduza retrabalho e organize evidências com rastreabilidade completa.
            </p>

            {/* Proof points */}
            <ul className="space-y-3">
              {[
                "Ponto eletrônico com biometria facial",
                "LGPD: inventário, consentimento e exportação",
                "AFD, AEJ, espelho de ponto e atestado técnico",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[#374151] text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                    <CheckCircle size={12} className="text-[#16A34A]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => scrollTo("contato")}
                className="group relative flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#2563EB] text-white font-semibold text-sm transition-all duration-200 shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.45)] hover:bg-[#1d4ed8] hover:-translate-y-0.5 min-h-[52px]"
              >
                Agendar demonstração
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => scrollTo("funcionalidades")}
                className="flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-[#E2E8F0] text-[#374151] font-medium text-sm hover:bg-[#F8FAFC] hover:border-[#CBD5E1] hover:text-[#111827] transition-all duration-200 min-h-[52px]"
              >
                Conhecer módulos
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2">
                {["#2563EB", "#16A34A", "#22D3EE", "#F59E0B"].map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold shadow-sm"
                    style={{ backgroundColor: c }}
                  >
                    {["RH", "DP", "TI", "GR"][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#94A3B8]">Usado por times de RH, DP, TI e gestão</p>
            </div>
          </div>

          {/* ── Right column — dashboard card ── */}
          <div className="hidden lg:block relative">
            {/* Outer shadow glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#2563EB]/10 via-[#22D3EE]/5 to-[#16A34A]/5 blur-2xl scale-105 pointer-events-none" />

            {/* Card */}
            <div className="relative rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.1),0_0_0_1px_rgba(37,99,235,0.06)]">
              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <img src={logoAzul} alt="Kronos" className="h-6 w-auto" />
                  <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest">
                    Dashboard operacional
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DCFCE7] border border-[#BBF7D0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                  <span className="text-[10px] text-[#15803D] font-semibold">Online</span>
                </div>
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Colaboradores ativos", value: "128", icon: Users, color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
                  { label: "Aprovações pendentes", value: "7", icon: Zap, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
                  { label: "Ponto hoje", value: "94%", icon: Clock, color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
                  { label: "Conformidade LGPD", value: "✓", icon: Shield, color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
                ].map(({ label, value, icon: Icon, color, bg, border }) => (
                  <div
                    key={label}
                    className="rounded-2xl p-4 border transition-shadow hover:shadow-md"
                    style={{ background: bg, borderColor: border }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={14} style={{ color }} />
                      <span className="text-[10px] text-[#64748B]">{label}</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Activity feed */}
              <div className="space-y-2 mb-4">
                <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest px-1 mb-2">
                  Atividades recentes
                </p>
                {[
                  { label: "Solicitação de férias aprovada", tag: "Aprovado", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
                  { label: "Ajuste de ponto pendente", tag: "Pendente", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
                  { label: "Exportação LGPD concluída", tag: "Concluído", color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
                ].map(({ label, tag, color, bg, border }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors"
                  >
                    <span className="text-xs text-[#374151]">{label}</span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 border"
                      style={{ color, background: bg, borderColor: border }}
                    >
                      {tag}
                    </span>
                  </div>
                ))}
              </div>

              {/* Security strip */}
              <div className="flex items-center gap-2 rounded-xl p-3 bg-[#F0FDF4] border border-[#BBF7D0]">
                <Shield size={13} className="text-[#16A34A] flex-shrink-0" />
                <p className="text-[10px] text-[#15803D] font-medium">
                  Cookie HttpOnly · CSRF · LGPD · Rastreabilidade
                </p>
              </div>
            </div>

            {/* Floating badge top-right */}
            <div className="absolute -top-4 -right-4 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-lg">
              <p className="text-[10px] text-[#94A3B8] mb-0.5">Conformidade</p>
              <p className="text-sm font-bold text-[#0891B2]">LGPD Ready</p>
            </div>

            {/* Floating badge bottom-left */}
            <div className="absolute -bottom-4 -left-4 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-lg">
              <p className="text-[10px] text-[#94A3B8] mb-0.5">Relatórios</p>
              <p className="text-sm font-bold text-[#D97706]">AFD · AEJ</p>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-20 pt-8 border-t border-[#E2E8F0]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {HERO_STATS.map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-3xl lg:text-4xl font-extrabold landing-gradient-text mb-1">{value}</p>
                <p className="text-xs text-[#94A3B8] tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
