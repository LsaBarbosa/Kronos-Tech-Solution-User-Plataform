import { ArrowRight, CheckCircle, Shield } from "lucide-react";
import logoAzul from "@/assets/brand/logo-azul.png";
import { HERO_STATS } from "@/data/landing-page";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export function LandingHero() {
  return (
    <section className="relative bg-white overflow-hidden" aria-label="Seção principal">

      {/* ── Split panel (min-h-screen) ── */}
      <div className="relative min-h-screen flex flex-col lg:grid lg:grid-cols-2">

        {/* Blobs — left side only */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="landing-blob landing-blob-1-light" />
          <div className="landing-blob landing-blob-2-light" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(#2563EB 1px, transparent 1px), linear-gradient(90deg, #2563EB 1px, transparent 1px)`,
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        {/* ── LEFT — text content ── */}
        <div className="relative z-10 flex items-center justify-center lg:justify-end px-6 sm:px-10 lg:pl-8 lg:pr-16 xl:pr-24 pt-28 pb-12 lg:py-0">
          <div className="w-full max-w-[560px] space-y-8">

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
            <h1 className="text-4xl sm:text-5xl lg:text-[3rem] xl:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight text-[#111827]">
              Gestão de ponto, pessoas e{" "}
              <span className="landing-gradient-text">conformidade</span>{" "}
              em uma única plataforma.
            </h1>

            <p className="text-lg text-[#64748B] leading-relaxed">
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
        </div>

        {/* ── RIGHT — logo panel ── */}
        {/* Mobile: stacks below text (flex-col order). Desktop: right column of grid. */}
        <div className="flex items-center justify-center px-6 pb-14 pt-4 lg:p-0 relative lg:border-l border-[#E2E8F0]">
          {/* Panel tint — desktop only */}
          <div className="absolute inset-0 hidden lg:block bg-gradient-to-br from-[#EFF6FF]/50 via-white to-[#ECFEFF]/20 pointer-events-none" />

          {/* Radial glow behind logo */}
          <div
            className="absolute w-[480px] h-[480px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, rgba(34,211,238,0.04) 50%, transparent 72%)" }}
          />

          {/* Logo — object-fit: contain, bounded by panel */}
          <img
            src={logoAzul}
            alt="Kronos"
            className="relative w-full max-w-[min(90vw,360px)] sm:max-w-[420px] lg:max-w-[580px] xl:max-w-[640px] h-auto"
            style={{ objectFit: "contain" }}
          />

          {/* Floating pills — desktop only */}
          <div className="hidden lg:flex absolute top-10 right-10 items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#E2E8F0] shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse flex-shrink-0" />
            <span className="text-xs font-semibold text-[#111827]">LGPD Ready</span>
          </div>

          <div className="hidden lg:flex absolute bottom-14 right-10 items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#E2E8F0] shadow-md">
            <Shield size={13} className="text-[#2563EB] flex-shrink-0" />
            <span className="text-xs font-semibold text-[#111827]">Cookie HttpOnly · CSRF</span>
          </div>

          <div className="hidden lg:flex absolute bottom-32 left-10 items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#E2E8F0] shadow-md">
            <span className="text-xs font-semibold text-[#D97706]">AFD · AEJ · Espelho de ponto</span>
          </div>
        </div>
      </div>

      {/* ── Stats strip (below split) ── */}
      <div className="relative z-10 border-t border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
