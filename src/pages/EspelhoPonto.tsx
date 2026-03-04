import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Download, FileText, AlertCircle, Users, Sheet } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

// Serviços
import { FiscalService } from "@/service/fiscal.service";
import { fetchEmployeeList } from "@/service/employee.Service"; // Certifique-se que o caminho está correto
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

// Interfaces
interface EmployeeOption {
  employeeId: string;
  fullName: string;
}

export default function EspelhoPonto() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  // Estados para Gestão de Colaboradores
  const [isManager, setIsManager] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("ME"); // "ME" indica o próprio usuário

  const { toast } = useToast();
  const { session } = useAuth();

  // 1. Verifica Permissões e Carrega Lista
  useEffect(() => {
    const role = session?.role || "";
    if (role === "MANAGER" || role === "ADMIN") {
      setIsManager(true);
      loadEmployees();
    }
  }, [session]);

  const loadEmployees = async () => {
    try {
      const list = await fetchEmployeeList();
      // Mapeia para o formato simples necessário para o Select
      const options = list.map((emp: any) => ({
        employeeId: emp.employeeId || emp.id, // Ajuste conforme o retorno exato da sua API
        fullName: emp.fullName || emp.name
      }));
      setEmployees(options);
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error);
      toast({
        variant: "destructive",
        title: "Erro de Carregamento",
        description: "Não foi possível carregar a lista de colaboradores.",
      });
    }
  };

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

      // Define qual ID enviar: undefined se for "ME" (backend pega do token), ou o ID selecionado
      const targetId = selectedEmployeeId === "ME" ? undefined : selectedEmployeeId;
      
      const targetName = selectedEmployeeId === "ME" 
        ? "Meu Espelho" 
        : employees.find(e => e.employeeId === targetId)?.fullName || "Colaborador";

      toast({
        title: "Gerando Relatório",
        description: `Baixando espelho de: ${targetName}...`,
      });

      await FiscalService.downloadMirror(startDate, endDate, targetId);

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
                <Sheet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl mt-4 font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                  Espelho de Ponto</h1>
                <p className="text-muted-foreground">Comunique-se de forma clara e objetiva com a equipe.</p>
              </div>
            </div>
          </div>

      <div className="mx-auto max-w-2xl mt-10">
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
              {/* SELETOR DE COLABORADOR (Apenas Manager) */}
              {isManager && (
                <div className="flex flex-col space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="employee-select" className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    Colaborador Alvo
                  </Label>
                  <Select 
                    value={selectedEmployeeId} 
                    onValueChange={setSelectedEmployeeId}
                  >
                    <SelectTrigger id="employee-select" className="h-12">
                      <SelectValue placeholder="Selecione um colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ME" className="font-semibold text-primary">
                        🙋‍♂️ Meu Próprio Espelho
                      </SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.employeeId} value={employee.employeeId}>
                          {employee.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
            {isManager && selectedEmployeeId !== "ME" && (
                <p className="text-xs text-muted-foreground flex-1 flex items-center">
                   Visualizando como Administrador
                </p>
            )}
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
      </main>
      </div>
    </div>

  );
};