// calendar.tsx (Nova versão otimizada)

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      // Contêiner principal com Padding suave 
      className={cn("p-4 sm:p-6", className)}
      classNames={{
        // Estrutura Responsiva
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-8 sm:space-y-0 w-full justify-center",
        month: "space-y-4 w-full",
        
        // Cabeçalho e Navegação
        caption: "flex justify-center pt-1 relative items-center w-full mb-2",
        caption_label: "text-base font-semibold text-foreground",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-primary/10 transition-colors duration-150 rounded-full"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        
        // Tabela de Dias
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-2",
        head_cell:
          "text-muted-foreground rounded-md flex-1 font-medium text-xs sm:text-sm uppercase tracking-wider",
        row: "flex w-full mt-1.5 sm:mt-2",
        
        // Células e Dias (Otimização Principal)
        // Aumento para h-11/h-12 para melhor toque em mobile
        cell: "h-11 sm:h-12 flex-1 text-center text-sm p-[2px] relative overflow-hidden",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          // 🚀 TEXTO MAIOR: 'text-base sm:text-lg'
          "h-10 w-10 mx-auto p-0.5 font-normal aria-selected:opacity-100 text-base sm:text-lg rounded-lg transition-all duration-200",
          "flex justify-center items-center", 
          "hover:bg-primary/15 hover:text-foreground/90" 
        ),
        
        // Estilos Padrão (corrigido o erro de tipagem anterior)
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground border-2 border-primary/50",
        day_outside: "text-muted-foreground opacity-50 aria-selected:bg-primary/50 aria-selected:text-primary-foreground aria-selected:opacity-80",
        day_disabled: "text-muted-foreground opacity-30",
        // Estilo correto para intervalo de seleção
        day_range_middle: "aria-selected:bg-primary/10 aria-selected:text-primary", 
        day_hidden: "invisible",
        
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };