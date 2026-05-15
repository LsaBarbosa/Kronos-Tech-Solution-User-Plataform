// src/components/Header.tsx

import { Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { headerStyles } from "@/utils/layout-colors";

interface HeaderProps {
  toggleSidebar: () => void; 
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className={headerStyles.container}>
      <div className={headerStyles.content + " relative"}>

        {/* 1. Left side - Hamburger menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Abrir menu lateral"
            className="text-primary hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* 2. Center - Logo */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <img
            src="/Kronos_logo.png"
            alt="Kronos Tech Solution"
            onClick={() => navigate("/dashboard")}
            className={headerStyles.logo}
          />
        </div>

        {/* 3. Right side - Theme Toggle */}
        <div className={headerStyles.actionGroup}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;