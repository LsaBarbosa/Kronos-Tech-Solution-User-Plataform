import { Link } from "react-router-dom";
import logoBranca from "@/assets/brand/logo-branca.png";

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[#030d1a] border-t border-white/6 overflow-hidden">
      {/* Top gradient accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #2563EB40, #22D3EE40, #16A34A40, transparent)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <img src={logoBranca} alt="Kronos" className="h-7 w-auto" />
            <p className="text-sm text-[#475569] leading-relaxed">
              Plataforma corporativa para gestão de jornada, colaboradores, documentos e
              conformidade LGPD.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span className="text-xs text-[#475569]">Sistema operacional</span>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-widest">Produto</p>
            <ul className="space-y-2.5">
              {[
                { label: "Ponto e Jornada", anchor: "jornada" },
                { label: "Pessoas e Empresas", anchor: "pessoas" },
                { label: "Documentos", anchor: "funcionalidades" },
                { label: "Legal e Fiscal", anchor: "funcionalidades" },
                { label: "LGPD e Privacidade", anchor: "lgpd" },
              ].map(({ label, anchor }) => (
                <li key={label}>
                  <button
                    onClick={() => scrollTo(anchor)}
                    className="text-sm text-[#475569] hover:text-white transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-widest">Legal</p>
            <ul className="space-y-2.5">
              <li>
                <Link to="/privacy/policy" className="text-sm text-[#475569] hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/privacy/processing-catalog" className="text-sm text-[#475569] hover:text-white transition-colors">
                  Catálogo de Tratamento
                </Link>
              </li>
              <li>
                <Link to="/privacy/biometric-term" className="text-sm text-[#475569] hover:text-white transition-colors">
                  Termo de Biometria
                </Link>
              </li>
            </ul>
          </div>

          {/* Access */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-widest">Acesso</p>
            <ul className="space-y-2.5">
              <li>
                <Link to="/login" className="text-sm text-[#475569] hover:text-white transition-colors">
                  Acessar plataforma
                </Link>
              </li>
              <li>
                <Link to="/senha-primeiro-acesso" className="text-sm text-[#475569] hover:text-white transition-colors">
                  Primeiro acesso
                </Link>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("contato")}
                  className="text-sm text-[#475569] hover:text-white transition-colors"
                >
                  Agendar demonstração
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p className="text-xs text-[#334155]">
            © {year} Kronos Tech Solutions. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#334155]">Dados protegidos conforme</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: "#22D3EE", background: "rgba(34,211,238,0.1)" }}
            >
              LGPD · Lei 13.709/2018
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
