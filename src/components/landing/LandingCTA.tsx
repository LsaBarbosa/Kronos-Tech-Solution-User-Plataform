import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, CheckCircle, Sparkles } from "lucide-react";

const DEMO_BENEFITS = [
  "Apresentação dos módulos em uso real",
  "Demonstração de LGPD e relatórios fiscais",
  "Apresentação de segurança e rastreabilidade",
  "Sem compromisso de contratação",
];

export function LandingCTA() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ nome: "", empresa: "", email: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Formulário visual — sem envio para API.
    // Para captação real, conectar handleSubmit a um endpoint ou canal comercial.
    setSubmitted(true);
    setForm({ nome: "", empresa: "", email: "" });
  };

  return (
    <section id="contato" className="py-24 lg:py-32 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Copy */}
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563EB] uppercase tracking-widest mb-4">
                <span className="w-8 h-px bg-[#2563EB]/30" />
                Demonstração
              </span>
              <h2 className="text-3xl lg:text-4xl xl:text-[2.75rem] font-bold text-[#111827] mb-5 leading-tight">
                Veja o Kronos em funcionamento{" "}
                <span className="landing-gradient-text">para a sua operação.</span>
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed">
                Agende uma demonstração e conheça como o Kronos centraliza jornada, documentos,
                aprovações, privacidade e relatórios legais em uma única plataforma.
              </p>
            </div>

            <ul className="space-y-3">
              {DEMO_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-[#374151] text-sm">
                  <span className="w-5 h-5 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={12} className="text-[#16A34A]" />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
              <Calendar size={16} className="text-[#2563EB] flex-shrink-0" />
              <p className="text-sm text-[#374151]">
                Já é cliente?{" "}
                <Link to="/login" className="text-[#2563EB] hover:text-[#1d4ed8] font-semibold transition-colors">
                  Acesse a plataforma →
                </Link>
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
            {/* Top gradient bar */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #2563EB, #22D3EE, #16A34A)" }} />

            <div className="p-6 lg:p-8">
              {submitted ? (
                <div className="text-center py-10 space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-[#16A34A]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#111827] mb-2">Solicitação registrada</h3>
                    <p className="text-sm text-[#64748B]">
                      Entraremos em contato em breve para agendar sua demonstração.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-sm text-[#2563EB] hover:text-[#1d4ed8] transition-colors hover:underline"
                  >
                    Enviar outra solicitação
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={16} className="text-[#2563EB]" />
                    <h3 className="text-lg font-bold text-[#111827]">Agendar demonstração</h3>
                  </div>
                  <p className="text-sm text-[#64748B] mb-7">
                    Preencha os dados abaixo e entraremos em contato.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {[
                      { id: "cta-nome", label: "Nome", type: "text", key: "nome", placeholder: "Seu nome", autocomplete: "name" },
                      { id: "cta-empresa", label: "Empresa", type: "text", key: "empresa", placeholder: "Nome da empresa", autocomplete: "organization" },
                      { id: "cta-email", label: "E-mail corporativo", type: "email", key: "email", placeholder: "seu@empresa.com", autocomplete: "email" },
                    ].map(({ id, label, type, key, placeholder, autocomplete }) => (
                      <div key={id}>
                        <label htmlFor={id} className="block text-xs font-semibold text-[#374151] mb-1.5 uppercase tracking-wide">
                          {label}
                        </label>
                        <input
                          id={id}
                          type={type}
                          required
                          autoComplete={autocomplete}
                          value={form[key as keyof typeof form]}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#111827] placeholder:text-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] focus:bg-white transition-all duration-150 min-h-[44px]"
                          placeholder={placeholder}
                        />
                      </div>
                    ))}

                    <button
                      type="submit"
                      className="group w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1d4ed8] transition-all duration-200 shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 min-h-[52px] mt-2"
                    >
                      Solicitar demonstração
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>

                    <p className="text-[10px] text-[#94A3B8] text-center leading-relaxed">
                      Seus dados são usados apenas para contato. Não armazenamos informações pessoais neste formulário.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
