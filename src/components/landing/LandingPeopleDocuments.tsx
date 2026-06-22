import { Users, Building2, Upload, Bell, UserCheck } from "lucide-react";

const PEOPLE_FEATURES = [
  {
    icon: Users,
    title: "Gestão de colaboradores",
    description: "Cadastro, edição e inativação com controle de perfil. MANAGER gerencia colaboradores do próprio tenant.",
  },
  {
    icon: Building2,
    title: "Gestão de empresas",
    description: "CTO administra empresas, configura hierarquias e mantém controle global da plataforma.",
  },
  {
    icon: UserCheck,
    title: "Perfis de acesso",
    description: "PARTNER, MANAGER e CTO com permissões distintas. Cada perfil acessa apenas o que é autorizado.",
  },
  {
    icon: Bell,
    title: "Avisos internos",
    description: "Mural de comunicados por empresa. Gestores criam e publicam avisos para equipes específicas.",
  },
];

export function LandingPeopleDocuments() {
  return (
    <section id="pessoas" className="py-20 lg:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold text-[#2563EB] uppercase tracking-widest mb-3">
            Pessoas e Operação
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-4">
            Gestão de pessoas, empresas e documentos centralizada.
          </h2>
          <p className="text-[#64748B] text-lg">
            Controle de acesso por perfil, rastreabilidade de ações e organização de documentos em
            um único painel operacional.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* People features */}
          <div className="space-y-6">
            {PEOPLE_FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4 bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827] mb-1">{title}</p>
                  <p className="text-sm text-[#64748B] leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Documents panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 flex items-center justify-center">
                  <Upload size={20} className="text-[#0891B2]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Documentos</p>
                  <p className="text-xs text-[#64748B]">Upload, listagem e download seguro</p>
                </div>
              </div>

              {/* Simulated doc list */}
              <div className="space-y-2">
                {[
                  { name: "Contrato de trabalho.pdf", type: "Contrato", date: "Jan 2026" },
                  { name: "Holerite março.pdf", type: "Holerite", date: "Mar 2026" },
                  { name: "ASO admissional.pdf", type: "Atestado", date: "Dez 2025" },
                ].map(({ name, type, date }) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]"
                  >
                    <div>
                      <p className="text-xs font-medium text-[#111827]">{name}</p>
                      <p className="text-xs text-[#64748B]">{type} · {date}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#22D3EE]/10 text-[#0891B2] font-medium">
                      Disponível
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs text-[#64748B]">
                Acesso controlado por perfil. Cada colaborador visualiza apenas seus próprios documentos.
              </p>
            </div>

            {/* Access roles */}
            <div className="bg-[#06264A] rounded-2xl p-5 space-y-3">
              <p className="text-xs font-semibold text-[#22D3EE] uppercase tracking-widest">Perfis de acesso</p>
              {[
                { role: "PARTNER", desc: "Colaborador com acesso ao próprio ponto, docs e privacidade." },
                { role: "MANAGER", desc: "Gestor com controle de equipe, aprovações e avisos." },
                { role: "CTO", desc: "Administrador global com acesso a empresas, fiscal e LGPD." },
              ].map(({ role, desc }) => (
                <div key={role} className="flex gap-3">
                  <span className="text-xs font-bold text-[#2563EB] w-20 flex-shrink-0 pt-0.5">{role}</span>
                  <p className="text-xs text-[#94A3B8]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
