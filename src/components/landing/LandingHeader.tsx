import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import logoAzul from "@/assets/brand/logo-azul.png";
import { LANDING_NAV } from "@/data/landing-page";

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

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navegação principal">
            {LANDING_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9] transition-all duration-150 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-2.5">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9] transition-all duration-150"
            >
              Entrar
            </Link>
            <button
              onClick={() => scrollTo("contato")}
              className="group flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-all duration-200 shadow-[0_2px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_20px_rgba(37,99,235,0.4)]"
            >
              Agendar demo
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9] transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        } bg-white/98 backdrop-blur-xl border-t border-[#E2E8F0]`}
      >
        <nav className="px-4 py-4 space-y-1" aria-label="Navegação mobile">
          {LANDING_NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9] transition-all duration-150 min-h-[44px]"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 space-y-2 border-t border-[#E2E8F0] mt-2">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block w-full text-center px-4 py-3 rounded-xl text-sm font-medium border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] transition-all min-h-[44px]"
            >
              Entrar na plataforma
            </Link>
            <button
              onClick={() => scrollTo("contato")}
              className="block w-full px-4 py-3 rounded-xl text-sm font-semibold bg-[#2563EB] text-white hover:bg-[#1d4ed8] transition-all min-h-[44px] shadow-[0_2px_12px_rgba(37,99,235,0.3)]"
            >
              Agendar demonstração
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
