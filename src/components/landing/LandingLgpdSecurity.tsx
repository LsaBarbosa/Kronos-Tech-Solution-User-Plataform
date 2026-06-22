import { Shield, Lock, Eye, Database, UserX, FileSearch, Cookie, Fingerprint } from "lucide-react";
import { Link } from "react-router-dom";

const LGPD_FEATURES = [
  {
    icon: Eye,
    title: "Solicitações do titular",
    description: "Colaboradores podem solicitar acesso, retificação, portabilidade ou exclusão de seus dados diretamente pela plataforma.",
  },
  {
    icon: Database,
    title: "Inventário de tratamento",
    description: "Mapeamento dos processos de tratamento de dados pessoais. Inventário mantido e auditável pelo administrador global.",
  },
  {
    icon: UserX,
    title: "Exportação e anonimização",
    description: "Exportação de dados pessoais e anonimização quando solicitado. Fluxo documentado com histórico rastreável.",
  },
  {
    icon: FileSearch,
    title: "Consentimento e retenção",
    description: "Controle de consentimento biométrico, aceite de termos e política de retenção de dados por categoria.",
  },
];

const SECURITY_FEATURES = [
  {
    icon: Cookie,
    title: "Cookie HttpOnly",
    description: "Sessão protegida com cookie HttpOnly. JWT nunca armazenado em localStorage ou sessionStorage.",
  },
  {
    icon: Shield,
    title: "Proteção CSRF",
    description: "Token CSRF em cada requisição de mutação. Estratégia de duplo envio validada no backend.",
  },
  {
    icon: Lock,
    title: "Controle por perfil",
    description: "Acesso restrito por papel (PARTNER, MANAGER, CTO). Rotas protegidas e autorização confirmada no backend.",
  },
  {
    icon: Fingerprint,
    title: "Rastreabilidade",
    description: "Operações sensíveis registradas. Histórico de ações para suporte a auditorias e evidência documental.",
  },
];

export function LandingLgpdSecurity() {
  return (
    <section className="py-20 lg:py-28 bg-[#06264A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-[#22D3EE] uppercase tracking-widest mb-3">
            LGPD · Privacidade · Segurança
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Privacidade e segurança como parte da operação.
          </h2>
          <p className="text-[#94A3B8] text-lg">
            Centro de privacidade integrado e camadas de segurança de sessão que apoiam conformidade
            com a LGPD e práticas de proteção de dados.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* LGPD */}
          <div id="lgpd">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#16A34A]/20 flex items-center justify-center">
                <Shield size={16} className="text-[#16A34A]" />
              </div>
              <h3 className="text-base font-semibold text-white">LGPD e Privacidade</h3>
            </div>

            <div className="space-y-4">
              {LGPD_FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4 p-4 rounded-xl bg-[#0A3263] border border-white/5">
                  <div className="w-9 h-9 rounded-lg bg-[#16A34A]/15 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-[#16A34A]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{title}</p>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/privacy/policy"
                className="text-xs text-[#22D3EE] hover:underline"
              >
                Política de Privacidade →
              </Link>
              <Link
                to="/privacy/processing-catalog"
                className="text-xs text-[#22D3EE] hover:underline"
              >
                Catálogo de Tratamento →
              </Link>
              <Link
                to="/privacy/biometric-term"
                className="text-xs text-[#22D3EE] hover:underline"
              >
                Termo Biométrico →
              </Link>
            </div>
          </div>

          {/* Security */}
          <div id="seguranca">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#22D3EE]/20 flex items-center justify-center">
                <Lock size={16} className="text-[#22D3EE]" />
              </div>
              <h3 className="text-base font-semibold text-white">Segurança de sessão</h3>
            </div>

            <div className="space-y-4">
              {SECURITY_FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4 p-4 rounded-xl bg-[#0A3263] border border-white/5">
                  <div className="w-9 h-9 rounded-lg bg-[#22D3EE]/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-[#22D3EE]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{title}</p>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Security badge */}
            <div className="mt-6 p-4 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-[#16A34A]" />
                <p className="text-xs font-semibold text-[#86EFAC]">Arquitetura de segurança</p>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Cookie HttpOnly · CSRF · Controle por perfil · Rastreabilidade · Sem JWT em storage
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
