import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Download, 
  Scale, 
  AlertCircle, 
  Users, 
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";

// Services
import { FiscalService } from "@/service/fiscal.service";
import { fetchEmployeeList } from "@/service/employee.Service";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

// Interfaces
interface EmployeeOption {
  employeeId: string;
  fullName: string;
}

const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(payload);
  } catch (error) { return null; }
};

export default function AuditoriaFiscal() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState<"AFD" | "AEJ" | "ATESTADO">("AEJ");
  const [isLoading, setIsLoading] = useState(false);
   const [sidebarOpen, setSidebarOpen] = useState(false);
      const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  // Controle do Calendário
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Gestão de Colaboradores
  const [isManager, setIsManager] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("ME");

  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      const role = decoded?.role || "";
      if (role === "MANAGER" || role === "ADMIN") {
        setIsManager(true);
        loadEmployees();
      }
    }
  }, []);

  const loadEmployees = async () => {
    try {
      const list = await fetchEmployeeList();
      const options = list.map((emp: any) => ({
        employeeId: emp.employeeId || emp.id,
        fullName: emp.fullName || emp.name
      }));
      setEmployees(options);
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error);
    }
  };

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
      
      // Define ID alvo (se for "ME", envia undefined para o backend pegar do token)
      const targetId = selectedEmployeeId === "ME" ? undefined : selectedEmployeeId;

      toast({ title: "Processando...", description: `Gerando arquivo ${reportType}...` });

      switch (reportType) {
        case "AFD":
          await FiscalService.downloadAfd(targetId);
          break;
        case "AEJ":
          await FiscalService.downloadAej(startDate, endDate, targetId);
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
     <div className="min-h-screen bg-background relative  overflow-hidden">
      {/* Animated Background and Header/Sidebar components */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: 'linear-gradient(-45deg, hsl(var(--black-primary)), hsl(var(--primary)), hsl(var(--black-primary)), hsl(var(--primary)))',
            backgroundSize: '400% 400%',
            animation: 'gradient-flow 15s ease-in-out infinite'
          }}
        />
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/4 w-32 h-32 opacity-3"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.50), transparent)',
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
              animation: 'float-shapes 20s ease-in-out infinite'
            }}
          />
          <div
            className="absolute top-3/4 right-1/4 w-48 h-48 opacity-2"
            style={{
              background: 'linear-gradient(45deg, hsl(var(--black-primary) / 0.50), transparent)',
              borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
              animation: 'float-shapes 25s ease-in-out infinite reverse'
            }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-24 h-24 opacity-4"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.50), transparent)',
              borderRadius: '50%',
              animation: 'float-shapes 18s ease-in-out infinite 5s'
            }}
          />
        </div>
      </div>

    <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 💡 CORREÇÃO: Header usa 'toggleSidebar' */}
        <Header toggleSidebar={handleToggleSidebar} />

       <main className="pt-16 mobile-container py-4 sm:py-20 space-y-6 sm:space-y-8 relative z-10">
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
      <div className="mx-auto max-w-3xl mt-10">
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
                onValueChange={(v) => setReportType(v as any)}
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
                  {/* 2. Seleção de Colaborador (Apenas Manager) */}
                  {isManager && (
                    <div className="flex flex-col space-y-2">
                      <Label className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        Colaborador (Filtro Opcional)
                      </Label>
                      <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ME" className="font-semibold text-primary">
                            🙋‍♂️ Minha Unidade / Todos
                          </SelectItem>
                          {employees.map((e) => (
                            <SelectItem key={e.employeeId} value={e.employeeId}>{e.fullName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground">
                        * Deixe em "Minha Unidade" para baixar o arquivo completo da empresa (comum para AFD).
                      </p>
                    </div>
                  )}

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
      </main>
      </div>
    </div>
  );
}