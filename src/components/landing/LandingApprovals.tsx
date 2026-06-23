import { CalendarDays, Clock, FileEdit, CheckCircle2, XCircle, ChevronRight, Bell } from "lucide-react";

const APPROVAL_TYPES = [
  {
    icon: CalendarDays,
    title: "Férias",
    description: "Colaborador solicita período de férias. Gestor aprova ou rejeita com justificativa rastreável.",
    color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE",
  },
  {
    icon: FileEdit,
    title: "Abono de ponto",
    description: "Justificativa de ausência com evidência documental. Fluxo de aprovação com histórico completo.",
    color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0",
  },
  {
    icon: Clock,
    title: "Ajuste manual de ponto",
    description: "Solicitação de marcação esquecida ou incorreta. Requer aprovação do gestor antes de ser registrada.",
    color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC",
  },
  {
    icon: Bell,
    title: "Mural de avisos",
    description: "Gestores publicam comunicados internos para a equipe. Rastreável por empresa e data.",
    color: "#D97706", bg: "#FFFBEB", border: "#FDE68A",
  },
];

const FLOW = [
  { step: "01", label: "Solicitação enviada", desc: "Colaborador registra a ocorrência", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { step: "02", label: "Gestor notificado", desc: "Fila de aprovações do MANAGER", color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  { step: "03", label: "Análise e decisão", desc: "Aprovar ou rejeitar com justificativa", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  { step: "04", label: "Resultado registrado", desc: "Histórico auditável gerado", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
];

const MOCK_REQUESTS = [
  { type: "Férias", user: "Ana P. Costa", period: "14/07 – 28/07", status: "Pendente", statusColor: "#D97706", statusBg: "#FFFBEB", statusBorder: "#FDE68A" },
  { type: "Abono", user: "Carlos M. Lima", period: "10/06", status: "Aprovado", statusColor: "#16A34A", statusBg: "#F0FDF4", statusBorder: "#BBF7D0" },
  { type: "Ajuste de ponto", user: "Fernanda T. Reis", period: "09/06 – 08:15", status: "Rejeitado", statusColor: "#DC2626", statusBg: "#FEF2F2", statusBorder: "#FECACA" },
];

export function LandingApprovals() {
  return (
    <section id="aprovacoes" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">

          {/* Left — copy + features */}
          <div className="space-y-10">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#16A34A] uppercase tracking-widest mb-4">
                <span className="w-8 h-px bg-[#16A34A]/30" />
                Aprovações e Solicitações
              </span>
              <h2 className="text-3xl lg:text-4xl xl:text-[2.75rem] font-bold text-[#111827] mb-5 leading-tight">
                Fluxo de aprovações{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, #16A34A 0%, #0891B2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  rastreável e documentado.
                </span>
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed">
                Férias, abonos e ajustes de ponto percorrem um fluxo estruturado — solicitação,
                análise, decisão. Cada etapa é registrada com evidência para suporte a auditorias
                trabalhistas.
              </p>
            </div>

            <ul className="space-y-3">
              {APPROVAL_TYPES.map(({ icon: Icon, title, description, color, bg, border }) => (
                <li
                  key={title}
                  className="group flex gap-4 p-4 rounded-2xl border border-[#E2E8F0] bg-white hover:shadow-md hover:border-transparent transition-all duration-200"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border"
                    style={{ background: bg, borderColor: border }}
                  >
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827] mb-1">{title}</p>
                    <p className="text-sm text-[#64748B] leading-relaxed">{description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-2 gap-2">
              {["Fluxo rastreável", "Histórico auditável", "Notificação ao gestor", "Evidência documental", "Aprovação ou rejeição", "Mural de avisos"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-[#475569]">
                  <ChevronRight size={13} className="text-[#16A34A] flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual mockup */}
          <div className="space-y-5">
            {/* Flow timeline */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-5">
                Da solicitação à decisão
              </p>
              <div className="relative space-y-0">
                {FLOW.map(({ step, label, desc, color, bg, border }, i) => (
                  <div key={step} className="flex gap-4 relative">
                    {i < FLOW.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-0 w-px bg-[#E2E8F0]" />
                    )}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black border-2 z-10"
                      style={{ color, borderColor: border, background: bg }}
                    >
                      {step}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-semibold text-[#111827]">{label}</p>
                      <p className="text-xs text-[#94A3B8]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requests panel */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-[#111827]">Fila de aprovações</p>
                <span className="text-xs text-[#94A3B8]">3 pendências</span>
              </div>

              <div className="space-y-2.5">
                {MOCK_REQUESTS.map(({ type, user, period, status, statusColor, statusBg, statusBorder }) => (
                  <div
                    key={user}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E2E8F0]"
                  >
                    <div className="flex items-center gap-3">
                      {status === "Aprovado"
                        ? <CheckCircle2 size={15} className="text-[#16A34A] flex-shrink-0" />
                        : status === "Rejeitado"
                        ? <XCircle size={15} className="text-[#DC2626] flex-shrink-0" />
                        : <Clock size={15} className="text-[#D97706] flex-shrink-0" />
                      }
                      <div>
                        <p className="text-xs font-medium text-[#111827]">{user}</p>
                        <p className="text-[10px] text-[#94A3B8]">{type} · {period}</p>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 border"
                      style={{ color: statusColor, background: statusBg, borderColor: statusBorder }}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="rounded-xl p-3 text-center bg-[#FFFBEB] border border-[#FDE68A]">
                  <p className="text-lg font-bold text-[#D97706]">1</p>
                  <p className="text-[10px] text-[#92400E]">Pendente</p>
                </div>
                <div className="rounded-xl p-3 text-center bg-[#F0FDF4] border border-[#BBF7D0]">
                  <p className="text-lg font-bold text-[#16A34A]">1</p>
                  <p className="text-[10px] text-[#15803D]">Aprovado</p>
                </div>
                <div className="rounded-xl p-3 text-center bg-[#FEF2F2] border border-[#FECACA]">
                  <p className="text-lg font-bold text-[#DC2626]">1</p>
                  <p className="text-[10px] text-[#991B1B]">Rejeitado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
