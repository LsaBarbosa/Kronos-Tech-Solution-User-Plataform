import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import logoAzul from "@/assets/brand/logo-azul.png";
import logoBranca from "@/assets/brand/logo-branca.png";
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
          ? "bg-[#030d1a]/90 backdrop-blur-xl border-b border-white/8 shadow-[0_1px_40px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <a href="/" aria-label="Kronos — Página inicial" className="flex-shrink-0">
            <img
              src={logoBranca}
              alt="Kronos"
              className="h-7 w-auto transition-opacity hover:opacity-80"
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navegação principal">
            {LANDING_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/8 transition-all duration-150 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-2.5">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/8 transition-all duration-150"
            >
              Entrar
            </Link>
            <button
              onClick={() => scrollTo("contato")}
              className="group flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-all duration-200 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              Agendar demo
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/8 transition-all"
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
        } bg-[#030d1a]/95 backdrop-blur-xl border-t border-white/8`}
      >
        <nav className="px-4 py-4 space-y-1" aria-label="Navegação mobile">
          {LANDING_NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/8 transition-all duration-150 min-h-[44px]"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 space-y-2 border-t border-white/8 mt-2">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block w-full text-center px-4 py-3 rounded-xl text-sm font-medium border border-white/15 text-white/80 hover:bg-white/8 transition-all min-h-[44px]"
            >
              Entrar na plataforma
            </Link>
            <button
              onClick={() => scrollTo("contato")}
              className="block w-full px-4 py-3 rounded-xl text-sm font-semibold bg-[#2563EB] text-white hover:bg-[#1d4ed8] transition-all min-h-[44px]"
            >
              Agendar demonstração
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
