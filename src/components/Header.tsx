// src/components/Header.tsx

import { Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  toggleSidebar: () => void; 
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 relative">
        
        {/* 1. Left side - Hamburger menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar} 
            className="text-primary hover:bg-primary/10 hover:text-primary transition-colors focus-visible:ring-primary/20"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* 2. CENTER - Kronos Solutions Name (CORRIGIDO: Removido 'hidden md:block' e adicionado ajuste de fonte) */}
        {/* Agora visível em todos os tamanhos de tela. */}
       <div 
          className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer" // <-- NOVO: cursor-pointer
          onClick={() => navigate("/dashboard")} // <-- NOVO: Handler de navegação
          title="Ir para o Dashboard" // <-- NOVO: Tooltip
        >
           <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent whitespace-nowrap">
              Kronos Solutions
           </span>
        </div>
        
        {/* 3. Right side - Theme Toggle */}
        <div className="flex items-center gap-2 md:gap-4 pr-2 md:pr-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;