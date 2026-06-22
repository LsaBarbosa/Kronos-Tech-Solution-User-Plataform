import { Scale, FileSpreadsheet, FileCheck, ClipboardList, AlertCircle } from "lucide-react";

const FISCAL_DOCS = [
  {
    icon: FileSpreadsheet,
    code: "AFD",
    name: "Arquivo Fonte de Dados",
    description: "Arquivo eletrônico exigido pelo MTE com registros de ponto. Gerado e exportado diretamente pela plataforma.",
    color: "amber",
  },
  {
    icon: FileCheck,
    code: "AEJ",
    name: "Arquivo Eletrônico de Jornada",
    description: "Registro eletrônico de jornada para portaria SRTE. Organizado e disponível para auditoria a qualquer momento.",
    color: "amber",
  },
  {
    icon: ClipboardList,
    code: "Espelho",
    name: "Espelho de Ponto",
    description: "Relatório individual de ponto por período. Assinatura eletrônica do colaborador para evidência legal.",
    color: "blue",
  },
  {
    icon: Scale,
    code: "Atestado",
    name: "Atestado Técnico",
    description: "Documento técnico para comprovação do sistema de ponto. Apóia processos de auditoria e fiscalização.",
    color: "blue",
  },
];

const COLOR_MAP = {
  amber: { bg: "bg-[#F59E0B]/10", icon: "text-[#F59E0B]", badge: "text-[#F59E0B] bg-[#F59E0B]/10" },
  blue: { bg: "bg-[#2563EB]/10", icon: "text-[#2563EB]", badge: "text-[#2563EB] bg-[#2563EB]/10" },
};

export function LandingLegalFiscal() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div className="space-y-6">
            <div>
              <span className="inline-block text-xs font-semibold text-[#F59E0B] uppercase tracking-widest mb-3">
                Legal e Fiscal
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-4">
                Arquivos legais e fiscais organizados e prontos para auditoria.
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed">
                AFD, AEJ, espelho de ponto e atestado técnico gerados pela plataforma. Reduza
                retrabalho e organize evidências documentais com rastreabilidade completa.
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/20">
              <AlertCircle size={16} className="text-[#F59E0B] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#64748B]">
                A plataforma organiza evidências e apóia conformidade trabalhista. A responsabilidade
                final de interpretação legal é da empresa e de seus consultores.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["Relatório de horas", "Status do registro", "Apuração de horas", "Auditoria fiscal"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-[#475569]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Fiscal docs grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {FISCAL_DOCS.map(({ icon: Icon, code, name, description, color }) => {
              const colors = COLOR_MAP[color as keyof typeof COLOR_MAP];
              return (
                <div key={code} className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center`}>
                      <Icon size={18} className={colors.icon} />
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                      {code}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#111827] mb-1">{name}</p>
                  <p className="text-xs text-[#64748B] leading-relaxed">{description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
