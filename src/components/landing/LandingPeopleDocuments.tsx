import { Users, Building2, Upload, Bell, UserCheck, FileCheck } from "lucide-react";

const PEOPLE_FEATURES = [
  {
    icon: Users,
    title: "Gestão de colaboradores",
    description: "Cadastro, edição e inativação com controle de perfil. MANAGER gerencia colaboradores do próprio tenant.",
    color: "#2563EB",
    bg: "rgba(37,99,235,0.12)",
  },
  {
    icon: Building2,
    title: "Gestão de empresas",
    description: "CTO administra empresas, configura hierarquias e mantém controle global da plataforma.",
    color: "#22D3EE",
    bg: "rgba(34,211,238,0.12)",
  },
  {
    icon: UserCheck,
    title: "Perfis de acesso",
    description: "PARTNER, MANAGER e CTO com permissões distintas. Cada perfil acessa apenas o que é autorizado.",
    color: "#16A34A",
    bg: "rgba(22,163,74,0.12)",
  },
  {
    icon: Bell,
    title: "Avisos internos",
    description: "Mural de comunicados por empresa. Gestores criam e publicam avisos para equipes específicas.",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
  },
];

export function LandingPeopleDocuments() {
  return (
    <section id="pessoas" className="py-24 lg:py-32 relative overflow-hidden bg-[#030d1a]">
      {/* Background accent */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ background: "radial-gradient(ellipse, #2563EB, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563EB] uppercase tracking-widest mb-4">
            <span className="w-8 h-px bg-[#2563EB]/40" />
            Pessoas e Operação
            <span className="w-8 h-px bg-[#2563EB]/40" />
          </span>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-5 leading-tight">
            Gestão de pessoas, empresas e{" "}
            <span className="landing-gradient-text">documentos centralizada.</span>
          </h2>
          <p className="text-[#64748B] text-lg">
            Controle de acesso por perfil, rastreabilidade de ações e organização de documentos
            em um único painel operacional.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* People features */}
          <div className="grid sm:grid-cols-2 gap-4">
            {PEOPLE_FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-white/8 p-5 hover:border-white/16 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}12, transparent 60%)` }}
                />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200"
                  style={{ background: bg }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <p className="text-sm font-semibold text-white mb-1.5">{title}</p>
                <p className="text-xs text-[#64748B] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          {/* Documents + Roles */}
          <div className="space-y-5">
            {/* Documents panel */}
            <div
              className="rounded-2xl border border-white/8 p-5"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(34,211,238,0.12)" }}
                >
                  <Upload size={18} className="text-[#22D3EE]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Documentos</p>
                  <p className="text-xs text-[#64748B]">Upload, listagem e download seguro</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { name: "Contrato de trabalho.pdf", type: "Contrato", date: "Jan 2026", icon: FileCheck, color: "#2563EB" },
                  { name: "Holerite março.pdf", type: "Holerite", date: "Mar 2026", icon: FileCheck, color: "#16A34A" },
                  { name: "ASO admissional.pdf", type: "Atestado", date: "Dez 2025", icon: FileCheck, color: "#22D3EE" },
                ].map(({ name, type, date, icon: Icon, color }) => (
                  <div
                    key={name}
                    className="group flex items-center justify-between p-3 rounded-xl border border-white/6 hover:border-white/12 transition-all duration-150 cursor-default"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}18` }}
                      >
                        <Icon size={13} style={{ color }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{name}</p>
                        <p className="text-[10px] text-[#64748B]">{type} · {date}</p>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                      style={{ color: "#22D3EE", background: "rgba(34,211,238,0.12)" }}
                    >
                      Disponível
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[10px] text-[#475569]">
                Acesso controlado por perfil. Cada colaborador visualiza apenas seus próprios documentos.
              </p>
            </div>

            {/* Roles panel */}
            <div
              className="rounded-2xl border border-[#2563EB]/20 p-5"
              style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(6,38,74,0.4) 100%)" }}
            >
              <p className="text-[10px] font-semibold text-[#22D3EE] uppercase tracking-widest mb-4">
                Hierarquia de acesso
              </p>
              {[
                { role: "PARTNER", desc: "Colaborador com acesso ao próprio ponto, docs e privacidade.", color: "#94A3B8" },
                { role: "MANAGER", desc: "Gestor com controle de equipe, aprovações e avisos.", color: "#22D3EE" },
                { role: "CTO", desc: "Administrador global: empresas, fiscal e LGPD.", color: "#2563EB" },
              ].map(({ role, desc, color }) => (
                <div key={role} className="flex items-start gap-3 mb-3 last:mb-0">
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5 border"
                    style={{
                      color,
                      borderColor: `${color}40`,
                      background: `${color}12`,
                    }}
                  >
                    {role}
                  </span>
                  <p className="text-xs text-[#64748B]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
