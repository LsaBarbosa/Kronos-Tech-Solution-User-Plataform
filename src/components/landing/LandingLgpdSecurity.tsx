import { Shield, Lock, Eye, Database, UserX, FileSearch, Cookie, Fingerprint, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const LGPD_FEATURES = [
  { icon: Eye, title: "Solicitações do titular", description: "Acesso, retificação, portabilidade ou exclusão de dados solicitados diretamente na plataforma." },
  { icon: Database, title: "Inventário de tratamento", description: "Mapeamento dos processos de dados pessoais. Inventário mantido e auditável pelo administrador." },
  { icon: UserX, title: "Exportação e anonimização", description: "Exportação de dados pessoais e anonimização quando solicitado. Histórico rastreável." },
  { icon: FileSearch, title: "Consentimento e retenção", description: "Controle de consentimento biométrico, aceite de termos e política de retenção por categoria." },
];

const SECURITY_FEATURES = [
  { icon: Cookie, title: "Cookie HttpOnly", description: "Sessão protegida com cookie HttpOnly. JWT nunca armazenado em localStorage ou sessionStorage." },
  { icon: Shield, title: "Proteção CSRF", description: "Token CSRF em cada requisição de mutação. Estratégia de duplo envio validada no backend." },
  { icon: Lock, title: "Controle por perfil", description: "Acesso restrito por papel. Rotas protegidas com autorização confirmada no backend." },
  { icon: Fingerprint, title: "Rastreabilidade", description: "Operações sensíveis registradas. Histórico de ações para suporte a auditorias." },
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
    <section className="py-24 lg:py-32 bg-[#06264A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <p className="text-[#94A3B8] text-lg">
            Centro de privacidade integrado e camadas de segurança que apoiam conformidade
            com a LGPD e fortalecem a governança de dados.
          </p>
        </div>

        {/* Two-column features */}
        <div className="grid lg:grid-cols-2 gap-10 mb-14">
          {/* LGPD */}
          <div id="lgpd">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#16A34A]/20 border border-[#16A34A]/30 flex items-center justify-center">
                <Shield size={17} className="text-[#16A34A]" />
              </div>
              <h3 className="text-base font-bold text-white">LGPD e Privacidade</h3>
            </div>

            <div className="space-y-3">
              {LGPD_FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/8 hover:border-[#16A34A]/30 transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={17} className="text-[#16A34A]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{description}</p>
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
                <Link key={to} to={to} className="text-xs text-[#22D3EE] hover:text-white transition-colors hover:underline">
                  {label} →
                </Link>
              ))}
            </div>
          </div>

          {/* Security */}
          <div id="seguranca">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/15 border border-[#22D3EE]/20 flex items-center justify-center">
                <Lock size={17} className="text-[#22D3EE]" />
              </div>
              <h3 className="text-base font-bold text-white">Segurança de sessão</h3>
            </div>

            <div className="space-y-3">
              {SECURITY_FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/8 hover:border-[#22D3EE]/30 transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/15 flex items-center justify-center flex-shrink-0">
                    <Icon size={17} className="text-[#22D3EE]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="rounded-2xl bg-white/5 border border-white/8 p-6">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-widest text-center mb-5">
            Arquitetura de confiança
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {TRUST_BADGES.map(({ label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-8 h-8 rounded-full bg-[#16A34A]/15 border border-[#16A34A]/20 flex items-center justify-center">
                  <CheckCircle size={15} className="text-[#16A34A]" />
                </div>
                <p className="text-xs font-semibold text-white leading-tight">{label}</p>
                <p className="text-[10px] text-[#64748B]">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
