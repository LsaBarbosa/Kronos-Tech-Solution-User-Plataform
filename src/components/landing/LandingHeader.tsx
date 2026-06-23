import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import logoAzul from "@/assets/brand/logo-azul.png";
import { LANDING_NAV } from "@/data/landing-page";
import { APP_PATHS } from "@/config/app-routes";

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-[#E2E8F0] shadow-[0_1px_20px_rgba(0,0,0,0.06)]"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" aria-label="Kronos — Página inicial" className="flex-shrink-0">
            <img src={logoAzul} alt="Kronos" className="h-7 w-auto" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollTo("contato")}
              className="group flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-all duration-200 shadow-[0_2px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)]"
            >
              Agendar demo
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              className="p-2 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9] transition-all"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu drawer — desktop e mobile */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-[640px] opacity-100" : "max-h-0 opacity-0"
        } bg-white/98 backdrop-blur-xl border-t border-[#E2E8F0]`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" aria-label="Navegação">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1 mb-4">
            {LANDING_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-left px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9] transition-all duration-150 min-h-[44px]"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-[#E2E8F0]">
            <Link
              to={APP_PATHS.senhaPrimeiroAcesso}
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-medium border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] transition-all min-h-[44px]"
            >
              Primeiro acesso
            </Link>
            <Link
              to={APP_PATHS.login}
              onClick={() => setMenuOpen(false)}
              className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-medium border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] transition-all min-h-[44px]"
            >
              Acessar plataforma
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
