// src/pages/RelatorioDetalhado.tsx (Atualizado com lógica de scroll)

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";

import {
    DetailedReportItem,
    ReportDataSimple,
    Employee,
    Manager,
    EditRecordFormData,
    editRecordSchema,
    decodeToken,
    isHoliday,
    statusOptions,
    getTranslatedStatus,
    formatDateWithDayOfWeek,
} from "@/utils/report-utils";
import { API_BASE_URL } from "@/config/api";

// Importa os novos sub-componentes

import { ResultadosRelatorioDetalhado } from "@/components/ResultadosRelatorioDetalhado";
import { ResultadosRelatorioSimples } from "@/components/ResultadosRelatorioSimples";
import { RegistroEdicaoModal } from "@/components/RegistroEdicaoModal";

// Componentes da UI que sobraram
import { Card } from "@/components/ui/card";
import { RelatorioFiltros } from "./RelatorioFiltros";
import { Info } from "lucide-react";

// === FUNÇÃO UTILITÁRIA PARA GERAÇÃO DE CSV (NOVA) ===
const generateCSV = (data: any[], headers: string[], fileName: string) => {
    // Cabeçalho CSV (separado por ponto e vírgula, compatível com Excel brasileiro)
    const csvHeaders = headers.join(';');

    // Mapeamento dos dados para as linhas CSV
    const csvRows = data.map(row =>
        row.map((item: any) => {
            // Converte o item para string
            let value = String(item);

            // Remove quebras de linha e substitui vírgulas por pontos (para valores numéricos/horários)
            // Se o item for um array (deve ser tratado na função chamadora, mas garantindo a sanitização)
            value = value.replace(/\n/g, ' ').replace(/,/g, '.');

            // Coloca aspas se o valor contiver o separador (ponto e vírgula)
            return /;/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(';')
    ).join('\n');

    // Adiciona o BOM (Byte Order Mark) para garantir que caracteres especiais e acentuação funcionem corretamente no Excel
    const csvContent = `\ufeff${csvHeaders}\n${csvRows}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Libera a URL do objeto
    URL.revokeObjectURL(url);
};
// === FIM FUNÇÃO UTILITÁRIA CSV ===


const RelatorioDetalhado = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [referenceTime, setReferenceTime] = useState("08:00");
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [employeeActive, setEmployeeActive] = useState("active");
    const [isActive, setIsActive] = useState(true);
    const [status, setStatus] = useState<string[]>([]);
    const [reportType, setReportType] = useState<"detailed" | "simple">("detailed");
    const [reportData, setReportData] = useState<DetailedReportItem[]>([]);
    const [reportDataSimple, setReportDataSimple] = useState<ReportDataSimple | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<DetailedReportItem | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const { toast } = useToast();
    const [managers, setManagers] = useState<Manager[]>([]);
    const [isPartner, setIsPartner] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const hasResults = reportType === "detailed" 
        ? reportData.length > 0 
        : (reportDataSimple?.days.length || 0) > 0;

    const statusRegistroTips = (
  <div className="space-y-3"> 
            <h1 className="text-lg font-bold text-primary flex items-center gap-2">
                <Info className="w-5 h-5 text-primary"/> Instruções
            </h1>
            
            {/* Conteúdo Detalhado */}
            <div className="pt-2"> 
                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="animate-pulse">Relatório Detalhado</span>
                </h4>
                <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground ml-2 pt-1">
                    <li>
                        Retorna todos registros feitos na data slecionada.
                    </li>
                    <li>
                        É possível filtrar pelo status do registro.
                    </li>
                </ul>
            </div>
            
            {/* Conteúdo Simples */}
            <div className="pt-2"> 
                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="animate-pulse">Relatório Simples</span>
                </h4>
                <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground ml-2 pt-1">
                    <li>
                         Retorna a primeira e a última hora registrada e o saldo de horas da data slecionada.
                    </li>
                </ul>
            </div>
            
            {/* Conteúdo Ajuste */}
            <div className="pt-2"> 
                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="animate-pulse">Ajuste no ponto</span>
                </h4>
                <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground ml-2 pt-1">
                    <li>
                         Após a geração do relatório detalhado, clique no registro e envie a solicitação.
                    </li>
                    <li>
                         A solicitação será enviada so gestor que aprovará ou negará a requisição.
                    </li>
                    <li>
                         Solicitações não aprovadas em 30 dias devem ser refeitas.
                    </li>
                </ul>
            </div>
        </div>
    );

    // REMOVIDO: O estado de pausas aninhadas (editBreaks) não é mais necessário
    // const [editBreaks, setEditBreaks] = useState<BreakEditItem[]>([]); 

    const form = useForm<EditRecordFormData>({
        resolver: zodResolver(editRecordSchema),
        defaultValues: {
            startDate: "",
            endDate: "",
            startHour: "",
            endHour: "",
            managerId: "",
        },
    });

    const fetchEmployees = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

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
            const url = employeeActive ? `${API_BASE_URL}employee?active=${activeStatus}` : `${API_BASE_URL}employee`;


            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
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
    }, [employeeActive, selectedEmployee]);

    const fetchManagers = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            const response = await fetch(`${API_BASE_URL}users/search`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Erro ao buscar usuários.");
            }

            const data = await response.json();
            const filteredManagers: Manager[] = data.users
                .filter((user: any) => user.role === "MANAGER")
                .map((user: any) => ({
                    id: user.userId,
                    name: user.username,
                }));
            setManagers(filteredManagers);
        } catch (error) {
            console.error("Erro ao buscar gerentes:", error);
            toast({
                title: "Erro",
                description: (error as Error).message || "Não foi possível carregar a lista de administradores.",
                variant: "destructive",
            });
        }
    };


    useEffect(() => {
        fetchEmployees();
        fetchManagers();
    }, [fetchEmployees]);


    // FUNÇÃO DE BUSCA DETALHADA
    const handleSearch = async () => {
        setReportDataSimple(null);
        setReportData([]);
        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            const formattedDates = selectedDates.map(date => format(date, "dd-MM-yyyy"));

            const requestBody = {
                reference: referenceTime,
                active: isActive,
                dates: formattedDates,
                ...(status.length > 0 && { statuses: status }),
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
                throw new Error(errorData.detail || "Erro ao buscar o relatório detalhado. Tente novamente mais tarde.");
            }

            const data: DetailedReportItem[] = await response.json();

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

            // NOVO: Redireciona para o topo da tela
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error("Erro na busca:", error);
            toast({
                title: "Erro",
                description: (error as Error).message || "Ocorreu um erro ao buscar o relatório.",
                variant: "destructive",
          });
        } finally {
            setIsLoading(false); // FIM: Desativa o loading
        }
    };

    // FUNÇÃO DE BUSCA SIMPLES
    const handleSimpleSearch = async () => {
        setReportData([]);
        setReportDataSimple(null);
        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            const formattedDates = selectedDates.map(date => format(date, "dd-MM-yyyy"));
            const requestBody = {
                reference: referenceTime,
                dates: formattedDates,
                employeeActive: employeeActive === "active",
                active: isActive,
            };

            const apiUrl = new URL(`${API_BASE_URL}records/report/simple`, window.location.origin);
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
                throw new Error(errorData.detail || "Erro ao buscar o relatório simples. Tente novamente mais tarde.");
            }

            const data: ReportDataSimple = await response.json();

            if (data.days.length === 0) {
                setReportDataSimple(null);
                toast({
                    title: "Aviso",
                    description: "Não há registro para as datas selecionadas com os filtros aplicados.",
                    variant: "default",
                });
                return;
            }

            setReportDataSimple(data);

            const datesList = selectedDates
                .map(date => format(date, "dd/MM/yyyy", { locale: ptBR }))
                .join(", ");

            toast({
                title: "Busca realizada",
                description: `Relatório simples gerado para as datas: ${datesList}`,
            });

            // NOVO: Redireciona para o topo da tela
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error("Erro na busca simples:", error);
            toast({
                title: "Erro",
                description: (error as Error).message || "Ocorreu um erro ao buscar o relatório simples.",
                variant: "destructive",
     });
        } finally {
            setIsLoading(false); // FIM: Desativa o loading
        }
    };


    const handleSearchClick = () => {
        if (reportType === "detailed") {
            handleSearch();
        } else {
            handleSimpleSearch();
        }
    };

   // FUNÇÕES AUXILIARES NECESSÁRIAS
const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const parts = dateString.split('-'); // DD-MM-YYYY
    if (parts.length === 3) {
        const [day, month, year] = parts;
        // Ajuste para evitar o problema de fuso horário ao criar a data
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12); // Usar meio-dia (12h)
        
        // Checagem de validade extra para garantir que a data não seja inválida
        if (!isNaN(date.getTime()) && date.getDate() === parseInt(day)) {
            return date;
        }
    }
    return null;
};
    
const COLOR_HEADER = [4, 60, 107]; // Azul escuro
const COLOR_MAIN_RECORD = [255, 255, 255]; // Branco (para registros normais)
const COLOR_BREAK_RECORD = [230, 240, 255]; // Azul muito claro (para pausas)
const COLOR_HOLIDAY_ROW = [255, 245, 245]; // Vermelho muito claro (para feriados)
    
const handleDownloadPDFDetailed = () => {
        if (reportData.length === 0) {
            toast({ title: "Erro", description: "Não há dados para gerar o PDF.", variant: "destructive" });
            return;
        }

        const doc = new jsPDF();
        
        // --- Helpers para Cálculo de Horas (Locais) ---
        const timeToMinutes = (time: string) => {
            if (!time || time === '--:--' || time.trim() === '') return 0;
            const sign = time.startsWith('-') ? -1 : 1;
            const parts = time.replace('-', '').split(':');
            if (parts.length !== 2) return 0;
            const [h, m] = parts.map(Number);
            return sign * ((h * 60) + m);
        };

        const minutesToTime = (totalMinutes: number) => {
            const sign = totalMinutes < 0 ? '-' : '';
            const absMinutes = Math.abs(totalMinutes);
            const h = Math.floor(absMinutes / 60);
            const m = absMinutes % 60;
            return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        };

        // --- Cálculo dos Totais ---
        let totalMinutesWorked = 0;
        let totalMinutesBalance = 0;

        reportData.forEach((item) => {
            const isBreak = item.statusRecord === 'IMPLICIT_BREAK';
            const isPending = item.statusRecord === 'PENDING';

            // Soma apenas se não for Pausa e não for Pendente
            if (!isBreak && !isPending) {
                totalMinutesWorked += timeToMinutes(item.hoursWork);
                totalMinutesBalance += timeToMinutes(item.balance);
            }
        });

        const totalHoursStr = minutesToTime(totalMinutesWorked);
        const totalBalanceStr = minutesToTime(totalMinutesBalance);

        // --- Configuração do Nome do Arquivo e Dados Básicos ---
        const fileName = `relatorio_detalhado_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
        const employeeName = reportData[0]?.employeeData?.employeeName || 'N/A';
        const companyName = reportData[0]?.employeeData?.companyName || 'N/A';
        
        const periodStart = selectedDates[0] ? format(selectedDates[0], 'dd/MM/yyyy') : '-';
        const periodEnd = selectedDates[selectedDates.length - 1] ? format(selectedDates[selectedDates.length - 1], 'dd/MM/yyyy') : '-';

        // --- Cabeçalho do PDF ---
        doc.setFontSize(16);
        doc.text("Relatório de Ponto Detalhado", 14, 15);
        
        doc.setFontSize(10);
        doc.text(`Empresa: ${companyName}`, 14, 22);
        doc.text(`Colaborador: ${employeeName}`, 14, 27);
        doc.text(`Período: ${periodStart} a ${periodEnd}`, 14, 32);
        doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 37);

        // [NOVAS LINHAS] Exibindo os totais calculados
        doc.setFont("helvetica", "bold"); // Negrito para destaque
        doc.text(`Total Horas Trabalhadas: ${totalHoursStr}`, 14, 44);
        
        // Define cor do saldo (Vermelho se negativo, Preto/Verde se positivo)
        if (totalMinutesBalance < 0) {
            doc.setTextColor(220, 53, 69); // Vermelho
        } else {
            doc.setTextColor(0, 0, 0); // Preto (ou use verde se preferir)
        }
        doc.text(`Saldo Total no Período: ${totalBalanceStr}`, 14, 49);
        
        // Reseta fonte e cor
        doc.setFont("helvetica", "normal"); 
        doc.setTextColor(0, 0, 0);

        // --- Preparação dos Dados da Tabela ---
        const tableBody: any[] = [];

        reportData.forEach((item) => {
            const isBreak = item.statusRecord === 'IMPLICIT_BREAK';
            const isPending = item.statusRecord === 'PENDING';

            const formattedDateStart = formatDateWithDayOfWeek(item.startWork);
            const formattedDateEnd = isPending ? '-' : formatDateWithDayOfWeek(item.endWork);

            const displayEndHour = isPending ? '--:--' : item.endHour;
            const displayDuration = isPending ? '--:--' : item.hoursWork;
            const displayBalance = (isBreak || isPending) ? '00:00' : item.balance;

            const colInicio = `${formattedDateStart}\n${item.startHour}`;
            const colFim = isPending ? 'Em andamento' : `${formattedDateEnd}\n${displayEndHour}`;
            
            const startDate = parseDate(item.startWork);
            const isItemHoliday = startDate && isHoliday(startDate);
            const statusLabel = getTranslatedStatus(item.statusRecord);
            
            const fillColor = isItemHoliday ? COLOR_HOLIDAY_ROW : (isBreak ? COLOR_BREAK_RECORD : COLOR_MAIN_RECORD);
            const fontStyle = isBreak ? 'italic' : 'normal';

            const rowCells = [
                { content: colInicio, styles: { fontStyle: fontStyle, halign: 'center' } }, 
                { content: colFim, styles: { fontStyle: fontStyle, halign: 'center' } },    
                { content: displayDuration, styles: { fontStyle: fontStyle, halign: 'center' } }, 
                { content: displayBalance, styles: { fontStyle: fontStyle, halign: 'center' } },  
                { content: isItemHoliday ? `${statusLabel} (FERIADO)` : statusLabel, styles: { fontStyle: fontStyle } } 
            ];

            tableBody.push(rowCells.map(cell => ({
                ...cell,
                styles: { ...cell.styles, fillColor: fillColor }
            })));
        });

        // --- Geração da Tabela (AutoTable) ---
        autoTable(doc, {
            startY: 55, // [AJUSTADO] Movido para baixo (era 45) para dar espaço aos novos totais
            head: [['Início da Jornada', 'Fim da Jornada', 'Duração', 'Saldo', 'Status']], 
            body: tableBody,
            styles: {
                fontSize: 9,
                cellPadding: 3,
                valign: 'middle',
            },
            headStyles: {
                fillColor: [41, 128, 185], 
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 40 },
                2: { cellWidth: 25 },
                3: { cellWidth: 25 },
                4: { cellWidth: 'auto' }
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });

        doc.save(fileName);
    };

    // === LÓGICA DE DOWNLOAD PDF SIMPLES (RENOMEADA) ===
  const handleDownloadPDFSimple = () => {
    if (!reportDataSimple || reportDataSimple.days.length === 0) {
        toast({ title: "Erro", description: "Não há dados para gerar o PDF.", variant: "destructive" });
        return;
    }

    const doc = new jsPDF();
    const fileName = `relatorio_simples_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;

const employeeName = reportDataSimple.employeeName || 'N/A';
    const companyName = reportDataSimple.companyName || 'N/A';    

    // --- Cabeçalho
    doc.setFontSize(18);
    doc.text("RELATÓRIO SIMPLES DE PONTO", 14, 20);
    doc.setFontSize(10);
doc.text(`Funcionário: ${employeeName}`, 14, 30);
    doc.text(`Empresa: ${companyName}`, 14, 35);
    doc.text(`Carga horária diária: ${referenceTime}`, 14, 40);
    doc.text(`Total de Horas Trabalhadas: ${reportDataSimple.totalHoursWorked}`, 14, 45);
    doc.text(`Saldo Total: ${reportDataSimple.totalBalance}`, 14, 50);
    doc.text(`Período de Referência: ${format(selectedDates[0], 'dd/MM/yyyy')} a ${format(selectedDates[selectedDates.length - 1], 'dd/MM/yyyy')}`, 14, 55);


    // --- Corpo da Tabela
    const tableData = reportDataSimple.days.map(day => {
        const parts = day.startDate.split('/'); // Assumindo DD/MM/YYYY no day.startDate
        const dayDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // Cria Date para isHoliday
        const holiday = isHoliday(dayDate) ? ' 🎉' : '';

        // 🚀 NOVO: Formatação com Dia da Semana
        const formattedDateWithDayOfWeek = formatDateWithDayOfWeek(day.startDate);

        return [
            `${formattedDateWithDayOfWeek}${holiday}`, // AGORA INCLUI O DIA DA SEMANA
            day.startHour || 'N/A',
            day.endHour || 'N/A',
            day.totalHours,
            day.balance,
        ];
    });

    // --- autoTable
    autoTable(doc, {
        head: [['Data', 'Entrada', 'Saída', 'Total de Horas', 'Saldo do Dia']],
        body: tableData,
        startY: 65,
        theme: 'striped',
        headStyles: { 
            fillColor: COLOR_HEADER, 
            textColor: 255, 
            halign: 'center', 
            valign: 'middle' 
        },
        bodyStyles: { fontSize: 10 },
    });
    
    // --- Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })} | Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 10);
    }

    doc.save(fileName);
};
    // === FIM LÓGICA DE DOWNLOAD PDF SIMPLES ===


    // === FUNÇÃO DE DOWNLOAD CSV DETALHADA (NOVA) ===
  // FUNÇÃO DE DOWNLOAD CSV DETALHADA (Corrigida)
const handleDownloadCSVDetailed = () => {
    if (reportData.length === 0) {
        toast({ title: "Erro", description: "Não há dados para gerar o CSV.", variant: "destructive" });
        return;
    }

    const headers = [
        "Data Início", "Hora Início", "Data Fim", "Hora Fim", "Duração", "Saldo", "Status", "Funcionário", "Empresa"
    ];

    // 🚀 CORREÇÃO DE TIPAGEM: Mapeia para um array de arrays de strings (string[][])
    const csvDataRows = reportData.map(item => {
        const isPending = item.statusRecord === 'PENDING';
        return [
            item.startWork, // DD-MM-YYYY
            item.startHour,
            isPending ? '' : item.endWork, // Deixa vazio se pendente
            isPending ? '' : item.endHour, // Deixa vazio se pendente
            isPending ? '' : item.hoursWork, 
            item.statusRecord === 'IMPLICIT_BREAK' ? '00:00' : item.balance,
            getTranslatedStatus(item.statusRecord), 
            item.employeeData.employeeName,
            item.employeeData.companyName,
        ];
    });

    const fileName = `relatorio_detalhado_csv_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    
    // O generateCSV precisa ser chamado com (data: string[][], headers: string[], fileName: string)
    generateCSV(csvDataRows, headers, fileName); 

    toast({ title: "CSV Gerado", description: "Relatório detalhado baixado em formato CSV!", });
};
    // === FIM LÓGICA DE DOWNLOAD CSV DETALHADA ===


    // === FUNÇÃO DE DOWNLOAD CSV SIMPLES (NOVA) ===
  // FUNÇÃO DE DOWNLOAD CSV SIMPLES (Corrigida)
// FUNÇÃO DE DOWNLOAD CSV SIMPLES (Corrigida)
const handleDownloadCSVSimple = () => {
    if (!reportDataSimple || reportDataSimple.days.length === 0) {
        toast({ title: "Erro", description: "Não há dados para gerar o CSV.", variant: "destructive" });
        return;
    }

    const headers = [
        "Data", "Entrada", "Saída", "Total de Horas", "Saldo do Dia"
    ];

    // 🚀 CORREÇÃO DE TIPAGEM: Mapeia para um array de arrays de strings (string[][])
    const csvDataRows = reportDataSimple.days.map(day => {
        const parts = day.startDate.split('/');
        const dayDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        const holiday = isHoliday(dayDate) ? ' (Feriado)' : '';

        // 🚀 NOVO: Formatação com Dia da Semana
        const formattedDateWithDayOfWeek = formatDateWithDayOfWeek(day.startDate);

        return [
            `${formattedDateWithDayOfWeek}${holiday}`, // Inclui dia da semana e marcador
            day.startHour || 'N/A',
            day.endHour || 'N/A',
            day.totalHours,
            day.balance,
        ];
    });

    const fileName = `relatorio_simples_csv_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;

    // O generateCSV precisa ser chamado com (data: string[][], headers: string[], fileName: string)
    generateCSV(csvDataRows, headers, fileName);

    toast({ title: "CSV Gerado", description: "Relatório simples baixado em formato CSV!", });
};
    // === FIM LÓGICA DE DOWNLOAD CSV SIMPLES ===


    // === FUNÇÃO ROUTER PARA O BOTÃO PDF ===
    const handleDownloadPDF = () => {
        if (reportType === "detailed") {
            handleDownloadPDFDetailed();
        } else {
            handleDownloadPDFSimple();
        }
    };
    // === FIM FUNÇÃO ROUTER PDF ===

    // === FUNÇÃO ROUTER PARA O BOTÃO CSV (NOVA) ===
    const handleDownloadCSV = () => {
        if (reportType === "detailed") {
            handleDownloadCSVDetailed();
        } else {
            handleDownloadCSVSimple();
        }
    };
    // === FIM FUNÇÃO ROUTER CSV ===


    const handleEditRecord = (record: DetailedReportItem) => {
        setSelectedRecord(record);

        const formatDateToInput = (dateString: string) => {
            if (!dateString) return "";
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const [day, month, year] = parts;
                return `${year}-${month}-${day}`;
            }
            return dateString;
        };

        // NOTA: A Lógica de Pausa Aninhada FOI REMOVIDA DESTA FUNÇÃO

        form.reset({
            startDate: formatDateToInput(record.startWork),
            endDate: formatDateToInput(record.endWork),
            managerId: managers[0]?.id || "",
            startHour: record.startHour,
            endHour: record.endHour,
        });

        setEditModalOpen(true);
    };

    const handleSaveRecord = async (data: EditRecordFormData) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            if (!selectedRecord || !selectedRecord.timeRecordId) {
                throw new Error("Registro selecionado para edição não encontrado.");
            }

            // NOTA: A Lógica de Mapeamento de Pausas Aninhadas FOI REMOVIDA DESTA FUNÇÃO
            // const breakUpdates = mapEditBreaksToSubmission(editBreaks); 

            // Função para converter YYYY-MM-DD (Input Date) para DD-MM-YYYY (Formato Java esperado)
            const formatDate = (dateString: string) => {
                const [year, month, day] = dateString.split('-');
                return `${day}-${month}-${year}`;
            };

            // ESTRUTURA DO BODY AGORA CORRESPONDE AO UpdateTimeRecordRequest (Java) - SEM breaks
            const requestBody = {
                startDate: formatDate(data.startDate),
                endDate: formatDate(data.endDate),
                startHour: data.startHour,
                endHour: data.endHour,
                managerId: data.managerId,
            };


            const endpoint = `${API_BASE_URL}records/update/time-record/${selectedRecord.timeRecordId}`;

            const response = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || "Erro ao solicitar a aprovação de alteração.");
            }

            // MENSAGEM SIMPLES DE CONFIRMAÇÃO
            toast({
                title: "Sucesso",
                description: "Solicitação de alteração enviada para aprovação do administrador.",
            });

            setEditModalOpen(false);
            setSelectedRecord(null);
            form.reset();

            handleSearch();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast({
                title: "Erro",
                description: (error as Error).message || "Ocorreu um erro ao salvar o registro.",
                variant: "destructive",
            });
        }
    };

    const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);
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
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                            Relatório De Horas
                        </h1>
                        <p className="text-muted-foreground">
                            Gere relatórios detalhados com informações completas de registros de ponto
                        </p>
                    </div>

                    {/* EXIBIÇÃO CONDICIONAL DOS RESULTADOS (TOPO) */}

                    {/* 1. RELATÓRIO DETALHADO */}
                    {(reportType === "detailed" && reportData.length > 0) && (
                        <ResultadosRelatorioDetalhado
                            reportData={reportData}
                            statusFilter={status}
                            referenceTime={referenceTime}
                            selectedDates={selectedDates}
                            onEditRecord={handleEditRecord}
                        />
                    )}

                    {/* 2. RELATÓRIO SIMPLES */}
                    {(reportType === "simple" && reportDataSimple && reportDataSimple.days.length > 0) && (
                        <ResultadosRelatorioSimples
                            reportDataSimple={reportDataSimple}
                            referenceTime={referenceTime}
                            selectedDates={selectedDates}
                        />
                    )}

                    {/* FILTROS (BAIXO) */}
                    <RelatorioFiltros
                        selectedDates={selectedDates}
                        setSelectedDates={setSelectedDates}
                        referenceTime={referenceTime}
                        setReferenceTime={setReferenceTime}
                        selectedEmployee={selectedEmployee}
                        setSelectedEmployee={setSelectedEmployee}
                        employeeActive={employeeActive}
                        setEmployeeActive={setEmployeeActive}
                        isActive={isActive}
                        setIsActive={setIsActive}
                        status={status}
                        setStatus={setStatus}
                        reportType={reportType}
                        setReportType={(type) => {
                            setReportType(type);
                            setReportData([]);
                            setReportDataSimple(null);
                            if (type === "simple") setStatus([]);
                        }}
                        employees={employees}
                        isPartner={isPartner}
                        hasResults={hasResults}
                        onSearch={handleSearchClick}
                        onDownloadPDF={handleDownloadPDF} // Passa o novo router de PDF
                        onDownloadCSV={handleDownloadCSV} // Passa o novo router de CSV
                        customTips={statusRegistroTips}
                        isLoading={isLoading}
                    />

                    <Card className="border-l-4 border-l-primary shadow-card">
                        <RegistroEdicaoModal
                            isOpen={editModalOpen}
                            setIsOpen={setEditModalOpen}
                            managers={managers}
                            selectedRecord={selectedRecord}

                            onSaveRecord={handleSaveRecord}
                            form={form} // Passa a instância completa do useForm
                        />
                    </Card>

                </main>
            </div>
        </div>
    );
};

export default RelatorioDetalhado;