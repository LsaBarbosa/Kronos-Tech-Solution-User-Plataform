import { Shield, Lock, Eye, Database, UserX, FileSearch, Cookie, Fingerprint, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const LGPD_FEATURES = [
  { icon: Eye, title: "Solicitações do titular", description: "Acesso, retificação, portabilidade ou exclusão de dados solicitados diretamente na plataforma.", color: "#16A34A" },
  { icon: Database, title: "Inventário de tratamento", description: "Mapeamento dos processos de dados pessoais. Inventário mantido e auditável pelo administrador.", color: "#16A34A" },
  { icon: UserX, title: "Exportação e anonimização", description: "Exportação de dados pessoais e anonimização quando solicitado. Histórico rastreável.", color: "#16A34A" },
  { icon: FileSearch, title: "Consentimento e retenção", description: "Controle de consentimento biométrico, aceite de termos e política de retenção por categoria.", color: "#16A34A" },
];

const SECURITY_FEATURES = [
  { icon: Cookie, title: "Cookie HttpOnly", description: "Sessão protegida com cookie HttpOnly. JWT nunca armazenado em localStorage ou sessionStorage.", color: "#22D3EE" },
  { icon: Shield, title: "Proteção CSRF", description: "Token CSRF em cada requisição de mutação. Estratégia de duplo envio validada no backend.", color: "#22D3EE" },
  { icon: Lock, title: "Controle por perfil", description: "Acesso restrito por papel. Rotas protegidas com autorização confirmada no backend.", color: "#22D3EE" },
  { icon: Fingerprint, title: "Rastreabilidade", description: "Operações sensíveis registradas. Histórico de ações para suporte a auditorias.", color: "#22D3EE" },
];

const TRUST_BADGES = [
  { label: "Cookie HttpOnly", sub: "Sessão segura" },
  { label: "CSRF Token", sub: "Mutações protegidas" },
  { label: "LGPD Compliant", sub: "Lei 13.709/2018" },
  { label: "Perfis de acesso", sub: "PARTNER · MANAGER · CTO" },
  { label: "Biometria segura", sub: "Consentimento LGPD" },
  { label: "Rastreabilidade", sub: "Auditável" },
];

export function LandingLgpdSecurity() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-[#030d1a]">
      {/* Dual glow */}
      <div
        className="absolute left-0 top-1/4 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none opacity-8"
        style={{ background: "radial-gradient(ellipse, #16A34A, transparent 70%)" }}
      />
      <div
        className="absolute right-0 bottom-1/4 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none opacity-8"
        style={{ background: "radial-gradient(ellipse, #22D3EE, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#22D3EE] uppercase tracking-widest mb-4">
            <span className="w-8 h-px bg-[#22D3EE]/40" />
            LGPD · Privacidade · Segurança
            <span className="w-8 h-px bg-[#22D3EE]/40" />
          </span>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-5 leading-tight">
            Privacidade e segurança como{" "}
            <span className="landing-gradient-text-green">parte da operação.</span>
          </h2>
          <p className="text-[#64748B] text-lg">
            Centro de privacidade integrado e camadas de segurança que apoiam conformidade
            com a LGPD e fortalecem a governança de dados.
          </p>
        </div>

        {/* Two-column features */}
        <div className="grid lg:grid-cols-2 gap-10 mb-14">
          {/* LGPD column */}
          <div id="lgpd">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(22,163,74,0.15)" }}
              >
                <Shield size={17} className="text-[#16A34A]" />
              </div>
              <h3 className="text-base font-bold text-white">LGPD e Privacidade</h3>
            </div>

            <div className="space-y-3">
              {LGPD_FEATURES.map(({ icon: Icon, title, description, color }) => (
                <div
                  key={title}
                  className="group flex gap-4 p-4 rounded-2xl border border-white/6 hover:border-[#16A34A]/25 transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(22,163,74,0.12)" }}
                  >
                    <Icon size={17} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
                    <p className="text-xs text-[#64748B] leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-5">
              {[
                { label: "Política de Privacidade", to: "/privacy/policy" },
                { label: "Catálogo de Tratamento", to: "/privacy/processing-catalog" },
                { label: "Termo Biométrico", to: "/privacy/biometric-term" },
              ].map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-xs text-[#22D3EE] hover:text-white transition-colors hover:underline"
                >
                  {label} →
                </Link>
              ))}
            </div>
          </div>

          {/* Security column */}
          <div id="seguranca">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(34,211,238,0.12)" }}
              >
                <Lock size={17} className="text-[#22D3EE]" />
              </div>
              <h3 className="text-base font-bold text-white">Segurança de sessão</h3>
            </div>

            <div className="space-y-3">
              {SECURITY_FEATURES.map(({ icon: Icon, title, description, color }) => (
                <div
                  key={title}
                  className="group flex gap-4 p-4 rounded-2xl border border-white/6 hover:border-[#22D3EE]/25 transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(34,211,238,0.10)" }}
                  >
                    <Icon size={17} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
                    <p className="text-xs text-[#64748B] leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust badges strip */}
        <div
          className="rounded-2xl border border-white/8 p-6"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-widest text-center mb-5">
            Arquitetura de confiança
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TRUST_BADGES.map(({ label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 text-center group">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(22,163,74,0.15)" }}
                >
                  <CheckCircle size={15} className="text-[#16A34A]" />
                </div>
                <p className="text-xs font-semibold text-white leading-tight">{label}</p>
                <p className="text-[10px] text-[#475569]">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
