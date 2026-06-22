import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Clock, Shield, Users, Zap } from "lucide-react";
import logoBranca from "@/assets/brand/logo-branca.png";
import { HERO_STATS } from "@/data/landing-page";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export function LandingHero() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#030d1a]"
      aria-label="Seção principal"
    >
      {/* Animated background blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="landing-blob landing-blob-1" />
        <div className="landing-blob landing-blob-2" />
        <div className="landing-blob landing-blob-3" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyNTYzRUIiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtOS45NDEtOC4wNTktMTgtMTgtMThTMCA4LjA1OSAwIDE4czguMDU5IDE4IDE4IDE4IDEwLS4wNTkgMTgtMTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-36 lg:pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* ── Left column ── */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22D3EE] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22D3EE]" />
              </span>
              <span className="text-[#22D3EE] text-xs font-semibold tracking-wide">
                Plataforma corporativa de RH e compliance
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold leading-[1.1] tracking-tight text-white">
              Gestão de ponto, pessoas e{" "}
              <span className="landing-gradient-text">conformidade</span>{" "}
              em uma única plataforma.
            </h1>

            <p className="text-lg text-[#94A3B8] leading-relaxed max-w-lg">
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
                <li key={item} className="flex items-center gap-3 text-[#CBD5E1] text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#16A34A]/20 flex items-center justify-center">
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
                className="group relative flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#2563EB] text-white font-semibold text-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:bg-[#1d4ed8] min-h-[52px]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Agendar demonstração
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => scrollTo("funcionalidades")}
                className="flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-white/15 text-white/90 font-medium text-sm hover:bg-white/8 hover:border-white/25 hover:text-white transition-all duration-200 min-h-[52px] backdrop-blur-sm"
              >
                Conhecer módulos
              </button>
            </div>

            {/* Tiny social proof */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2">
                {["#2563EB", "#16A34A", "#22D3EE", "#F59E0B"].map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-[#030d1a] flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: c }}
                  >
                    {["RH", "DP", "TI", "GR"][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#64748B]">Usado por times de RH, DP, TI e gestão</p>
            </div>
          </div>

          {/* ── Right column — glassmorphism dashboard ── */}
          <div className="hidden lg:block relative">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#2563EB]/20 via-[#22D3EE]/10 to-[#16A34A]/10 blur-2xl scale-105 pointer-events-none" />

            {/* Glass card */}
            <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <img src={logoBranca} alt="Kronos" className="h-6 w-auto" />
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-widest">
                    Dashboard operacional
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#16A34A]/15 border border-[#16A34A]/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                  <span className="text-[10px] text-[#86EFAC] font-medium">Online</span>
                </div>
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Colaboradores ativos", value: "128", icon: Users, color: "#22D3EE", bg: "rgba(34,211,238,0.1)" },
                  { label: "Aprovações pendentes", value: "7", icon: Zap, color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
                  { label: "Ponto hoje", value: "94%", icon: Clock, color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
                  { label: "Conformidade LGPD", value: "✓", icon: Shield, color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div
                    key={label}
                    className="relative rounded-2xl border border-white/8 p-4 overflow-hidden group hover:border-white/15 transition-all duration-200"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{ background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 70%)` }}
                    />
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: bg }}
                    >
                      <Icon size={16} style={{ color }} />
                    </div>
                    <p className="text-2xl font-bold text-white mb-0.5" style={{ color }}>{value}</p>
                    <p className="text-[10px] text-[#64748B] leading-tight">{label}</p>
                  </div>
                ))}
              </div>

              {/* Activity feed */}
              <div className="space-y-2 mb-4">
                <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-widest px-1 mb-2">Atividades recentes</p>
                {[
                  { label: "Solicitação de férias aprovada", tag: "Aprovado", tagColor: "#16A34A", tagBg: "rgba(22,163,74,0.12)" },
                  { label: "Ajuste de ponto pendente", tag: "Pendente", tagColor: "#F59E0B", tagBg: "rgba(245,158,11,0.12)" },
                  { label: "Exportação LGPD concluída", tag: "Concluído", tagColor: "#22D3EE", tagBg: "rgba(34,211,238,0.12)" },
                ].map(({ label, tag, tagColor, tagBg }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl px-3.5 py-2.5 border border-white/6 hover:border-white/12 transition-all duration-150"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <span className="text-xs text-[#CBD5E1]">{label}</span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                      style={{ color: tagColor, background: tagBg }}
                    >
                      {tag}
                    </span>
                  </div>
                ))}
              </div>

              {/* Security row */}
              <div
                className="flex items-center gap-2 rounded-xl p-3 border border-[#16A34A]/20"
                style={{ background: "rgba(22,163,74,0.07)" }}
              >
                <Shield size={13} className="text-[#16A34A] flex-shrink-0" />
                <p className="text-[10px] text-[#86EFAC]">
                  Cookie HttpOnly · CSRF · LGPD · Rastreabilidade
                </p>
              </div>
            </div>

            {/* Floating badge top-right */}
            <div className="absolute -top-4 -right-4 rounded-2xl border border-white/10 bg-[#0A3263]/80 backdrop-blur-md px-4 py-3 shadow-xl">
              <p className="text-[10px] text-[#64748B] mb-0.5">Conformidade</p>
              <p className="text-sm font-bold text-[#22D3EE]">LGPD Ready</p>
            </div>

            {/* Floating badge bottom-left */}
            <div className="absolute -bottom-4 -left-4 rounded-2xl border border-white/10 bg-[#0A3263]/80 backdrop-blur-md px-4 py-3 shadow-xl">
              <p className="text-[10px] text-[#64748B] mb-0.5">Relatórios</p>
              <p className="text-sm font-bold text-[#F59E0B]">AFD · AEJ</p>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-20 pt-8 border-t border-white/8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {HERO_STATS.map(({ label, value }) => (
              <div key={label} className="text-center group">
                <p className="text-3xl lg:text-4xl font-extrabold landing-gradient-text mb-1">{value}</p>
                <p className="text-xs text-[#475569] tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#030d1a] to-transparent pointer-events-none" />
    </section>
  );
}
