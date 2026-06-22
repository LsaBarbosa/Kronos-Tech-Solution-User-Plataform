import { Clock, Fingerprint, FileBarChart, CalendarCheck, CheckCircle } from "lucide-react";

const FEATURES = [
  { icon: Clock, title: "Registro de ponto eletrônico", description: "Controle de entrada, saída e intervalos com registro facial ou manual. Histórico completo e rastreável por colaborador.", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { icon: Fingerprint, title: "Biometria facial", description: "Login e marcação via reconhecimento facial. Consentimento gerenciado conforme LGPD, com aceite e revogação pelo colaborador.", color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  { icon: CalendarCheck, title: "Férias, abonos e ajustes", description: "Fluxo de solicitação e aprovação para férias, abonos e esquecimento de marcação. Rastreável com evidência.", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  { icon: FileBarChart, title: "Relatórios de horas", description: "Apuração de horas por período, status do registro e espelho de ponto. Dados organizados para gestão e auditoria.", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
];

const TIMELINE = [
  { step: "01", label: "Registro de ponto", desc: "Facial ou manual", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { step: "02", label: "Tratamento de exceções", desc: "Ajustes e abonos", color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  { step: "03", label: "Aprovação gerencial", desc: "Fluxo rastreável", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  { step: "04", label: "Relatório fiscal", desc: "AFD, AEJ, espelho", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
];

export function LandingTimeManagement() {
  return (
    <section id="jornada" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">

          {/* Left — copy + features */}
          <div className="space-y-10">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563EB] uppercase tracking-widest mb-4">
                <span className="w-8 h-px bg-[#2563EB]/30" />
                Jornada e Ponto
              </span>
              <h2 className="text-3xl lg:text-4xl xl:text-[2.75rem] font-bold text-[#111827] mb-5 leading-tight">
                Controle de jornada com{" "}
                <span className="landing-gradient-text">rastreabilidade de ponta a ponta.</span>
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed">
                Da marcação ao fechamento em um mesmo ambiente. Registre, audite e aprove horas
                de trabalho com evidência documentada e reduza retrabalho operacional.
              </p>
            </div>

            <ul className="space-y-3">
              {FEATURES.map(({ icon: Icon, title, description, color, bg, border }) => (
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
          </div>

          {/* Right — timeline + panel */}
          <div className="space-y-5">
            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-5">
                Do registro ao relatório
              </p>
              <div className="relative space-y-0">
                {TIMELINE.map(({ step, label, desc, color, bg, border }, i) => (
                  <div key={step} className="flex gap-4 relative">
                    {i < TIMELINE.length - 1 && (
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

            {/* Ponto panel */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-[#111827]">Ponto — Hoje</p>
                <span className="text-xs text-[#94A3B8]">Segunda, 22 Jun</span>
              </div>

              <div className="space-y-2.5 mb-4">
                {[
                  { label: "Entrada", time: "08:02", ok: true },
                  { label: "Intervalo início", time: "12:00", ok: true },
                  { label: "Intervalo fim", time: "13:01", ok: true },
                  { label: "Saída", time: "—", ok: false },
                ].map(({ label, time, ok }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5 bg-white border border-[#E2E8F0]"
                  >
                    <CheckCircle size={14} className={ok ? "text-[#16A34A]" : "text-[#CBD5E1]"} />
                    <span className="text-sm text-[#64748B] flex-1">{label}</span>
                    <span className={`text-sm font-semibold ${ok ? "text-[#111827]" : "text-[#CBD5E1]"}`}>{time}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3 text-center bg-[#F0FDF4] border border-[#BBF7D0]">
                  <p className="text-lg font-bold text-[#16A34A]">7h01</p>
                  <p className="text-[10px] text-[#15803D]">Horas trabalhadas</p>
                </div>
                <div className="rounded-xl p-3 text-center bg-[#EFF6FF] border border-[#BFDBFE]">
                  <p className="text-lg font-bold text-[#2563EB]">08:00</p>
                  <p className="text-[10px] text-[#1d4ed8]">Jornada contratual</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
