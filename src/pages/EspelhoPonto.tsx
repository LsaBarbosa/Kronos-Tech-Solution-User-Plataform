import { useState, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Download, FileText, AlertCircle, Sheet } from "lucide-react";
import { cn } from "@/lib/utils";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Serviços
import { FiscalService } from "@/service/fiscal.service";
import PageShell from "@/components/PageShell";

export default function EspelhoPonto() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const { toast } = useToast();

  const handleDownload = async () => {
    if (!date) {
      toast({
        variant: "destructive",
        title: "Data inválida",
        description: "Por favor, selecione um mês de referência.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Define inicio e fim do mês
      const year = date.getFullYear();
      const month = date.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      toast({
        title: "Gerando Relatório",
        description: "Baixando espelho de ponto...",
      });

      await FiscalService.downloadMirror(startDate, endDate);

      toast({
        title: "Sucesso!",
        description: "Arquivo PDF baixado com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro no Download",
        description: "Não foi possível gerar o espelho de ponto. Verifique se há registros no período.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
      mainClassName="pt-16 mobile-container py-4 sm:py-20 space-y-6 sm:space-y-8 relative z-10"
    >
      <div className="mx-auto max-w-2xl mt-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sheet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl mt-4 font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                  Espelho de Ponto</h1>
                <p className="text-muted-foreground">Comunique-se de forma clara e objetiva com a equipe.</p>
              </div>
            </div>
          </div>

        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6 text-primary" />
              Emissão de Relatório Fiscal
            </CardTitle>
            <CardDescription>
              Gere o espelho de ponto oficial (PDF) contendo os registros originais e tratados para fechamento de folha.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            
            <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-600 dark:text-blue-400">Atenção ao Período</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Selecione qualquer dia dentro do mês desejado. O sistema processará automaticamente do dia 01 ao último dia.
              </AlertDescription>
            </Alert>

            <div className="grid gap-6">
              {/* SELETOR DE DATA */}
              <div className="flex flex-col space-y-2">
                <Label>Mês de Referência</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-12 text-lg",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {date ? (
                        format(date, "MMMM 'de' yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      locale={ptBR}
                      disabled={(date) => date > new Date()} 
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-end pt-4 border-t bg-muted/20 gap-3">
            <Button 
              size="lg" 
              onClick={handleDownload} 
              disabled={isLoading || !date}
              className="w-full sm:w-auto gap-2 shadow-md hover:shadow-lg transition-all"
            >
              {isLoading ? (
                "Processando..."
              ) : (
                <>
                  <Download className="h-5 w-5" /> 
                  Baixar PDF
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageShell>
  );
};
