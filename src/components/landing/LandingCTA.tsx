import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, CheckCircle } from "lucide-react";

const DEMO_BENEFITS = [
  "Apresentação dos módulos em uso real",
  "Demonstração de LGPD e relatórios fiscais",
  "Sem compromisso de contratação",
];

export function LandingCTA() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ nome: "", empresa: "", email: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // CTA visual — sem envio para API (endpoint comercial não configurado).
    // Para captar leads, configure um endpoint ou canal comercial e conecte aqui.
    setSubmitted(true);
    setForm({ nome: "", empresa: "", email: "" });
  };

  return (
    <section id="contato" className="py-20 lg:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div className="space-y-6">
            <div>
              <span className="inline-block text-xs font-semibold text-[#2563EB] uppercase tracking-widest mb-3">
                Demonstração
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#111827] mb-4">
                Veja o Kronos em funcionamento para a sua operação.
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed">
                Agende uma demonstração e conheça como o Kronos centraliza jornada, documentos,
                aprovações, privacidade e relatórios legais em uma única plataforma.
              </p>
            </div>

            <ul className="space-y-3">
              {DEMO_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-[#475569] text-sm">
                  <CheckCircle size={16} className="text-[#16A34A] flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#2563EB]/5 border border-[#2563EB]/10">
              <Calendar size={18} className="text-[#2563EB] flex-shrink-0" />
              <p className="text-sm text-[#64748B]">
                Já é cliente?{" "}
                <Link to="/login" className="text-[#2563EB] hover:underline font-medium">
                  Acesse a plataforma →
                </Link>
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 lg:p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto">
                  <CheckCircle size={28} className="text-[#16A34A]" />
                </div>
                <h3 className="text-lg font-semibold text-[#111827]">Solicitação registrada</h3>
                <p className="text-sm text-[#64748B]">
                  Entraremos em contato em breve para agendar sua demonstração.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm text-[#2563EB] hover:underline"
                >
                  Enviar outra solicitação
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-[#111827] mb-2">Agendar demonstração</h3>
                <p className="text-sm text-[#64748B] mb-6">
                  Preencha os dados abaixo e entraremos em contato.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="cta-nome" className="block text-sm font-medium text-[#374151] mb-1.5">
                      Nome
                    </label>
                    <input
                      id="cta-nome"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.nome}
                      onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#111827] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors min-h-[44px]"
                      placeholder="Seu nome"
                    />
                  </div>

                  <div>
                    <label htmlFor="cta-empresa" className="block text-sm font-medium text-[#374151] mb-1.5">
                      Empresa
                    </label>
                    <input
                      id="cta-empresa"
                      type="text"
                      required
                      autoComplete="organization"
                      value={form.empresa}
                      onChange={(e) => setForm((f) => ({ ...f, empresa: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#111827] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors min-h-[44px]"
                      placeholder="Nome da empresa"
                    />
                  </div>

                  <div>
                    <label htmlFor="cta-email" className="block text-sm font-medium text-[#374151] mb-1.5">
                      E-mail corporativo
                    </label>
                    <input
                      id="cta-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#111827] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors min-h-[44px]"
                      placeholder="seu@empresa.com"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2563EB] text-white font-semibold hover:bg-[#1E3A8A] transition-colors min-h-[48px] text-sm"
                  >
                    Solicitar demonstração
                    <ArrowRight size={16} />
                  </button>

                  <p className="text-xs text-[#94A3B8] text-center">
                    Seus dados são usados apenas para contato. Não armazenamos informações pessoais neste formulário.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
