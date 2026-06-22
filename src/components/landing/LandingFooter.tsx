import { Link } from "react-router-dom";
import logoBranca from "@/assets/brand/logo-branca.png";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#06264A] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <img src={logoBranca} alt="Kronos" className="h-8 w-auto" />
            <p className="text-sm text-[#64748B] leading-relaxed">
              Plataforma corporativa para gestão de jornada, colaboradores, documentos e
              conformidade LGPD.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#22D3EE] uppercase tracking-widest">Produto</p>
            <ul className="space-y-2">
              {[
                { label: "Ponto e Jornada", anchor: "jornada" },
                { label: "Pessoas e Empresas", anchor: "pessoas" },
                { label: "Documentos", anchor: "funcionalidades" },
                { label: "Legal e Fiscal", anchor: "funcionalidades" },
                { label: "LGPD e Privacidade", anchor: "lgpd" },
              ].map(({ label, anchor }) => (
                <li key={label}>
                  <button
                    onClick={() => {
                      const el = document.getElementById(anchor);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-sm text-[#94A3B8] hover:text-white transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#22D3EE] uppercase tracking-widest">Legal</p>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy/policy" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/privacy/processing-catalog" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                  Catálogo de Tratamento
                </Link>
              </li>
              <li>
                <Link to="/privacy/biometric-term" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                  Termo de Biometria
                </Link>
              </li>
            </ul>
          </div>

          {/* Access */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#22D3EE] uppercase tracking-widest">Acesso</p>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                  Acessar plataforma
                </Link>
              </li>
              <li>
                <Link to="/senha-primeiro-acesso" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                  Primeiro acesso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#64748B]">
            © {year} Kronos Tech Solutions. Todos os direitos reservados.
          </p>
          <p className="text-xs text-[#64748B]">
            Dados protegidos conforme LGPD · Lei nº 13.709/2018
          </p>
        </div>
      </div>
    </footer>
  );
}
