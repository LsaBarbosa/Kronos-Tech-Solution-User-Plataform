// src/pages/RelatorioDetalhado.tsx (Atualizado com novo estilo PDF)

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
} from "@/utils/report-utils";
import { API_BASE_URL } from "@/config/api";

// Importa os novos sub-componentes

import { ResultadosRelatorioDetalhado } from "@/components/ResultadosRelatorioDetalhado";
import { ResultadosRelatorioSimples } from "@/components/ResultadosRelatorioSimples";
import { RegistroEdicaoModal } from "@/components/RegistroEdicaoModal";

// Componentes da UI que sobraram
import { Card } from "@/components/ui/card";
import { RelatorioFiltros } from "./RelatorioFiltros";

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
    const [status, setStatus] = useState("");
    const [reportType, setReportType] = useState<"detailed" | "simple">("detailed");
    const [reportData, setReportData] = useState<DetailedReportItem[]>([]);
    const [reportDataSimple, setReportDataSimple] = useState<ReportDataSimple | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<DetailedReportItem | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const { toast } = useToast();
    const [managers, setManagers] = useState<Manager[]>([]);
    const [isPartner, setIsPartner] = useState(false);


    const statusRegistroTips = (
    <>
    <h1 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
             Instruções
        </h1>
        <br />
        <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary  "></div>
              <span  className=" animate-pulse">Relatório Detalhado</span>
        </h4>
        <ul className="list-disc list-inside text-xs space-y-2 text-muted-foreground ml-2">
            <li>
                Retorna todos registros feitos na data slecionada.
            </li>
            <li>
                É possível filtrar pelo status do registro.
            </li>
            <br/>
        </ul>
          <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary  "></div>
            <span  className=" animate-pulse">Relatório Simples</span>
        </h4>
        <ul className="list-disc list-inside text-xs space-y-2 text-muted-foreground ml-2">
            <li>
                 Retorna a primeira e a última hora registrada e o saldo de horas da data slecionada.
            </li>
            
        </ul>
        <br/>
         <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary  "></div>
               <span  className=" animate-pulse">Ajuste no ponto</span>
        </h4>
        <ul className="list-disc list-inside text-xs space-y-2 text-muted-foreground ml-2">
            <li>
                 Após  ageração do relatório detalhado, clique no registro e envie a solicitação.
            </li>
            <li>
                 A solicitação será enviada so gestor que aprovará ou negará a requisição.
            </li>
            <li>
                 Solicitações não aprovadas em 30 dias devem ser refeitas.
            </li>
        </ul>
    </>
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
                ...(status && { status: status }),
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
        } catch (error) {
            console.error("Erro na busca:", error);
            toast({
                title: "Erro",
                description: (error as Error).message || "Ocorreu um erro ao buscar o relatório.",
                variant: "destructive",
            });
        }
    };

    // FUNÇÃO DE BUSCA SIMPLES
    const handleSimpleSearch = async () => {
        setReportData([]);
        setReportDataSimple(null);

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
        } catch (error) {
            console.error("Erro na busca simples:", error);
            toast({
                title: "Erro",
                description: (error as Error).message || "Ocorreu um erro ao buscar o relatório simples.",
                variant: "destructive",
            });
        }
    };

    const handleSearchClick = () => {
        if (reportType === "detailed") {
            handleSearch();
        } else {
            handleSimpleSearch();
        }
    };


    // === LÓGICA DE DOWNLOAD PDF DETALHADA (RENOMEADA E ESTILIZADA) ===
    const handleDownloadPDFDetailed = () => {
        const parseDate = (dateString: string) => {
            if (!dateString) return null;
            const parts = dateString.split('-'); // DD-MM-YYYY
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
                description: "Gere o relatório detalhado primeiro para poder fazer o download.",
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

            // 💡 ESTILO: TÍTULO PRINCIPAL COLORIDO E MAIOR
            doc.setTextColor(0, 150, 136); // Azul-Petróleo Elegante
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.text('RELATÓRIO DETALHADO DE PONTO', 20, 25);

            // Volta para estilo de texto normal
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0); // Preto
            let yPosition = 40;

            if (reportData.length > 0 && reportData[0].employeeData) {
                doc.text(`Funcionário: ${reportData[0].employeeData.employeeName}`, 20, yPosition);
                yPosition += 7;
                doc.text(`Empresa: ${reportData[0].employeeData.companyName}`, 20, yPosition);
                yPosition += 7;
            }

            if (status) {
                const statusLabel = getTranslatedStatus(status);
                doc.text(`Status: ${statusLabel}`, 20, yPosition);
                yPosition += 7;
            }

            doc.text(`Carga horária diária: ${referenceTime}`, 20, yPosition);
            yPosition += 7;


            if (selectedDates.length > 0) {
                const validDates = selectedDates.filter(date => date && !isNaN(date.getTime()));

                // 🚀 NOVO FILTRO: Obtém apenas as datas que são feriado (utilizando a função isHoliday)
                const holidayDates = validDates.filter(date => isHoliday(date));

                if (holidayDates.length > 0) {
                    const datesList = holidayDates
                        .map(date => format(date, "dd/MM/yy", { locale: ptBR }))
                        .join(", ");

                    // 🚀 NOVO TEXTO: Indica que são apenas os feriados
                    doc.text(`Feriados Nacionais: ${datesList}`, 20, yPosition);
                    yPosition += 10;
                }
            }

            doc.setFont("helvetica", "bold");
            yPosition += 5;



            // 💡 ESTILO: NOVO ESQUEMA DE CORES PARA LINHAS
            const COLOR_MAIN_RECORD = [240, 255, 240]; // Honeydew (Trabalho - Linha Mais Clara)
            const COLOR_BREAK_RECORD = [230, 230, 250]; // Lavanda/Muito Claro (Pausa - Linha Suave)
            const COLOR_SEPARATOR = [200, 200, 200];       // Cinza (Separador)
            const COLOR_HOLIDAY_ROW = [255, 230, 230];
            const SEPARATOR_PADDING = 0.1

            const tableBody: any[] = [];

            reportData.forEach((item, index) => {
                const isBreak = item.statusRecord === 'IMPLICIT_BREAK';

                const startDate = parseDate(item.startWork);
                const endDate = parseDate(item.endWork);
                const isItemHoliday = startDate && isHoliday(startDate);

                const formattedStart = `${startDate ? format(startDate, "dd/MM/yyyy") : 'N/A'}\n${item.startHour}`;
                const formattedEnd = `${endDate ? format(endDate, "dd/MM/yyyy") : 'N/A'}\n${item.endHour}`;

                const statusLabel = getTranslatedStatus(item.statusRecord);
                const fillColor = isItemHoliday ? COLOR_HOLIDAY_ROW : (isBreak ? COLOR_BREAK_RECORD : COLOR_MAIN_RECORD);
                const fontStyle = isBreak ? 'italic' : 'normal';

                // Linha Única para Segmento de Trabalho OU Pausa
                const rowCells = [
                    { content: formattedStart, styles: { fillColor: fillColor } },
                    { content: formattedEnd, styles: { fillColor: fillColor } },
                    { content: item.hoursWork, styles: { fillColor: fillColor } },
                    { content: isBreak ? 'N/A' : item.balance, styles: { fillColor: fillColor } },
                    { content: statusLabel, styles: { fillColor: fillColor } },
                    { content: isItemHoliday ? `${statusLabel} (FERIADO)` : statusLabel, styles: { fillColor: fillColor } }
                ];

                // Aplica estilos de alinhamento e fonte padrão para a linha
                tableBody.push(rowCells.map(cell => ({
                    ...cell,
                    styles: {
                        ...cell.styles,
                        halign: 'center',
                        cellPadding: isBreak ? 2 : 4, // Ajustado padding para elegância
                        fontSize: isBreak ? 8 : 9,
                        fontStyle: fontStyle
                    }
                })));


                // Adiciona a linha separadora SOMENTE no final de cada REGISTRO
                if (index < reportData.length - 1) {
                    tableBody.push([
                        { content: '', colSpan: 5, styles: { fillColor: COLOR_SEPARATOR, cellPadding: SEPARATOR_PADDING } }
                    ]);
                }
            });


            yPosition += 10;

            if (tableBody.length > 0) {
                // Remove a última linha separadora extra se ela foi adicionada no final
                if (tableBody[tableBody.length - 1][0].styles.fillColor[0] === COLOR_SEPARATOR[0]) {
                    tableBody.pop();
                }
            }

            autoTable(doc, {
                head: [['Início (Data/Hora)', 'Fim (Data/Hora)', 'Duração', 'Saldo', 'Status']],
                body: tableBody,
                startY: yPosition,
                margin: { left: 20, right: 20 },
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    halign: 'center',
                    lineColor: [220, 220, 220], // Linhas mais claras
                    lineWidth: 0.1, // Linhas mais finas
                },
                headStyles: {
                    fillColor: [0, 150, 136], // NOVO: Azul-petróleo (Tema Principal)
                    textColor: [255, 255, 255],
                    fontSize: 11,
                    fontStyle: 'bold'
                },
                columnStyles: {
                    3: { // Coluna do Saldo
                        cellWidth: 20,
                        halign: 'center'
                    }
                },
                didParseCell: function (data) {
                    if (data.column.index === 3 && data.section === 'body') {
                        const balance = data.cell.text[0];
                        const status = data.row.raw[4].content;

                        // Não aplica cor ao Saldo se for Pausa
                        if (status === getTranslatedStatus('IMPLICIT_BREAK') || balance === 'N/A') {
                            data.cell.styles.textColor = [0, 0, 0]; // Preto
                            data.cell.styles.fontStyle = 'italic';
                        } else if (balance) {
                            if (balance.toString().startsWith('-')) {
                                data.cell.styles.textColor = [220, 53, 69]; // Vermelho
                                data.cell.styles.fontStyle = 'bold';
                            } else if (!balance.toString().startsWith('-') && balance !== '00:00') {
                                data.cell.styles.textColor = [40, 167, 69]; // Verde
                                data.cell.styles.fontStyle = 'bold';
                            }
                        }
                    }
                }
            });

            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                // 💡 ESTILO: Rodapé em Azul Suave
                doc.setTextColor(100, 149, 237); // Cornflower Blue
                doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
                doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, doc.internal.pageSize.height - 10);
            }
            doc.setTextColor(0, 0, 0); // Volta ao preto para evitar vazamento


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
                description: (error as Error).message || "Não foi possível gerar o PDF. Tente novamente.",
                variant: "destructive",
            });
        }
    };
    // === FIM LÓGICA DE DOWNLOAD PDF DETALHADA ===


    // === LÓGICA DE DOWNLOAD PDF SIMPLES (RENOMEADA) ===
    const handleDownloadPDFSimple = () => {
        if (!reportDataSimple || reportDataSimple.days.length === 0) {
            toast({
                title: "Erro",
                description: "Gere o relatório simples primeiro para poder fazer o download.",
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

            // 💡 ESTILO: TÍTULO PRINCIPAL COLORIDO E MAIOR
            doc.setTextColor(0, 150, 136); // Azul-Petróleo Elegante
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.text('RELATÓRIO SIMPLES DE PONTO', 20, 25);

            // Volta para estilo de texto normal
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0); // Preto
            let yPosition = 40;

            if (reportDataSimple.employeeName) {
                doc.text(`Funcionário: ${reportDataSimple.employeeName}`, 20, yPosition);
                yPosition += 7;
            }

            if (reportDataSimple.companyName) {
                doc.text(`Empresa: ${reportDataSimple.companyName}`, 20, yPosition);
                yPosition += 7;
            }

            doc.text(`Carga horária diária: ${referenceTime}`, 20, yPosition);
            yPosition += 7;

            // Adicionando os totais antes da tabela
            doc.setFont("helvetica", "bold");
            // 💡 ESTILO: TOTAIS EM DESTAQUE E COLORIDOS
            doc.setTextColor(40, 167, 69); // Verde
            doc.text(`Total de Horas Trabalhadas: ${reportDataSimple.totalHoursWorked}`, 20, yPosition);
            yPosition += 7;
            doc.setTextColor(reportDataSimple.totalBalance.startsWith('-') ? 220 : 40, reportDataSimple.totalBalance.startsWith('-') ? 53 : 167, reportDataSimple.totalBalance.startsWith('-') ? 69 : 69); // Destaque de saldo
            doc.text(`Saldo Total: ${reportDataSimple.totalBalance}`, 20, yPosition);
            yPosition += 10;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0); // Volta para preto

            const tableData = reportDataSimple.days.map(day => {
                const parts = day.startDate.split('/');
                const dayDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                // 💡 Marcador de Feriado mantido (usado no didParseCell abaixo)
                const holiday = isHoliday(dayDate) ? ' 🎉' : '';
                return [
                    `${day.startDate}${holiday}`,
                    day.startHour || 'N/A',
                    day.endHour || 'N/A',
                    day.totalHours,
                    day.balance,
                ];
            });

            autoTable(doc, {
                head: [['Data', 'Entrada', 'Saída', 'Total de Horas', 'Saldo do Dia']],
                body: tableData,
                startY: yPosition,
                margin: { left: 20, right: 20 },
                styles: {
                    fontSize: 9,
                    cellPadding: 4,
                    halign: 'center',
                    lineColor: [220, 220, 220],
                    lineWidth: 0.1,
                },
                headStyles: {
                    fillColor: [0, 150, 136],
                    textColor: [255, 255, 255],
                    fontSize: 11,
                    fontStyle: 'bold'
                },
                alternateRowStyles: {
                    fillColor: [240, 255, 240],
                },
                columnStyles: {
                    4: {
                        cellWidth: 25,
                        halign: 'center'
                    }
                },
                didParseCell: function (data) {
                    // 💡 LÓGICA DE DESTAQUE PARA FERIADO (USANDO O MARCADOR)
                    if (data.column.index === 0 && data.section === 'body') {
                        const cellContent = data.cell.text[0];
                        if (cellContent && cellContent.includes('🎉')) {
                            data.cell.styles.textColor = [255, 87, 34]; // Laranja vibrante
                            data.cell.styles.fontStyle = 'bold';
                            // Remove o ícone do texto da célula
                            data.cell.text[0] = data.cell.text[0].replace(' 🎉', '');
                        }
                    }

                    // Lógica para Saldo
                    if (data.column.index === 4 && data.section === 'body') {
                        const balance = data.cell.text[0];
                        if (balance && balance.startsWith('-')) {
                            data.cell.styles.textColor = [220, 53, 69];
                            data.cell.styles.fontStyle = 'bold';
                        } else if (balance && !balance.startsWith('-') && balance !== '00:00') {
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
                // 💡 ESTILO: Rodapé em Azul Suave
                doc.setTextColor(100, 149, 237); // Cornflower Blue
                doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
                doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, doc.internal.pageSize.height - 10);
            }
            doc.setTextColor(0, 0, 0); // Volta ao preto para evitar vazamento

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
                description: (error as Error).message || "Não foi possível gerar o PDF. Tente novamente.",
                variant: "destructive",
            });
        }
    };
    // === FIM LÓGICA DE DOWNLOAD PDF SIMPLES ===


    // === FUNÇÃO DE DOWNLOAD CSV DETALHADA (NOVA) ===
    const handleDownloadCSVDetailed = () => {
        if (reportData.length === 0) {
            toast({
                title: "Erro",
                description: "Gere o relatório detalhado primeiro para poder fazer o download CSV.",
                variant: "destructive"
            });
            return;
        }

        // Define as colunas do CSV (Cabeçalho)
        const csvHeaders = ['Data Início', 'Hora Início', 'Data Fim', 'Hora Fim', 'Duração', 'Saldo', 'Status', 'Funcionário', 'Empresa'];

        // Mapeia os dados detalhados para o formato de linhas CSV
        const csvData = reportData.map(item => {
            const statusLabel = getTranslatedStatus(item.statusRecord);

            return [
                item.startWork, // DD-MM-YYYY
                item.startHour,
                item.endWork, // DD-MM-YYYY
                item.endHour,
                item.hoursWork,
                // Garantir que o saldo seja exportado corretamente
                item.statusRecord === 'IMPLICIT_BREAK' ? 'N/A' : item.balance,
                statusLabel,
                item.employeeData.employeeName,
                item.employeeData.companyName,
            ];
        });

        const fileName = `relatorio_detalhado_csv_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;

        generateCSV(csvData, csvHeaders, fileName);

        toast({
            title: "CSV Gerado",
            description: "Relatório detalhado baixado em formato CSV!",
        });
    };
    // === FIM LÓGICA DE DOWNLOAD CSV DETALHADA ===


    // === FUNÇÃO DE DOWNLOAD CSV SIMPLES (NOVA) ===
    const handleDownloadCSVSimple = () => {
        if (!reportDataSimple || reportDataSimple.days.length === 0) {
            toast({
                title: "Erro",
                description: "Gere o relatório simples primeiro para poder fazer o download CSV.",
                variant: "destructive"
            });
            return;
        }

        // Define as colunas do CSV (Cabeçalho)
        const csvHeaders = ['Data', 'Total de Horas', 'Saldo do Dia', 'Total Trabalhado Geral', 'Saldo Total Geral'];

        // Linhas de totais para inclusão no início do arquivo CSV
        const totalRows = [
            ['TOTAIS:', '', '', reportDataSimple.totalHoursWorked, reportDataSimple.totalBalance],
            ['--- Detalhes por Dia ---', '', '', '', ''],
        ];

        // Mapeia os dados por dia
        const dayRows = reportDataSimple.days.map(day => {
            // Formatamos as datas (DD/MM/YYYY) e adicionamos o indicador de feriado
            const parts = day.startDate.split('/');
            const dayDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            const holiday = isHoliday(dayDate) ? ' (Feriado)' : '';

            return [
                `${day.startDate}${holiday}`,
                day.totalHours,
                day.balance,
                '', // Coluna vazia para alinhar com totais
                '', // Coluna vazia para alinhar com totais
            ];
        });

        const csvData = [...totalRows, ...dayRows];

        const fileName = `relatorio_simples_csv_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;

        // Passa as colunas do cabeçalho original para a função gerarCSV
        generateCSV(csvData, csvHeaders, fileName);

        toast({
            title: "CSV Gerado",
            description: "Relatório simples baixado em formato CSV!",
        });
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
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background (Mantido para o layout) */}
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
                            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), transparent)',
                            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                            animation: 'float-shapes 20s ease-in-out infinite'
                        }}
                    />
                    <div
                        className="absolute top-3/4 right-1/4 w-48 h-48 opacity-2"
                        style={{
                            background: 'linear-gradient(45deg, hsl(var(--black-primary) / 0.05), transparent)',
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


            {/* 💡 CORREÇÃO: Sidebar usa 'toggleSidebar' */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* 💡 CORREÇÃO: Header usa 'toggleSidebar' */}
                <Header toggleSidebar={handleToggleSidebar} />


                <main className="container mx-auto px-4 py-20 relative z-10">
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                            Relatório De Horas
                        </h1>
                        <p className="text-muted-foreground">
                            Gere relatórios detalhados com informações completas de registros de ponto
                        </p>
                    </div>

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
                            if (type === "simple") setStatus("");
                        }}
                        employees={employees}
                        isPartner={isPartner}
                        onSearch={handleSearchClick}
                        onDownloadPDF={handleDownloadPDF} // Passa o novo router de PDF
                        onDownloadCSV={handleDownloadCSV} // Passa o novo router de CSV
                        customTips={statusRegistroTips}
                    />

                    {/* EXIBIÇÃO CONDICIONAL DOS RESULTADOS */}

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