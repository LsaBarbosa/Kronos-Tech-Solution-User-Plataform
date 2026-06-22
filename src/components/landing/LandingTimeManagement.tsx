import { Clock, Fingerprint, FileBarChart, CalendarCheck, CheckCircle } from "lucide-react";

const FEATURES = [
  {
    icon: Clock,
    title: "Registro de ponto eletrônico",
    description:
      "Controle de entrada, saída e intervalos com registro facial ou manual. Histórico completo e rastreável por colaborador.",
  },
  {
    icon: Fingerprint,
    title: "Biometria facial",
    description:
      "Login e marcação via reconhecimento facial. Consentimento biométrico gerenciado conforme LGPD, com aceite e revogação pelo colaborador.",
  },
  {
    icon: CalendarCheck,
    title: "Férias, abonos e ajustes",
    description:
      "Fluxo de solicitação e aprovação para férias, abonos e esquecimento de marcação. Gestores aprovam ou rejeitam com rastreabilidade.",
  },
  {
    icon: FileBarChart,
    title: "Relatórios de horas",
    description:
      "Apuração de horas por período, status do registro e espelho de ponto. Dados organizados para decisões gerenciais e auditorias.",
  },
];

export function LandingTimeManagement() {
  return (
    <section id="jornada" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — visual panel */}
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl bg-[#06264A] p-6 lg:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Painel de jornada</h3>
                <span className="text-xs text-[#94A3B8]">Hoje</span>
              </div>

              {/* Timeline mockup */}
              <div className="space-y-3">
                {[
                  { label: "Entrada", time: "08:02", status: "ok" },
                  { label: "Intervalo início", time: "12:00", status: "ok" },
                  { label: "Intervalo fim", time: "13:01", status: "ok" },
                  { label: "Saída", time: "—", status: "pending" },
                ].map(({ label, time, status }) => (
                  <div key={label} className="flex items-center gap-3 bg-[#0A3263] rounded-xl px-4 py-3">
                    <CheckCircle
                      size={16}
                      className={status === "ok" ? "text-[#16A34A]" : "text-[#64748B]"}
                    />
                    <span className="text-sm text-[#CBD5E1] flex-1">{label}</span>
                    <span
                      className={`text-sm font-semibold ${
                        status === "ok" ? "text-white" : "text-[#64748B]"
                      }`}
                    >
                      {time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#16A34A]/10 rounded-xl p-3 text-center border border-[#16A34A]/20">
                  <p className="text-lg font-bold text-[#16A34A]">7h01</p>
                  <p className="text-xs text-[#86EFAC]">Horas trabalhadas</p>
                </div>
                <div className="bg-[#2563EB]/10 rounded-xl p-3 text-center border border-[#2563EB]/20">
                  <p className="text-lg font-bold text-[#22D3EE]">08:00</p>
                  <p className="text-xs text-[#93C5FD]">Jornada contratual</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — copy */}
          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <span className="inline-block text-xs font-semibold text-[#2563EB] uppercase tracking-widest mb-3">
                Jornada e Ponto
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-4">
                Controle de jornada com rastreabilidade de ponta a ponta.
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed">
                Registre, audite e aprove horas de trabalho com evidência documentada. Reduza
                retrabalho operacional e apóie a conformidade trabalhista.
              </p>
            </div>

            <ul className="space-y-5">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={20} className="text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827] mb-1">{title}</p>
                    <p className="text-sm text-[#64748B] leading-relaxed">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
