import { useState, useEffect } from "react";
import { Sun, Moon, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/hooks/useTheme";

type ThemeVariant = 'red' | 'purple' | 'blue' | 'yellow' | 'pink' | 'green' | 'gray';

const themes = [
  {
    name: 'Laranja',
    value: 'red' as ThemeVariant,
    colors: { primary: '#f55c5c', secondary: '#000000' }
  },
  {
    name: 'Roxo', 
    value: 'purple' as ThemeVariant,
    colors: { primary: '#8b00ea', secondary: '#000000' }
  },
  {
    name: 'Azul',
    value: 'blue' as ThemeVariant,
    colors: { primary: '#007dea', secondary: '#000000' }
  },
  {
    name: 'Amarelo',
    value: 'yellow' as ThemeVariant,
    colors: { primary: '#eaab00', secondary: '#000000' }
  },
  {
    name: 'Rosa',
    value: 'pink' as ThemeVariant,
    colors: { primary: '#ea0087', secondary: '#000000' }
  },
  {
    name: 'Verde',
    value: 'green' as ThemeVariant,
    colors: { primary: '#00b300', secondary: '#000000' }
  },
  {
    name: 'Cinza',
    value: 'gray' as ThemeVariant,
    colors: { primary: '#666666', secondary: '#000000' }
  }
];

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [currentColorTheme, setCurrentColorTheme] = useState<ThemeVariant>(() => {
    const saved = localStorage.getItem("color-theme") as ThemeVariant;
    return saved || "red";
  });
  const [open, setOpen] = useState(false);

  // Apply and persist color theme on mount and when it changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-purple", "theme-blue", "theme-yellow", "theme-red", "theme-pink", "theme-green", "theme-gray");
    root.classList.add(`theme-${currentColorTheme}`);
    localStorage.setItem("color-theme", currentColorTheme);
  }, [currentColorTheme]);

  const applyColorTheme = (themeVariant: ThemeVariant) => {
    setCurrentColorTheme(themeVariant);
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          aria-label="Configurações de tema"
        >
          <Palette className="h-5 w-5 text-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 bg-background/95 backdrop-blur-sm border border-border shadow-2xl" align="end">
        <div className="space-y-4">
          {/* Light/Dark Mode Section */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Modo de Exibição
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={theme === "dark" ? handleThemeToggle : undefined}
                className="justify-start"
              >
                <Sun className="h-4 w-4 mr-2" />
                Claro
                {theme === "light" && <Check className="h-4 w-4 ml-auto" />}
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={theme === "light" ? handleThemeToggle : undefined}
                className="justify-start"
              >
                <Moon className="h-4 w-4 mr-2" />
                Escuro
                {theme === "dark" && <Check className="h-4 w-4 ml-auto" />}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Color Theme Section */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Esquema de Cores
            </h3>
            <div className="space-y-2">
              {themes.map((themeOption) => (
                <Button
                  key={themeOption.value}
                  variant={currentColorTheme === themeOption.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => applyColorTheme(themeOption.value)}
                  className="w-full justify-start"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: themeOption.colors.primary }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: themeOption.colors.secondary }}
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {themeOption.name}
                    </span>
                    {currentColorTheme === themeOption.value && (
                      <Check className="h-4 w-4 ml-auto" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeToggle;