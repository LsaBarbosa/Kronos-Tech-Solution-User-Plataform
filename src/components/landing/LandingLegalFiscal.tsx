import { Scale, FileSpreadsheet, FileCheck, ClipboardList, Info } from "lucide-react";

const FISCAL_DOCS = [
  { icon: FileSpreadsheet, code: "AFD", name: "Arquivo Fonte de Dados", description: "Arquivo eletrônico exigido pelo MTE com registros de ponto. Gerado e exportado diretamente pela plataforma.", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { icon: FileCheck, code: "AEJ", name: "Arquivo Eletrônico de Jornada", description: "Registro eletrônico de jornada para portaria SRTE. Organizado e disponível para auditoria.", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { icon: ClipboardList, code: "Espelho", name: "Espelho de Ponto", description: "Relatório individual por período com assinatura eletrônica do colaborador para evidência legal.", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { icon: Scale, code: "Atestado", name: "Atestado Técnico", description: "Documento técnico para comprovação do sistema de ponto em processos de auditoria e fiscalização.", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
];

export function LandingLegalFiscal() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Copy */}
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#D97706] uppercase tracking-widest mb-4">
                <span className="w-8 h-px bg-[#D97706]/30" />
                Legal e Fiscal
              </span>
              <h2 className="text-3xl lg:text-4xl xl:text-[2.75rem] font-bold text-[#111827] mb-5 leading-tight">
                Arquivos legais e fiscais{" "}
                <span className="landing-gradient-text-amber">prontos para auditoria.</span>
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed">
                AFD, AEJ, espelho de ponto e atestado técnico gerados pela plataforma. Reduza
                retrabalho e organize evidências documentais com rastreabilidade completa.
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
              <Info size={15} className="text-[#D97706] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#92400E] leading-relaxed">
                A plataforma organiza evidências e apóia conformidade trabalhista. A responsabilidade
                final de interpretação legal é da empresa e de seus consultores.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {["Relatório de horas", "Status do registro", "Apuração de horas", "Auditoria fiscal", "Exportação de dados", "Rastreabilidade"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-[#475569]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Docs grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {FISCAL_DOCS.map(({ icon: Icon, code, name, description, color, bg, border }) => (
              <div
                key={code}
                className="group bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md hover:border-transparent transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ background: bg, borderColor: border }}>
                    <Icon size={17} style={{ color }} />
                  </div>
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-md border"
                    style={{ color, background: bg, borderColor: border }}
                  >
                    {code}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#111827] mb-1.5">{name}</p>
                <p className="text-xs text-[#64748B] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
