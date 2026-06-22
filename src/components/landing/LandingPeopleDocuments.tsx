import { Users, Building2, Upload, Bell, UserCheck, FileCheck } from "lucide-react";

const PEOPLE_FEATURES = [
  { icon: Users, title: "Gestão de colaboradores", description: "Cadastro, edição e inativação com controle de perfil. MANAGER gerencia colaboradores do próprio tenant.", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { icon: Building2, title: "Gestão de empresas", description: "CTO administra empresas, configura hierarquias e mantém controle global da plataforma.", color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  { icon: UserCheck, title: "Perfis de acesso", description: "PARTNER, MANAGER e CTO com permissões distintas. Cada perfil acessa apenas o que é autorizado.", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  { icon: Bell, title: "Avisos internos", description: "Mural de comunicados por empresa. Gestores criam e publicam avisos para equipes específicas.", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
];

export function LandingPeopleDocuments() {
  return (
    <section id="pessoas" className="py-24 lg:py-32 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563EB] uppercase tracking-widest mb-4">
            <span className="w-8 h-px bg-[#2563EB]/30" />
            Pessoas e Operação
            <span className="w-8 h-px bg-[#2563EB]/30" />
          </span>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#111827] mb-5 leading-tight">
            Gestão de pessoas, empresas e{" "}
            <span className="landing-gradient-text">documentos centralizada.</span>
          </h2>
          <p className="text-[#64748B] text-lg">
            Controle de acesso por perfil, rastreabilidade de ações e organização de documentos
            em um único painel operacional.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Feature cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {PEOPLE_FEATURES.map(({ icon: Icon, title, description, color, bg, border }) => (
              <div
                key={title}
                className="group bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md hover:border-transparent transition-all duration-200 hover:-translate-y-0.5"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border"
                  style={{ background: bg, borderColor: border }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <p className="text-sm font-semibold text-[#111827] mb-1.5">{title}</p>
                <p className="text-xs text-[#64748B] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          {/* Documents + Roles */}
          <div className="space-y-5">
            {/* Documents panel */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#ECFEFF] border border-[#A5F3FC]">
                  <Upload size={18} className="text-[#0891B2]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Documentos</p>
                  <p className="text-xs text-[#64748B]">Upload, listagem e download seguro</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { name: "Contrato de trabalho.pdf", type: "Contrato", date: "Jan 2026", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
                  { name: "Holerite março.pdf", type: "Holerite", date: "Mar 2026", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
                  { name: "ASO admissional.pdf", type: "Atestado", date: "Dez 2025", color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
                ].map(({ name, type, date, color, bg, border }) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] hover:border-[#E2E8F0] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border"
                        style={{ background: bg, borderColor: border }}
                      >
                        <FileCheck size={13} style={{ color }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#111827]">{name}</p>
                        <p className="text-[10px] text-[#94A3B8]">{type} · {date}</p>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 border"
                      style={{ color: "#0891B2", background: "#ECFEFF", borderColor: "#A5F3FC" }}
                    >
                      Disponível
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[10px] text-[#94A3B8]">
                Acesso controlado por perfil. Cada colaborador visualiza apenas seus próprios documentos.
              </p>
            </div>

            {/* Roles */}
            <div className="bg-[#06264A] rounded-2xl p-5">
              <p className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-widest mb-4">
                Hierarquia de acesso
              </p>
              {[
                { role: "PARTNER", desc: "Colaborador com acesso ao próprio ponto, docs e privacidade.", color: "#94A3B8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.2)" },
                { role: "MANAGER", desc: "Gestor com controle de equipe, aprovações e avisos.", color: "#22D3EE", bg: "rgba(34,211,238,0.12)", border: "rgba(34,211,238,0.2)" },
                { role: "CTO", desc: "Administrador global: empresas, fiscal e LGPD.", color: "#60A5FA", bg: "rgba(37,99,235,0.18)", border: "rgba(37,99,235,0.3)" },
              ].map(({ role, desc, color, bg, border }) => (
                <div key={role} className="flex items-start gap-3 mb-3 last:mb-0">
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5 border"
                    style={{ color, background: bg, borderColor: border }}
                  >
                    {role}
                  </span>
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
