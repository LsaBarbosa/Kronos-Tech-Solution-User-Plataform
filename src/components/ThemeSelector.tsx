import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";
import { readStoredValue, writeStoredValue } from "@/lib/browser";

type ThemeVariant = "kronos";

const themes = [
  {
    name: "Kronos Azul Royal",
    value: "kronos" as ThemeVariant,
    colors: ["bg-primary", "bg-secondary"],
  }
];

const ThemeSelector = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeVariant>(() => {
    const savedTheme = readStoredValue("color-theme") as ThemeVariant | null;
    return savedTheme === "kronos" ? savedTheme : "kronos";
  });

  const applyTheme = (theme: ThemeVariant) => {
    writeStoredValue("color-theme", theme);
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
                {theme.colors.map((colorClass) => (
                  <div
                    key={colorClass}
                    className={`w-4 h-4 rounded-full border border-border ${colorClass}`}
                  />
                ))}
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
