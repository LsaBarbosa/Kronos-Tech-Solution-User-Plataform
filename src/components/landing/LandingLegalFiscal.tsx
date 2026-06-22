import { Scale, FileSpreadsheet, FileCheck, ClipboardList, Info } from "lucide-react";

const FISCAL_DOCS = [
  {
    icon: FileSpreadsheet,
    code: "AFD",
    name: "Arquivo Fonte de Dados",
    description: "Arquivo eletrônico exigido pelo MTE com registros de ponto. Gerado e exportado diretamente pela plataforma.",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    icon: FileCheck,
    code: "AEJ",
    name: "Arquivo Eletrônico de Jornada",
    description: "Registro eletrônico de jornada para portaria SRTE. Organizado e disponível para auditoria.",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    icon: ClipboardList,
    code: "Espelho",
    name: "Espelho de Ponto",
    description: "Relatório individual por período com assinatura eletrônica do colaborador para evidência legal.",
    color: "#2563EB",
    bg: "rgba(37,99,235,0.12)",
    border: "rgba(37,99,235,0.2)",
  },
  {
    icon: Scale,
    code: "Atestado",
    name: "Atestado Técnico",
    description: "Documento técnico para comprovação do sistema de ponto em processos de auditoria e fiscalização.",
    color: "#2563EB",
    bg: "rgba(37,99,235,0.12)",
    border: "rgba(37,99,235,0.2)",
  },
];

export function LandingLegalFiscal() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-[#04111f]">
      {/* Accent glow */}
      <div
        className="absolute right-0 bottom-0 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-8"
        style={{ background: "radial-gradient(ellipse, #F59E0B, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Copy */}
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#F59E0B] uppercase tracking-widest mb-4">
                <span className="w-8 h-px bg-[#F59E0B]/40" />
                Legal e Fiscal
              </span>
              <h2 className="text-3xl lg:text-4xl xl:text-[2.75rem] font-bold text-white mb-5 leading-tight">
                Arquivos legais e fiscais{" "}
                <span className="landing-gradient-text-amber">prontos para auditoria.</span>
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed">
                AFD, AEJ, espelho de ponto e atestado técnico gerados pela plataforma. Reduza
                retrabalho e organize evidências documentais com rastreabilidade completa.
              </p>
            </div>

            {/* Notice */}
            <div
              className="flex items-start gap-3 p-4 rounded-xl border border-[#F59E0B]/20"
              style={{ background: "rgba(245,158,11,0.05)" }}
            >
              <Info size={15} className="text-[#F59E0B] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                A plataforma organiza evidências e apóia conformidade trabalhista. A responsabilidade
                final de interpretação legal é da empresa e de seus consultores.
              </p>
            </div>

            {/* Feature list */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                "Relatório de horas",
                "Status do registro",
                "Apuração de horas",
                "Auditoria fiscal",
                "Exportação de dados",
                "Rastreabilidade completa",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Fiscal docs grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {FISCAL_DOCS.map(({ icon: Icon, code, name, description, color, bg, border }) => (
              <div
                key={code}
                className="group relative rounded-2xl border p-5 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}15, transparent 60%)` }}
                />
                {/* Top bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                />

                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: bg }}
                  >
                    <Icon size={17} style={{ color }} />
                  </div>
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-md border"
                    style={{ color, background: bg, borderColor: border }}
                  >
                    {code}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white mb-1.5">{name}</p>
                <p className="text-xs text-[#64748B] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
