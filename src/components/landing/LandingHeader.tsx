import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoAzul from "@/assets/brand/logo-azul.png";
import logoBranca from "@/assets/brand/logo-branca.png";
import { LANDING_NAV } from "@/data/landing-page";

type LandingHeaderProps = {
  darkBg?: boolean;
};

export function LandingHeader({ darkBg = true }: LandingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const logo = darkBg ? logoBranca : logoAzul;
  const textColor = darkBg ? "text-white" : "text-[#111827]";
  const navHover = darkBg ? "hover:text-[#22D3EE]" : "hover:text-[#2563EB]";

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 ${
        darkBg ? "bg-[#06264A]/95 backdrop-blur-sm border-b border-white/10" : "bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" aria-label="Kronos — Página inicial">
            <img src={logo} alt="Kronos" className="h-8 w-auto" />
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Navegação principal">
            {LANDING_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`text-sm font-medium transition-colors ${textColor} ${navHover} cursor-pointer`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                darkBg
                  ? "text-white border border-white/30 hover:bg-white/10"
                  : "text-[#2563EB] border border-[#2563EB] hover:bg-[#2563EB]/10"
              }`}
            >
              Acessar plataforma
            </Link>
            <button
              onClick={() => scrollTo("contato")}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-[#2563EB] text-white hover:bg-[#1E3A8A] transition-colors"
            >
              Agendar demo
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className={`lg:hidden p-2 rounded-md ${textColor}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className={`lg:hidden border-t ${
            darkBg ? "bg-[#06264A] border-white/10" : "bg-white border-[#E2E8F0]"
          }`}
        >
          <nav className="px-4 py-4 space-y-1" aria-label="Navegação mobile">
            {LANDING_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`block w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors ${textColor} ${navHover} min-h-[44px]`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-3 space-y-2 border-t border-white/10 mt-3">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className={`block w-full text-center px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  darkBg
                    ? "text-white border border-white/30 hover:bg-white/10"
                    : "text-[#2563EB] border border-[#2563EB] hover:bg-[#2563EB]/10"
                }`}
              >
                Acessar plataforma
              </Link>
              <button
                onClick={() => scrollTo("contato")}
                className="block w-full px-4 py-3 rounded-lg text-sm font-medium bg-[#2563EB] text-white hover:bg-[#1E3A8A] transition-colors min-h-[44px]"
              >
                Agendar demo
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
