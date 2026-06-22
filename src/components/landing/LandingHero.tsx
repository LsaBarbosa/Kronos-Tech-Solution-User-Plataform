import { ArrowRight, CheckCircle, Shield } from "lucide-react";
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

          {/* ── Right column — logo ── */}
          <div className="hidden lg:flex items-center justify-center relative">
            {/* Radial glow layers */}
            <div
              className="absolute w-[420px] h-[420px] rounded-full pointer-events-none"
              style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, rgba(34,211,238,0.05) 45%, transparent 70%)" }}
            />
            <div
              className="absolute w-[280px] h-[280px] rounded-full pointer-events-none"
              style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 70%)" }}
            />

            {/* Ring decorations */}
            <div className="absolute w-[380px] h-[380px] rounded-full border border-[#2563EB]/6 pointer-events-none" />
            <div className="absolute w-[300px] h-[300px] rounded-full border border-[#2563EB]/8 pointer-events-none" />
            <div className="absolute w-[220px] h-[220px] rounded-full border border-[#2563EB]/10 pointer-events-none" />

            {/* Logo */}
            <img
              src={logoAzul}
              alt="Kronos"
              className="relative w-64 xl:w-80 h-auto drop-shadow-[0_8px_32px_rgba(37,99,235,0.18)]"
            />

            {/* Floating pill — top-right */}
            <div className="absolute top-8 right-0 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#E2E8F0] shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse flex-shrink-0" />
              <span className="text-xs font-semibold text-[#111827]">LGPD Ready</span>
            </div>

            {/* Floating pill — bottom-left */}
            <div className="absolute bottom-8 left-0 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#E2E8F0] shadow-md">
              <Shield size={13} className="text-[#2563EB] flex-shrink-0" />
              <span className="text-xs font-semibold text-[#111827]">Cookie HttpOnly · CSRF</span>
            </div>

            {/* Floating pill — bottom-right */}
            <div className="absolute bottom-16 right-2 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#E2E8F0] shadow-md">
              <span className="text-xs font-semibold text-[#D97706]">AFD · AEJ</span>
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
