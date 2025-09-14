import { Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side - Hamburger menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="hover:bg-accent hover:text-accent-foreground transition-colors"
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