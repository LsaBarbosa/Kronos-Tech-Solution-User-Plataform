import { useState, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Download, 
  Scale, 
  AlertCircle, 
  FileCode, 
  FileSignature, 
  BadgeCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";

// UI Components
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

// Services
import { FiscalService } from "@/service/fiscal.service";
import PageShell from "@/components/PageShell";

export default function AuditoriaFiscal() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState<"AFD" | "AEJ" | "ATESTADO">("AEJ");
  const [isLoading, setIsLoading] = useState(false);
   const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  // Controle do Calendário
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { toast } = useToast();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsCalendarOpen(false); // <--- Fecha o calendário ao selecionar
  };

  const handleDownload = async () => {
    // Validação básica (Atestado é estático e não precisa de data)
    if (reportType !== "ATESTADO" && !date) {
      toast({ variant: "destructive", title: "Data obrigatória", description: "Selecione o mês de referência." });
      return;
    }

    setIsLoading(true);

    try {
      const year = date?.getFullYear() || 2024;
      const month = date?.getMonth() || 0;
      
      // Define inicio e fim do mês
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      toast({ title: "Processando...", description: `Gerando arquivo ${reportType}...` });

      switch (reportType) {
        case "AFD":
          await FiscalService.downloadAfd();
          break;
        case "AEJ":
          await FiscalService.downloadAej(startDate, endDate);
          break;
        case "ATESTADO":
          await FiscalService.downloadTechnicalCertificate();
          break;
      }

      toast({ title: "Sucesso!", description: "Arquivo baixado com sucesso.", variant: "default" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao baixar o arquivo solicitado." });
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
      <div className="mx-auto max-w-3xl mt-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl mt-4 font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                  Auditoria Fiscal</h1>
                <p className="text-muted-foreground">Comunique-se de forma clara e objetiva com a equipe.</p>
              </div>
            </div>
          </div>
        <Card className="shadow-lg border-t-4 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Scale className="h-6 w-6 text-primary" />
              Arquivos Legais (Portaria 671)
            </CardTitle>
            <CardDescription>
              Emissão de arquivos fiscais para auditoria, fiscalização e controle de jornada.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            
            {/* 1. Seleção do Tipo de Relatório */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Tipo de Arquivo</Label>
              <RadioGroup 
                defaultValue="AEJ" 
                value={reportType} 
                onValueChange={(v) => setReportType(v as "AFD" | "AEJ" | "ATESTADO")}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* Opção AEJ */}
                <div>
                  <RadioGroupItem value="AEJ" id="aej" className="peer sr-only" />
                  <Label
                    htmlFor="aej"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all h-full"
                  >
                    <FileSignature className="mb-3 h-6 w-6 text-muted-foreground peer-data-[state=checked]:text-primary" />
                    <span className="font-semibold text-sm">AEJ</span>
                    <span className="text-xs text-muted-foreground text-center mt-1">Arquivo Eletrônico de Jornada</span>
                  </Label>
                </div>

                {/* Opção AFD */}
                <div>
                  <RadioGroupItem value="AFD" id="afd" className="peer sr-only" />
                  <Label
                    htmlFor="afd"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all h-full"
                  >
                    <FileCode className="mb-3 h-6 w-6 text-muted-foreground peer-data-[state=checked]:text-primary" />
                    <span className="font-semibold text-sm">AFD</span>
                    <span className="text-xs text-muted-foreground text-center mt-1">Arquivo Fonte de Dados</span>
                  </Label>
                </div>

                {/* Opção Atestado */}
                <div>
                  <RadioGroupItem value="ATESTADO" id="atestado" className="peer sr-only" />
                  <Label
                    htmlFor="atestado"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all h-full"
                  >
                    <BadgeCheck className="mb-3 h-6 w-6 text-muted-foreground peer-data-[state=checked]:text-primary" />
                    <span className="font-semibold text-sm">Atestado</span>
                    <span className="text-xs text-muted-foreground text-center mt-1">Certificado Técnico</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Renderização Condicional dos Filtros */}
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
              
              {/* Aviso para Atestado (que não tem filtros) */}
              {reportType === "ATESTADO" && (
                 <Alert className="bg-muted/50">
                   <AlertCircle className="h-4 w-4" />
                   <AlertTitle>Arquivo Estático</AlertTitle>
                   <AlertDescription>
                     O Atestado Técnico é um documento da empresa e não depende de data ou colaborador específico.
                   </AlertDescription>
                 </Alert>
              )}

              {/* Filtros para AEJ e AFD */}
              {reportType !== "ATESTADO" && (
                <>
                  {/* 3. Seleção de Data (Com fechamento automático) */}
                  <div className="flex flex-col space-y-2">
                    <Label>Mês de Referência</Label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal h-11",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "MMMM 'de' yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={handleDateSelect} // Usa a função que fecha o modal
                          initialFocus
                          locale={ptBR}
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}
            </div>

          </CardContent>

          <CardFooter className="flex justify-end pt-4 border-t bg-muted/20">
            <Button 
              size="lg" 
              onClick={handleDownload} 
              disabled={isLoading || (reportType !== "ATESTADO" && !date)}
              className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/70 text-white"
            >
              {isLoading ? (
                "Gerando..."
              ) : (
                <>
                  <Download className="h-5 w-5" /> 
                  Baixar {reportType}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageShell>
  );
}
