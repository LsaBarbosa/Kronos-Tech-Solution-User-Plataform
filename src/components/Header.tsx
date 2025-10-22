// src/components/Header.tsx

import { Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";

// 💡 Interface ajustada para usar 'toggleSidebar'
interface HeaderProps {
  toggleSidebar: () => void; 
}

// 💡 Propriedade desestruturada ajustada para 'toggleSidebar'
const Header = ({ toggleSidebar }: HeaderProps) => {

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side - Hamburger menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            // 💡 Chamada da função de toggle
            onClick={toggleSidebar} 
            className="text-primary hover:bg-primary/10 hover:text-primary transition-colors focus-visible:ring-primary/20"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Right side - Theme Toggle */}
        <div className="flex items-center gap-2 md:gap-4 pr-2 md:pr-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;