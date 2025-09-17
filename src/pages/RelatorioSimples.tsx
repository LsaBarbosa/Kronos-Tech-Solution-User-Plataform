import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Download, Search, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import { API_BASE_URL } from "@/config/api";

// Auxiliary function to get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error("Token não encontrado.");
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Nova função para decodificar o token JWT
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(payload);
  } catch (error) {
    console.error("Falha ao decodificar o token", error);
    return null;
  }
};

// Função para obter feriados nacionais do Brasil
const getBrazilianHolidays = (year) => {
  const holidays = [];

  // Feriados fixos
  holidays.push(new Date(year, 0, 1)); // Confraternização Universal
  holidays.push(new Date(year, 3, 21)); // Tiradentes
  holidays.push(new Date(year, 4, 1)); // Dia do Trabalhador
  holidays.push(new Date(year, 8, 7)); // Independência do Brasil
  holidays.push(new Date(year, 9, 12)); // Nossa Senhora Aparecida
  holidays.push(new Date(year, 10, 2)); // Finados
  holidays.push(new Date(year, 10, 15)); // Proclamação da República
  holidays.push(new Date(year, 11, 25)); // Natal

  // Carnaval (47 dias antes da Páscoa)
  const easter = getEasterDate(year);
  const carnival = new Date(easter);
  carnival.setDate(easter.getDate() - 47);
  holidays.push(carnival);

  // Sexta-feira Santa (2 dias antes da Páscoa)
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  holidays.push(goodFriday);

  // Corpus Christi (60 dias após a Páscoa)
  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);
  holidays.push(corpusChristi);

  return holidays;
};

// Função para calcular a data da Páscoa
const getEasterDate = (year) => {
  const f = Math.floor;
  const G = year % 19;
  const C = f(year / 100);
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
  const L = I - J;
  const month = 3 + f((L + 40) / 44);
  const day = L + 28 - 31 * f(month / 4);
  return new Date(year, month - 1, day);
};

// Interface para os dados do relatório
interface ReportDay {
  startDate: string;
  totalHours: string;
  balance: string;
}

interface ReportData {
  totalHoursWorked: string;
  totalBalance: string;
  days: ReportDay[];
  employeeName?: string;
  companyName?: string;
}

interface Employee {
  employeeId: string;
  fullName: string; // Updated from employeeName
}

