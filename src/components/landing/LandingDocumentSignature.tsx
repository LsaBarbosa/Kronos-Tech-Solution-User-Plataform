import { PenLine, Hash, Clock4, FileCheck2, Fingerprint, ChevronRight, ShieldCheck } from "lucide-react";

const STEPS = [
  { icon: FileCheck2, label: "Documento enviado", desc: "Gestor envia espelho ou contrato ao colaborador" },
  { icon: Fingerprint, label: "Identificação facial", desc: "Colaborador confirma identidade via biometria" },
  { icon: PenLine, label: "Assinatura registrada", desc: "Plataforma captura hash, data/hora e signatário" },
  { icon: Hash, label: "Arquivado com evidência", desc: "Documento arquivado com trilha auditável completa" },
];

const PILLARS = [
  { label: "Hash por documento", sub: "Integridade verificável", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  { label: "Timestamp registrado", sub: "Data e hora do ato", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { label: "ID do signatário", sub: "Rastreável por usuário", color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
];

export function LandingDocumentSignature() {
  return (
    <section id="assinatura" className="py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Subtle purple blob */}
      <div
        className="absolute -top-32 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.05) 0%, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* ── Visual mock ── */}
          <div className="order-2 lg:order-1 flex flex-col gap-4">

            {/* Document card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              {/* top bar */}
              <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, transparent, #7C3AED, transparent)" }} />

              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center">
                      <FileCheck2 size={15} className="text-[#7C3AED]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#111827]">Espelho de Ponto — Maio/2026</p>
                      <p className="text-[10px] text-[#94A3B8]">João R. Silva · Aguardando assinatura</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF9C3] text-[#CA8A04] border border-[#FDE68A]">
                    Pendente
                  </span>
                </div>

                {/* Face scan visual */}
                <div className="flex flex-col items-center py-6 gap-3">
                  <div className="relative">
                    {/* pulsing rings */}
                    <span className="absolute inset-0 rounded-full border-2 border-[#7C3AED]/20 animate-ping" />
                    <span className="absolute -inset-3 rounded-full border border-[#7C3AED]/10 animate-ping [animation-delay:0.3s]" />
                    <div className="relative w-16 h-16 rounded-full bg-[#F5F3FF] border-2 border-[#7C3AED]/40 flex items-center justify-center">
                      <Fingerprint size={28} className="text-[#7C3AED]" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-[#374151]">Identificação facial em andamento…</p>
                  <p className="text-[10px] text-[#94A3B8] text-center max-w-[220px]">
                    Aproxime o rosto da câmera. O cadastro biométrico é feito com seu consentimento prévio.
                  </p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {PILLARS.map(({ label, sub, color, bg, border }) => (
                    <div
                      key={label}
                      className="rounded-xl p-2.5 text-center border"
                      style={{ background: bg, borderColor: border }}
                    >
                      <p className="text-[10px] font-bold leading-tight" style={{ color }}>{label}</p>
                      <p className="text-[9px] text-[#64748B] mt-0.5 leading-tight">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Signed state card */}
            <div className="bg-[#F0FDF4] rounded-2xl border border-[#BBF7D0] p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#BBF7D0] flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={16} className="text-[#16A34A]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#111827]">Assinatura concluída</p>
                <p className="text-[10px] text-[#64748B] mt-0.5">
                  Hash SHA-256 · 22/06/2026 09:14 · Signatário: João R. Silva · Arquivado com evidência legal
                </p>
              </div>
            </div>
          </div>

          {/* ── Copy ── */}
          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#7C3AED] uppercase tracking-widest mb-4">
                <span className="w-8 h-px bg-[#7C3AED]/30" />
                Assinatura de Documentos
              </span>
              <h2 className="text-3xl lg:text-4xl xl:text-[2.75rem] font-bold text-[#111827] mb-5 leading-tight">
                Assine documentos com{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #4F46E5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  biometria facial.
                </span>
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed">
                Espelhos de ponto, contratos e documentos trabalhistas assinados eletronicamente
                pelo colaborador diretamente na plataforma — com rastreabilidade completa de quem,
                quando e o que foi assinado.
              </p>
            </div>

            {/* Flow steps */}
            <div className="space-y-3">
              {STEPS.map(({ icon: Icon, label, desc }, i) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center border flex-shrink-0"
                      style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}
                    >
                      <Icon size={15} className="text-[#7C3AED]" />
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="w-px h-4 mt-1" style={{ background: "#DDD6FE" }} />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-semibold text-[#111827]">{label}</p>
                    <p className="text-xs text-[#64748B]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature bullets */}
            <div className="grid grid-cols-2 gap-2">
              {[
                "Espelho de ponto",
                "Contratos de trabalho",
                "Hash por documento",
                "Timestamp auditável",
                "Identidade rastreável",
                "Arquivamento automático",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-[#475569]">
                  <ChevronRight size={13} className="text-[#7C3AED] flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            {/* Consent note */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE]">
              <Clock4 size={15} className="text-[#7C3AED] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#5B21B6] leading-relaxed">
                O uso de biometria facial para assinatura requer consentimento explícito do
                colaborador, registrado e revogável a qualquer momento pela plataforma.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
