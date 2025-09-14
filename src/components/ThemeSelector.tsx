import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";

type ThemeVariant = 'red' | 'purple' | 'blue' | 'yellow';

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
  }
];

const ThemeSelector = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeVariant>(() => {
    // Carregar tema salvo do localStorage
    const savedTheme = localStorage.getItem("color-theme") as ThemeVariant;
    return savedTheme || 'red';
  });

  // Aplicar tema salvo quando o componente montar
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('theme-purple', 'theme-blue', 'theme-yellow', 'theme-red', 'theme-pink', 'theme-green', 'theme-gray');
    
    // Apply current theme class
    root.classList.add(`theme-${currentTheme}`);
  }, []);

  const applyTheme = (theme: ThemeVariant) => {
    const root = document.documentElement;
    
    // Remove previous theme classes
     root.classList.remove('theme-purple', 'theme-blue', 'theme-yellow', 'theme-red', 'theme-pink', 'theme-green', 'theme-gray');
    
    // Apply new theme class
    root.classList.add(`theme-${theme}`);
    
    // Salvar no localStorage
    localStorage.setItem("color-theme", theme);
    setCurrentTheme(theme);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Palette className="h-5 w-5" />
          Seletor de Temas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {themes.map((theme) => (
            <Button
              key={theme.value}
              onClick={() => applyTheme(theme.value)}
              variant={currentTheme === theme.value ? "default" : "outline"}
              className="h-auto p-3 flex flex-col items-center gap-2 transition-all duration-200"
            >
              <div className="flex gap-1">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: theme.colors.secondary }}
                />
              </div>
              <span className="text-xs font-medium text-center leading-tight">
                {theme.name}
              </span>
            </Button>
          ))}
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          Clique em um tema para aplicá-lo ao sistema
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;