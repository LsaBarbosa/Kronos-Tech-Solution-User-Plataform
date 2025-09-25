import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Removidos os imports de formulário (Form, FormField, useForm, zodResolver, z)
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Search, Download, Edit, Save } from "lucide-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import { API_BASE_URL } from "@/config/api";

const decodeToken = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(payload);
    } catch (error) {
        console.error("Failed to decode token", error);
        return null;
    }
};

const getBrazilianHolidays = (year: number) => {
    const holidays: Date[] = [];

    holidays.push(new Date(year, 0, 1));
    holidays.push(new Date(year, 3, 21));
    holidays.push(new Date(year, 4, 1));
    holidays.push(new Date(year, 8, 7));
    holidays.push(new Date(year, 9, 12));
    holidays.push(new Date(year, 10, 2));
    holidays.push(new Date(year, 10, 15));
    holidays.push(new Date(year, 11, 25));

    const easter = getEasterDate(year);
    const carnival = new Date(easter);
    carnival.setDate(easter.getDate() - 47);
    holidays.push(carnival);

    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);
    holidays.push(goodFriday);

    const corpusChristi = new Date(easter);
    corpusChristi.setDate(easter.getDate() + 60);
    holidays.push(corpusChristi);

    return holidays;
};

const getEasterDate = (year: number) => {
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

const statusOptions = [
    { value: "CREATED", label: "Criado" },
    { value: "PENDING", label: "Pendente" },
    { value: "UPDATED", label: "Atualizado" },
    { value: "UPDATE_REJECTED", label: "Atualização Rejeitada" },
    { value: "DAY_OFF", label: "Folga" },
    { value: "ABSENCE", label: "Ausência" },
    { value: "PENDING_APPROVAL", label: "Aguardando Aprovação" },
    { value: "DOCTOR_APPOINTMENT", label: "Consulta Médica" },
];

// Interface para os dados detalhados
interface DetailedReportItem {
    id?: string;
    timeRecordId: string; 
    startWork: string;
    startHour: string;
    endWork: string;
    endHour: string;
    hoursWork: string;
    balance: string;
    statusRecord: string;
    active: boolean;
    employeeData: {
        employeeName: string;
        companyName: string;
    };
}

interface Employee {
    employeeId: string;
    fullName: string;
}

const RelatorioDetalhado = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // Alterado para aceitar um array de Date, conforme o modo "multiple" do Calendar
    const [selectedDates, setSelectedDates] = useState<Date[]>([]); 
    const [referenceTime, setReferenceTime] = useState("08:00");
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [employeeActive, setEmployeeActive] = useState("active");
    const [isActive, setIsActive] = useState(true);
    const [status, setStatus] = useState("");
    const [reportData, setReportData] = useState<DetailedReportItem[]>([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const { toast } = useToast();
    // O estado 'managers' e o hook 'useForm' foram removidos
    const reportTableRef = useRef(null);
    const [isPartner, setIsPartner] = useState(false);
    
    // Estado para a edição de status
    const [statusUpdate, setStatusUpdate] = useState<{
        timeRecordId: string;
        employeeId: string;
        statusRecord: string;
    }>({
        timeRecordId: "",
        employeeId: "",
        statusRecord: "",
    });

    const fetchEmployees = useCallback(async () => {
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

            const activeStatus = employeeActive === "active";
            const url = `${API_BASE_URL}employee?active=${activeStatus}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Dados do relatório da API:", data);

                setEmployees(data.employees || []);
                // Mantém o funcionário selecionado se existir, caso contrário limpa
                if (!employees.some(emp => emp.employeeId === selectedEmployee)) {
                    setSelectedEmployee("");
                }
            }
        } catch (error) {
            console.error("Erro ao buscar funcionários:", error);
        }
    }, [employeeActive, selectedEmployee]);

    // A função fetchManagers foi removida pois não é mais utilizada.

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const currentYear = new Date().getFullYear();
    const holidays = [
        ...getBrazilianHolidays(currentYear),
        ...getBrazilianHolidays(currentYear + 1)
    ];

    // Removida a função handleDateSelect manual, pois usaremos o setter de estado diretamente.

    const handleSearch = async () => {

        if (!status) {
            toast({
                title: "Erro",
                description: "Selecione um status para gerar o relatório.",
                variant: "destructive"
            });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            const formattedDates = selectedDates.map(date => format(date, "dd-MM-yyyy"));
            const requestBody = {
                reference: referenceTime,
                active: isActive,
                status: status,
                dates: formattedDates,
            };

            const apiUrl = new URL(`${API_BASE_URL}records/report`, window.location.origin);
            if (selectedEmployee) {
                apiUrl.searchParams.append("employeeId", selectedEmployee);
            }

            const response = await fetch(apiUrl.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao buscar o relatório. Tente novamente mais tarde.");
            }

            const data = await response.json();

            if (data.length === 0) {
                setReportData([]);
                toast({
                    title: "Aviso",
                    description: "Não há registro para as datas selecionadas",
                    variant: "default",
                });
                return;
            }

            setReportData(data);

            const datesList = selectedDates
                .map(date => format(date, "dd/MM/yyyy", { locale: ptBR }))
                .join(", ");

            toast({
                title: "Busca realizada",
                description: `Relatório detalhado gerado para as datas: ${datesList}`,
            });
        } catch (error: any) {
            console.error("Erro na busca:", error);
            toast({
                title: "Erro",
                description: error.message || "Ocorreu um erro ao buscar o relatório.",
                variant: "destructive",
            });
        }
    };

const handleDownload = () => {
    const parseDate = (dateString: string) => {
      if (!dateString) return null;
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const date = new Date(`${year}/${month}/${day}`);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      return null;
    };
  
    if (reportData.length === 0) {
      toast({
        title: "Erro",
        description: "Gere o relatório primeiro para poder fazer o download.",
        variant: "destructive"
      });
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text('RELATÓRIO DETALHADO DE PONTO', 20, 25);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      let yPosition = 40;

      if (reportData.length > 0 && reportData[0].employeeData) {
        doc.text(`Funcionário: ${reportData[0].employeeData.employeeName}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Empresa: ${reportData[0].employeeData.companyName}`, 20, yPosition);
        yPosition += 7;
      }

      if (status) {
        const statusLabel = statusOptions.find(opt => opt.value === status)?.label || status;
        doc.text(`Status: ${statusLabel}`, 20, yPosition);
        yPosition += 7;
      }

      doc.text(`Referência: ${referenceTime}`, 20, yPosition);
      yPosition += 7;

      if (selectedDates.length > 0) {
        const validDates = selectedDates.filter(date => date && !isNaN(date.getTime()));
        const datesList = validDates
          .map(date => format(date, "dd/MM/yyyy", { locale: ptBR }))
          .join(", ");
        doc.text(`Datas: ${datesList}`, 20, yPosition);
        yPosition += 10;
      }

      const tableData = reportData.map(item => {
        const startDate = parseDate(item.startWork);
        const endDate = parseDate(item.endWork);

        return [
          startDate ? format(startDate, "dd/MM/yyyy") : 'N/A',
          item.startHour,
          endDate ? format(endDate, "dd/MM/yyyy") : 'N/A',
          item.endHour,
          item.hoursWork,
          item.balance,
          statusOptions.find(opt => opt.value === item.statusRecord)?.label || item.statusRecord
        ];
      });

      autoTable(doc, {
        head: [['Data Entrada', 'Hora Entrada', 'Data Saída', 'Hora Saída', 'Horas Trabalhadas', 'Saldo', 'Status']],
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
          5: {
            cellWidth: 20,
            halign: 'center'
          }
        },
        didParseCell: function(data) {
          if (data.column.index === 5 && data.section === 'body') {
            const balance = data.cell.text[0];
            if (balance && balance.toString().startsWith('-')) {
              data.cell.styles.textColor = [220, 53, 69];
              data.cell.styles.fontStyle = 'bold';
            } else if (balance && !balance.toString().startsWith('-') && balance !== '00:00') {
              data.cell.styles.textColor = [40, 167, 69];
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

      const fileName = `relatorio_detalhado_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF Gerado",
        description: "Relatório detalhado baixado com sucesso!",
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

    const getStatusColor = (status: string) => {
        const baseClass = "text-white";
        switch (status) {
            case "CREATED": return `${baseClass} bg-green-600`;
            case "PENDING": return `${baseClass} bg-yellow-600`;
            case "ABSENCE": return `${baseClass} bg-red-600`;
            default: return `${baseClass} bg-primary`;
        }
    };

    const handleEditRecord = (record: DetailedReportItem) => {
    // Captura os IDs e o status atual para o modal de edição de status
    const recordId = record.timeRecordId;
    const empId = selectedEmployee; 

    setSelectedRecord({ ...record, timeRecordId: recordId, employeeId: empId });

    setStatusUpdate({
        timeRecordId: recordId,
        employeeId: empId,
        statusRecord: record.statusRecord,
    });
    
    setEditModalOpen(true);
};

// Função para atualizar apenas o status do registro
const handleUpdateStatus = async () => {
    const { timeRecordId, employeeId, statusRecord } = statusUpdate;
    
    if (!statusRecord) {
        toast({ title: "Erro", description: "Selecione um status para atualizar.", variant: "destructive" });
        return;
    }
    if (!timeRecordId || !employeeId) {
        toast({ title: "Erro", description: "Dados de registro incompletos. Verifique se um funcionário foi selecionado no filtro.", variant: "destructive" });
        return;
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Token de autenticação não encontrado.");
        }

        const endpoint = `${API_BASE_URL}records/update/status/${employeeId}/${timeRecordId}`;
        
        const response = await fetch(endpoint, {
            method: "PUT", 
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ statusRecord: statusRecord }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erro ao atualizar o status do registro.");
        }

        toast({
            title: "Sucesso",
            description: `Status do registro alterado para ${statusOptions.find(s => s.value === statusRecord)?.label || statusRecord}.`,
        });

        setEditModalOpen(false);
        setStatusUpdate({ timeRecordId: "", employeeId: "", statusRecord: "" });
        
        // Recarrega os dados para mostrar o status atualizado
        handleSearch();
        
    } catch (error: any) {
        console.error("Erro ao atualizar status:", error);
        toast({
            title: "Erro",
            description: error.message || "Ocorreu um erro ao salvar o status.",
            variant: "destructive",
        });
    }
}

    // A função handleSaveRecord (edição de tempo) foi removida.

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <div className="fixed inset-0 z-0">
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        background: 'linear-gradient(-45deg, hsl(var(--background)), hsl(var(--primary)), hsl(var(--background)), hsl(var(--primary)))',
                        backgroundSize: '400% 400%',
                        animation: 'gradient-flow 15s ease-in-out infinite'
                    }}
                />
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
                            background: 'linear-gradient(45deg, hsl(var(--primary) / 0.05), transparent)',
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

            <Header onMenuClick={() => setSidebarOpen(true)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="container mx-auto px-4 py-8 relative z-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-2">
                        Relatório Detalhado
                    </h1>
                    <p className="text-muted-foreground">
                        Gere relatórios detalhados com informações completas de registros de ponto
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* CARD DE SELEÇÃO DE DATAS */}
                    <Card className="border-2 border-primary/20 shadow-card bg-gradient-to-br from-card via-card to-primary/5">
                        <CardHeader className="border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <CalendarIcon className="h-5 w-5 text-primary" />
                                </div>
                                Selecionar Datas
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Escolha múltiplas datas para o relatório detalhado
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Calendar
                                mode="multiple"
                                selected={selectedDates}
                                // Corrigido para passar o setter de estado diretamente, para array de datas
                                onSelect={setSelectedDates} 
                                className="w-full pointer-events-auto"
                                classNames={{
                                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-calendar-selected-hover/20 hover:text-calendar-selected transition-colors duration-200 relative",
                                    day_selected: "bg-calendar-selected text-calendar-selected-foreground hover:bg-calendar-selected-hover hover:text-calendar-selected-foreground focus:bg-calendar-selected focus:text-calendar-selected-foreground font-semibold shadow-sm z-10",
                                    day_today: "bg-calendar-today text-calendar-today-foreground font-medium border border-border",
                                    day_outside: "text-muted-foreground opacity-50 aria-selected:bg-calendar-selected/50 aria-selected:text-calendar-selected-foreground aria-selected:opacity-80",
                                    day_disabled: "text-muted-foreground opacity-50",
                                    day_range_middle: "aria-selected:bg-calendar-selected/20 aria-selected:text-calendar-selected",
                                    day_hidden: "invisible",
                                }}
                                modifiers={{
                                    selected: selectedDates,
                                    holiday: holidays,
                                }}
                                modifiersClassNames={{
                                    selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground z-10",
                                    holiday: "bg-destructive/10 text-destructive font-semibold border border-destructive/20 hover:bg-destructive/20 hover:text-destructive",
                                }}
                            />

                            <div className="mt-4 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-primary/20 backdrop-blur-sm">
                                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                    💡 Dica de uso:
                                </h4>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Clique em qualquer data no calendário para selecioná-la. Os feriados nacionais brasileiros estão destacados automaticamente.
                                </p>
                                <div className="grid grid-cols-1 gap-3 text-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-primary/80 shadow-sm"></div>
                                        <span className="text-muted-foreground">Data selecionada</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded bg-destructive/10 border-2 border-destructive/30"></div>
                                        <span className="text-muted-foreground">Feriado nacional</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded bg-gradient-to-br from-accent to-accent/80"></div>
                                        <span className="text-muted-foreground">Hoje</span>
                                    </div>
                                </div>
                            </div>

                            {selectedDates.length > 0 && (
                                <div className="mt-4 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/30 backdrop-blur-sm">
                                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                        Datas Selecionadas ({selectedDates.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDates.map((date, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-sm border border-primary/20"
                                            >
                                                {format(date, "dd/MM/yyyy", { locale: ptBR })}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    {/* FIM CARD DE SELEÇÃO DE DATAS */}

                    {/* CARD DE PARÂMETROS DE RELATÓRIO */}
                    <Card className="border-2 border-primary/30 shadow-xl bg-gradient-to-br from-card via-card/95 to-primary/10 backdrop-blur-sm">
                        <CardHeader className="border-b border-primary/30 bg-gradient-to-r from-primary/15 via-primary/8 to-secondary/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50"></div>
                            <CardTitle className="text-foreground flex items-center gap-3 relative z-10">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/80 animate-pulse shadow-sm"></div>
                                </div>
                                <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent font-semibold">
                                    Parâmetros do Relatório
                                </span>
                            </CardTitle>
                            <CardDescription className="text-muted-foreground relative z-10 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-primary/50"></div>
                                Configure os filtros para o relatório detalhado
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6 relative">
                            <div className="absolute inset-0 opacity-5">
                                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full blur-sm"></div>
                                <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-br from-secondary to-secondary/60 rounded-full blur-sm"></div>
                            </div>
                            
                            <div className="space-y-3 relative">
                                <Label htmlFor="reference-time" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    Carga Horária diária
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="reference-time"
                                        type="time"
                                        value={referenceTime}
                                        onChange={(e) => setReferenceTime(e.target.value)}
                                        className="focus:border-primary focus:ring-2 focus:ring-primary/20 border-primary/20 bg-gradient-to-r from-background to-primary/5 transition-all duration-200"
                                    />
                                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-muted-foreground/50"></div>
                                    Horário de referência para cálculo do relatório
                                </p>
                            </div>

                            <div className="space-y-3 relative">
                                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    Funcionário
                                </Label>
                                <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={isPartner}>
                                    <SelectTrigger className="focus:border-primary focus:ring-2 focus:ring-primary/20 border-primary/20 bg-gradient-to-r from-background to-primary/5 hover:bg-primary/10 transition-all duration-200">
                                        <SelectValue placeholder="Selecione um funcionário" />
                                    </SelectTrigger>
                                    <SelectContent className="border-primary/20">
                                        {employees.map((employee) => (
                                            <SelectItem
                                                key={employee.employeeId}
                                                value={employee.employeeId}
                                                className="hover:bg-primary/10 focus:bg-primary/10"
                                            >
                                                {employee.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3 relative">
                                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    Status do Funcionário
                                </Label>
                                <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                                    <RadioGroup value={employeeActive} onValueChange={setEmployeeActive}>
                                        <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                                            <RadioGroupItem value="active" id="emp-active" className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                            <Label htmlFor="emp-active" className="text-sm cursor-pointer font-medium">
                                                Ativo
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                                            <RadioGroupItem value="inactive" id="emp-inactive" className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                            <Label htmlFor="emp-inactive" className="text-sm cursor-pointer font-medium">
                                                Inativo
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>

                            <div className="space-y-3 relative">
                                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    Ativo
                                </Label>
                                <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                                    <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                                        <Checkbox
                                            id="active"
                                            checked={isActive}
                                            onCheckedChange={(checked) => setIsActive(checked as boolean)}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/50"
                                        />
                                        <Label
                                            htmlFor="active"
                                            className="text-sm text-muted-foreground cursor-pointer font-medium"
                                        >
                                            {isActive ? "Incluir registros ativos" : "Incluir registros inativos"}
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 relative">
                                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    Status
                                </Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="focus:border-primary focus:ring-2 focus:ring-primary/20 border-primary/20 bg-gradient-to-r from-background to-primary/5 hover:bg-primary/10 transition-all duration-200">
                                        <SelectValue placeholder="Selecione um status" />
                                    </SelectTrigger>
                                    <SelectContent className="border-primary/20">
                                        {statusOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="hover:bg-primary/10 focus:bg-primary/10 hover:text-foreground focus:text-foreground"
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-muted-foreground/50"></div>
                                    Status dos registros a serem filtrados
                                </p>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-primary/20 relative">
                                <div className="absolute -top-px left-1/2 transform -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                                
                                <Button
                                    onClick={handleSearch}
                                    size="lg"
                                    className="w-full font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all duration-200 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                                    <Search className="mr-2 h-4 w-4" />
                                    <span className="relative z-10">Buscar</span>
                                </Button>

                                <Button
                                    onClick={handleDownload}
                                    size="lg"
                                    variant="outline"
                                    className="w-full font-semibold border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 text-foreground hover:text-primary shadow-md hover:shadow-primary/20 transition-all duration-200 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span className="relative z-10">Download</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    {/* FIM CARD DE PARÂMETROS DE RELATÓRIO */}
                </div>

                {/* CARD DE RESULTADOS DO RELATÓRIO */}
                {reportData.length > 0 && (
                    <Card className="mt-8 border-2 border-primary/20 shadow-lg bg-gradient-to-br from-card via-card to-primary/5">
                        <CardHeader className="border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                            <CardTitle className="text-foreground flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <div className="w-3 h-3 rounded bg-primary"></div>
                                </div>
                                Resultados do Relatório Detalhado
                            </CardTitle>
                            <CardDescription className="text-muted-foreground flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    {reportData.length} registro(s)
                                </span>
                                encontrado(s)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">

                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/5">
                                            <th className="text-left p-4 text-sm font-semibold text-foreground">Data Entrada</th>
                                            <th className="text-left p-4 text-sm font-semibold text-foreground">Hora Entrada</th>
                                            <th className="text-left p-4 text-sm font-semibold text-foreground">Data Saída</th>
                                            <th className="text-left p-4 text-sm font-semibold text-foreground">Hora Saída</th>
                                            <th className="text-left p-4 text-sm font-semibold text-foreground">Horas Trabalhadas</th>
                                            <th className="text-left p-4 text-sm font-semibold text-foreground">Saldo</th>
                                            <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((item, index) => (
                                            <tr
                                                key={item.timeRecordId || index}
                                                className={`border-b border-border/50 cursor-pointer hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/5 transition-all duration-200 ${
                                                    index % 2 === 0
                                                        ? 'bg-gradient-to-r from-background to-background'
                                                        : 'bg-gradient-to-r from-muted/10 to-primary/5'
                                                }`}
                                                onClick={() => handleEditRecord(item)}
                                            >
                                                <td className="p-4 text-sm text-foreground">{item.startWork}</td>
                                                <td className="p-4 text-sm text-foreground">{item.startHour}</td>
                                                <td className="p-4 text-sm text-foreground">{item.endWork}</td>
                                                <td className="p-4 text-sm text-foreground">{item.endHour}</td>
                                                <td className="p-4 text-sm text-foreground font-medium">{item.hoursWork}</td>
                                                <td className={`p-4 text-sm font-medium ${item.balance.startsWith('-') ? 'text-destructive' : 'text-success'
                                                    }`}>
                                                    {item.balance}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <Badge
                                                            className={`${getStatusColor(item.statusRecord)} text-xs border-0`}
                                                        >
                                                            {statusOptions.find(s => s.value === item.statusRecord)?.label || item.statusRecord}
                                                        </Badge>
                                                        <Edit className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {/* FIM CARD DE RESULTADOS DO RELATÓRIO */}

                {/* MODAL DE EDIÇÃO DE STATUS */}
                <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Alterar Status do Registro</DialogTitle>
                            <DialogDescription>
                                Atualize o status do registro de ponto selecionado.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 pt-4">
                            <Label className="text-base font-semibold text-foreground flex flex-col gap-2">
                                Status Atual: 
                                <Badge 
                                    className={`${getStatusColor(statusUpdate.statusRecord)} text-base`}
                                >
                                    {statusOptions.find(s => s.value === statusUpdate.statusRecord)?.label || statusUpdate.statusRecord}
                                </Badge>
                            </Label>
                            
                            <div className="space-y-2">
                                <Label htmlFor="new-status">Novo Status</Label>
                                <Select 
                                    value={statusUpdate.statusRecord} 
                                    onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, statusRecord: value }))}
                                >
                                    <SelectTrigger id="new-status" className="h-10 focus:border-primary">
                                        <SelectValue placeholder="Selecione um novo status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">O registro será atualizado com o status selecionado.</p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditModalOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleUpdateStatus}
                                className="bg-primary hover:bg-primary/90"
                                disabled={!statusUpdate.timeRecordId || !statusUpdate.employeeId || !statusUpdate.statusRecord}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Salvar Status
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
                {/* FIM MODAL DE EDIÇÃO DE STATUS */}
            </main>
        </div>
    );
};

export default RelatorioDetalhado;