const RelatorioSimples = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [referenceTime, setReferenceTime] = useState("08:00");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeActive, setEmployeeActive] = useState("active");
  const [recordActive, setRecordActive] = useState("active");
  const [employees, setEmployees] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [isPartner, setIsPartner] = useState(false);
  const { toast } = useToast();

  // Função para buscar funcionários
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const decoded = decodeToken(token);
      const userRole = decoded?.role;
      const userId = decoded?.employeeId;
      const userName = decoded?.fullName;

      if (userRole === "PARTNER") {
        setIsPartner(true);
        setEmployees([{ employeeId: userId, fullName: userName }]);
        setSelectedEmployee(userId);
        return;
      } else {
        setIsPartner(false);
      }
      
      const endpoint = `${API_BASE_URL}employee?active=${employeeActive === "active"}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
        if (!selectedEmployee) {
          setSelectedEmployee("");
        }
      }
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [employeeActive]); // Re-fetch employees when the active filter changes

  // Obter feriados para o ano atual e próximo
  const currentYear = new Date().getFullYear();
  const holidays = [
    ...getBrazilianHolidays(currentYear),
    ...getBrazilianHolidays(currentYear + 1)
  ];

  // Função para verificar se uma data é feriado
  const isHoliday = (date) => {
    return holidays.some(holiday =>
      holiday.toDateString() === date.toDateString()
    );
  };

  const handleSearch = async () => {
    if (selectedDates.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione pelo menos uma data.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      // Preparar dados para enviar no corpo da requisição (POST)
      const formattedDates = selectedDates.map(date => format(date, "dd-MM-yyyy"));
      const requestBody = {
        reference: referenceTime,
        dates: formattedDates,
        employeeActive: employeeActive === "active",
        recordActive: recordActive === "active",
      };

      // Construir URL com employeeId como query parameter
      const apiUrl = new URL(`${API_BASE_URL}records/report/simple`, window.location.origin);
      if (selectedEmployee) {
        apiUrl.searchParams.append("employeeId", selectedEmployee);
      }

      const response = await fetch(apiUrl.toString(), {
        method: "POST", // Altere o método para POST
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody), // Mantenha o corpo da requisição
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar o relatório. Tente novamente mais tarde.");
      }

      const data = await response.json();
      setReportData(data);

      const datesList = selectedDates
        .sort((a, b) => a.getTime() - b.getTime())
        .map(date => format(date, "dd/MM/yyyy", { locale: ptBR }))
        .join(", ");

      toast({
        title: "Busca realizada",
        description: `Relatório gerado para as datas: ${datesList} (Referência: ${referenceTime})`,
      });
    } catch (error) {
      console.error("Erro na busca:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao buscar o relatório.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!reportData || reportData.days.length === 0) {
      toast({
        title: "Erro",
        description: "Gere o relatório primeiro para poder fazer o download.",
        variant: "destructive"
      });
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text('RELATÓRIO SIMPLES DE PONTO', 20, 25);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      let yPosition = 40;

      if (reportData.employeeName) {
        doc.text(`Funcionário: ${reportData.employeeName}`, 20, yPosition);
        yPosition += 7;
      }

      if (reportData.companyName) {
        doc.text(`Empresa: ${reportData.companyName}`, 20, yPosition);
        yPosition += 7;
      }

      doc.text(`Referência: ${referenceTime}`, 20, yPosition);
      yPosition += 7;

      if (selectedDates.length > 0) {
        const datesList = selectedDates
          .map(date => format(date, "dd/MM/yyyy", { locale: ptBR }))
          .join(", ");
        doc.text(`Datas: ${datesList}`, 20, yPosition);
        yPosition += 10;
      }

      // Adicionando os totais antes da tabela
      doc.setFont("helvetica", "bold");
      doc.text(`Total de Horas Trabalhadas: ${reportData.totalHoursWorked}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Saldo Total: ${reportData.totalBalance}`, 20, yPosition);
      yPosition += 10;

      const tableData = reportData.days.map(day => {
        const dayDate = new Date(day.startDate.split('/').reverse().join('-'));
        const holiday = isHoliday(dayDate) ? '🎉' : '';
        return [
          `${day.startDate} ${holiday}`,
          day.totalHours,
          day.balance,
        ];
      });

      autoTable(doc, {
        head: [['Data', 'Total de Horas', 'Saldo do Dia']],
        body: tableData,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          halign: 'center'
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        columnStyles: {
          2: { // Coluna do saldo
            cellWidth: 25,
            halign: 'center'
          }
        },
        didParseCell: function(data) {
          // Colorir saldo positivo/negativo
          if (data.column.index === 2 && data.section === 'body') {
            const balance = data.cell.text[0];
            if (balance && balance.startsWith('-')) {
              data.cell.styles.textColor = [220, 53, 69]; // Vermelho para negativo
              data.cell.styles.fontStyle = 'bold';
            } else if (balance && !balance.startsWith('-') && balance !== '00:00') {
              data.cell.styles.textColor = [40, 167, 69]; // Verde para positivo
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, doc.internal.pageSize.height - 10);
      }

      const fileName = `relatorio_simples_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF Gerado",
        description: "Relatório simples baixado com sucesso!",
      });

    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const removeDateSelection = (dateToRemove) => {
    setSelectedDates(prev =>
      prev.filter(date => date.getTime() !== dateToRemove.getTime())
    );
  };

  const clearAllDates = () => {
    setSelectedDates([]);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: 'linear-gradient(-45deg, hsl(var(--secondary)), hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)))',
            backgroundSize: '400% 400%',
            animation: 'gradient-flow 15s ease-in-out infinite'
          }}
        />

        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/4 w-32 h-32 opacity-3"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), transparent)',
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
              animation: 'float-shapes 20s ease-in-out infinite'
            }}
          />
          <div
            className="absolute top-3/4 right-1/4 w-48 h-48 opacity-2"
            style={{
              background: 'linear-gradient(45deg, hsl(var(--secondary) / 0.05), transparent)',
              borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
              animation: 'float-shapes 25s ease-in-out infinite reverse'
            }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-24 h-24 opacity-4"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.08), transparent)',
              borderRadius: '50%',
              animation: 'float-shapes 18s ease-in-out infinite 5s'
            }}
          />
        </div>
      </div>

      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-16 px-6 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-2">
              Relatório Simples
            </h1>
            <p className="text-muted-foreground">
              Selecione o período para gerar seu relatório
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendário */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Selecionar Período
                </h2>
                <p className="text-sm text-muted-foreground">
                  Escolha as datas para o relatório
                </p>
              </div>
              
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={setSelectedDates}
                numberOfMonths={1}
                locale={ptBR}
                className="rounded-lg border border-border bg-card shadow-lg pointer-events-auto p-4"
                modifiers={{
                  holiday: holidays,
                  selected: selectedDates
                }}
                modifiersStyles={{
                  holiday: {
                    color: 'hsl(var(--primary))',
                    fontWeight: 'bold',
                    textDecoration: 'underline'
                  },
                  selected: {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    fontWeight: 'bold',
                    borderRadius: '50%'
                  }
                }}
                disabled={(date) => date > new Date()}
              />
            </div>

            {/* Datas Selecionadas */}
            <Card className="shadow-card border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
              <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-foreground flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      Datas Selecionadas
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Confirme as datas antes de gerar o relatório
                    </CardDescription>
                  </div>
                  {selectedDates.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllDates}
                      className="text-muted-foreground hover:text-foreground hover:bg-primary/10"
                    >
                      Limpar todas
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-primary/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        Datas selecionadas:
                      </p>
                      <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {selectedDates.length} {selectedDates.length === 1 ? 'data' : 'datas'}
                      </span>
                    </div>

                    {selectedDates.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full border-2 border-primary/30"></div>
                        </div>
                        <p className="text-muted-foreground italic">Nenhuma data selecionada</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedDates
                          .sort((a, b) => a.getTime() - b.getTime())
                          .map((date, index) => (
                          <div key={index} className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-secondary/10 p-3 rounded-lg border border-primary/20 hover:from-primary/15 hover:to-secondary/15 transition-all duration-200">
                            <span className="font-semibold text-foreground flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              {format(date, "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDateSelection(date)}
                              className="h-7 w-7 p-0 hover:bg-destructive/20 hover:text-destructive rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-primary mb-1">💡 Dica de uso:</p>
                    <p className="text-xs text-gray-text">
                      Clique em qualquer data no calendário para selecioná-la. Os feriados nacionais brasileiros estão destacados automaticamente com sublinhado.
                    </p>
                  </div>
                </div>

                {/* Campo de Referência */}
                <div className="space-y-3 pt-4 border-t border-gray-border">
                  <div className="space-y-2">
                    <Label htmlFor="reference-time" className="text-sm font-medium text-foreground">
                      Referência
                    </Label>
                    <Input
                      id="reference-time"
                      type="time"
                      value={referenceTime}
                      onChange={(e) => setReferenceTime(e.target.value)}
                      className="border-gray-border focus:border-primary focus:ring-primary/20"
                    />
                    <p className="text-xs text-gray-text mt-1">
                      Horário de referência para cálculo do relatório
                    </p>
                  </div>

                  {/* Seleção de Funcionário */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      Funcionário
                    </Label>
                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={isPartner}>
                      <SelectTrigger className="border-gray-border focus:border-primary focus:ring-primary/20">
                        <SelectValue placeholder="Selecione um funcionário" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.employeeId} value={employee.employeeId}>
                            {employee.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Funcionário */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      Status do Funcionário
                    </Label>
                    <RadioGroup value={employeeActive} onValueChange={setEmployeeActive}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="active" id="employee-active" />
                        <Label htmlFor="employee-active" className="text-sm cursor-pointer">
                          Ativo
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inactive" id="employee-inactive" />
                        <Label htmlFor="employee-inactive" className="text-sm cursor-pointer">
                          Inativo
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Status Registro */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      Status do Registro
                    </Label>
                    <RadioGroup value={recordActive} onValueChange={setRecordActive}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="active" id="record-active" />
                        <Label htmlFor="record-active" className="text-sm cursor-pointer">
                          Ativo
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inactive" id="record-inactive" />
                        <Label htmlFor="record-inactive" className="text-sm cursor-pointer">
                          Inativo
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="space-y-3 pt-4">{/* MODIFIED: Removed the top border, now the Referência field has it */}
                  <Button
                    onClick={handleSearch}
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-button transition-smooth"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Buscar
                  </Button>

                  <Button
                    onClick={handleDownload}
                    size="lg"
                    variant="outline" // Assuming a variant exists for download button
                    className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold shadow-lg transition-smooth"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exibição do Relatório */}
          {reportData && (
            <div className="mt-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Resultado do Relatório
                </h2>
                <p className="text-gray-text">
                  Resumo das horas trabalhadas e detalhes por dia
                </p>
              </div>

              {/* Seção de Totais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="shadow-card">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-text mb-2">
                      Total de Horas Trabalhadas
                    </h3>
                    <p className="text-4xl font-bold text-foreground">
                      {reportData.totalHoursWorked}
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-text mb-2">
                      Saldo Total
                    </h3>
                    <p className={`text-4xl font-bold ${
                      reportData.totalBalance.startsWith('-')
                        ? 'text-destructive-light'
                        : 'text-success-light'
                    }`}>
                      {reportData.totalBalance}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabela de Detalhes */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    Detalhes por Dia
                  </CardTitle>
                  <CardDescription className="text-gray-text">
                    Visualização detalhada das horas trabalhadas e saldo de cada dia
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-border">
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Data
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Total de Horas
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">
                            Saldo do Dia
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.days.map((day, index) => {
                          const dayDate = new Date(day.startDate.split('/').reverse().join('-'));
                          const holiday = isHoliday(dayDate);
                          return (
                            <tr
                              key={index}
                              className={`border-b border-gray-border/50 ${
                                index % 2 === 0 ? 'bg-gray-light/30' : 'bg-background'
                              } hover:bg-gray-light/50 transition-colors`}
                            >
                              <td className="py-3 px-4 text-foreground font-medium">
                                <div className="flex items-center gap-2">
                                  <span>{day.startDate}</span>
                                  {holiday && (
                                    <span className="text-primary text-sm" title="Feriado">
                                      🎉
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-foreground">
                                {day.totalHours}
                              </td>
                              <td className={`py-3 px-4 font-medium ${
                                day.balance.startsWith('-')
                                  ? 'text-destructive-light'
                                  : 'text-success-light'
                              }`}>
                                {day.balance}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RelatorioSimples;