import { Clock, Fingerprint, FileBarChart, CalendarCheck, CheckCircle } from "lucide-react";

const FEATURES = [
  {
    icon: Clock,
    title: "Registro de ponto eletrônico",
    description:
      "Controle de entrada, saída e intervalos com registro facial ou manual. Histórico completo e rastreável por colaborador.",
    color: "#2563EB",
    bg: "rgba(37,99,235,0.12)",
  },
  {
    icon: Fingerprint,
    title: "Biometria facial",
    description:
      "Login e marcação via reconhecimento facial. Consentimento gerenciado conforme LGPD, com aceite e revogação pelo colaborador.",
    color: "#22D3EE",
    bg: "rgba(34,211,238,0.12)",
  },
  {
    icon: CalendarCheck,
    title: "Férias, abonos e ajustes",
    description:
      "Fluxo de solicitação e aprovação para férias, abonos e esquecimento de marcação. Rastreável com evidência.",
    color: "#16A34A",
    bg: "rgba(22,163,74,0.12)",
  },
  {
    icon: FileBarChart,
    title: "Relatórios de horas",
    description:
      "Apuração de horas por período, status do registro e espelho de ponto. Dados organizados para gestão e auditoria.",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
  },
];

const TIMELINE = [
  { step: "01", label: "Registro de ponto", desc: "Facial ou manual", color: "#2563EB" },
  { step: "02", label: "Tratamento de exceções", desc: "Ajustes e abonos", color: "#22D3EE" },
  { step: "03", label: "Aprovação gerencial", desc: "Fluxo rastreável", color: "#16A34A" },
  { step: "04", label: "Relatório fiscal", desc: "AFD, AEJ, espelho", color: "#F59E0B" },
];

export function LandingTimeManagement() {
  return (
    <section id="jornada" className="py-24 lg:py-32 relative overflow-hidden bg-[#04111f]">
      {/* Background accent */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ background: "radial-gradient(ellipse, #22D3EE, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">

          {/* Left — copy + features */}
          <div className="space-y-10">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#22D3EE] uppercase tracking-widest mb-4">
                <span className="w-8 h-px bg-[#22D3EE]/40" />
                Jornada e Ponto
              </span>
              <h2 className="text-3xl lg:text-4xl xl:text-[2.75rem] font-bold text-white mb-5 leading-tight">
                Controle de jornada com{" "}
                <span className="landing-gradient-text">rastreabilidade de ponta a ponta.</span>
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed">
                Da marcação ao fechamento em um mesmo ambiente. Registre, audite e aprove horas
                de trabalho com evidência documentada e reduza retrabalho operacional.
              </p>
            </div>

            <ul className="space-y-4">
              {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
                <li
                  key={title}
                  className="group flex gap-4 p-4 rounded-2xl border border-white/6 hover:border-white/14 transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110 duration-200"
                    style={{ background: bg }}
                  >
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{title}</p>
                    <p className="text-sm text-[#64748B] leading-relaxed">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — timeline + panel */}
          <div className="space-y-5">
            {/* Timeline */}
            <div
              className="rounded-2xl border border-white/8 p-6"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-widest mb-5">
                Do registro ao relatório
              </p>
              <div className="relative space-y-0">
                {TIMELINE.map(({ step, label, desc, color }, i) => (
                  <div key={step} className="flex gap-4 relative">
                    {/* Vertical line */}
                    {i < TIMELINE.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-0 w-px bg-white/8" />
                    )}
                    {/* Step circle */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black border-2 z-10"
                      style={{ color, borderColor: color, background: `${color}15` }}
                    >
                      {step}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="text-xs text-[#64748B]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard panel */}
            <div
              className="rounded-2xl border border-white/8 p-5"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-white">Ponto — Hoje</p>
                <span className="text-xs text-[#64748B]">Segunda, 22 Jun</span>
              </div>

              <div className="space-y-2.5 mb-4">
                {[
                  { label: "Entrada", time: "08:02", status: "ok" },
                  { label: "Intervalo início", time: "12:00", status: "ok" },
                  { label: "Intervalo fim", time: "13:01", status: "ok" },
                  { label: "Saída", time: "—", status: "pending" },
                ].map(({ label, time, status }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5 border border-white/6"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <CheckCircle
                      size={14}
                      className={status === "ok" ? "text-[#16A34A]" : "text-white/20"}
                    />
                    <span className="text-sm text-[#94A3B8] flex-1">{label}</span>
                    <span
                      className={`text-sm font-semibold ${
                        status === "ok" ? "text-white" : "text-white/30"
                      }`}
                    >
                      {time}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl p-3 text-center border border-[#16A34A]/20"
                  style={{ background: "rgba(22,163,74,0.08)" }}
                >
                  <p className="text-lg font-bold text-[#16A34A]">7h01</p>
                  <p className="text-[10px] text-[#86EFAC]">Horas trabalhadas</p>
                </div>
                <div
                  className="rounded-xl p-3 text-center border border-[#2563EB]/20"
                  style={{ background: "rgba(37,99,235,0.08)" }}
                >
                  <p className="text-lg font-bold text-[#22D3EE]">08:00</p>
                  <p className="text-[10px] text-[#93C5FD]">Jornada contratual</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
