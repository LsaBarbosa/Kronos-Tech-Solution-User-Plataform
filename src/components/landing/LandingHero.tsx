import { Link } from "react-router-dom";
import { Clock, Users, Shield, FileText, CheckCircle, ArrowRight } from "lucide-react";
import logoBranca from "@/assets/brand/logo-branca.png";
import { HERO_STATS } from "@/data/landing-page";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export function LandingHero() {
  return (
    <section
      className="relative min-h-screen bg-[#06264A] flex flex-col justify-center overflow-hidden"
      aria-label="Seção principal"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#06264A] via-[#0A3263] to-[#06264A] pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#2563EB]/10 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column — copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#22D3EE]/10 border border-[#22D3EE]/20">
              <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse" />
              <span className="text-[#22D3EE] text-xs font-medium">Plataforma corporativa de RH e compliance</span>
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
              Gestão de ponto, pessoas e{" "}
              <span className="text-[#22D3EE]">conformidade</span> em uma única plataforma.
            </h1>

            <p className="text-lg text-[#94A3B8] leading-relaxed max-w-xl">
              Centralize jornada, documentos, aprovações, privacidade LGPD e relatórios legais.
              Reduza retrabalho e organize evidências com rastreabilidade completa.
            </p>

            {/* Proof points */}
            <ul className="space-y-3">
              {[
                "Ponto eletrônico com biometria facial",
                "LGPD com inventário e consentimento",
                "AFD, AEJ e espelho de ponto",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[#CBD5E1]">
                  <CheckCircle size={18} className="text-[#16A34A] flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => scrollTo("contato")}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2563EB] text-white font-semibold hover:bg-[#1E3A8A] transition-colors min-h-[48px] text-sm"
              >
                Agendar demonstração
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => scrollTo("funcionalidades")}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-colors min-h-[48px] text-sm"
              >
                Conhecer módulos
              </button>
            </div>
          </div>

          {/* Right column — dashboard mockup */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Mock dashboard card */}
              <div className="rounded-2xl bg-[#0A3263] border border-white/10 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <img src={logoBranca} alt="Kronos" className="h-6 w-auto" />
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    <span className="text-xs text-[#94A3B8]">Sistema online</span>
                  </div>
                </div>

                {/* Metric cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Colaboradores", value: "128", color: "text-[#22D3EE]", icon: Users },
                    { label: "Aprovações pendentes", value: "7", color: "text-[#F59E0B]", icon: CheckCircle },
                    { label: "Ponto hoje", value: "94%", color: "text-[#16A34A]", icon: Clock },
                    { label: "Docs enviados", value: "312", color: "text-[#2563EB]", icon: FileText },
                  ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="bg-[#06264A] rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={14} className={color} />
                        <span className="text-xs text-[#64748B]">{label}</span>
                      </div>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Mini list */}
                <div className="space-y-2">
                  {[
                    { name: "Solicitação de férias", status: "Aprovado", statusColor: "text-[#16A34A]" },
                    { name: "Ajuste de ponto manual", status: "Pendente", statusColor: "text-[#F59E0B]" },
                    { name: "Exportação LGPD", status: "Concluído", statusColor: "text-[#22D3EE]" },
                  ].map(({ name, status, statusColor }) => (
                    <div key={name} className="flex items-center justify-between bg-[#06264A] rounded-lg px-3 py-2.5 border border-white/5">
                      <span className="text-xs text-[#CBD5E1]">{name}</span>
                      <span className={`text-xs font-medium ${statusColor}`}>{status}</span>
                    </div>
                  ))}
                </div>

                {/* Security badge */}
                <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-[#16A34A]/10 border border-[#16A34A]/20">
                  <Shield size={14} className="text-[#16A34A] flex-shrink-0" />
                  <span className="text-xs text-[#86EFAC]">Cookie HttpOnly · CSRF · LGPD · Rastreabilidade</span>
                </div>
              </div>

              {/* Floating accent */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#22D3EE]/15 rounded-full blur-2xl pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {HERO_STATS.map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl lg:text-3xl font-bold text-[#22D3EE]">{value}</p>
              <p className="text-xs text-[#64748B] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-px h-8 bg-gradient-to-b from-[#22D3EE]/60 to-transparent" />
      </div>
    </section>
  );
}
