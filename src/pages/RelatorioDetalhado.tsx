// src/pages/RelatorioDetalhado.tsx (Atualizado)

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
    BreakEditItem,
    EditRecordFormData,
    editRecordSchema,
    decodeToken,
    transformBreakData,
    mapEditBreaksToSubmission, // IMPORTADO
    isHoliday, // Importado para uso no PDF Simples
    statusOptions, // Importado para uso no PDF Detalhado
    getTranslatedStatus, // Importado para uso no PDF Detalhado
} from "@/utils/report-utils";
import { API_BASE_URL } from "@/config/api";

// Importa os novos sub-componentes

import { ResultadosRelatorioDetalhado } from "@/components/ResultadosRelatorioDetalhado";
import { ResultadosRelatorioSimples } from "@/components/ResultadosRelatorioSimples";
import { RegistroEdicaoModal } from "@/components/RegistroEdicaoModal";

// Componentes da UI que sobraram
import { Card } from "@/components/ui/card";
import { RelatorioFiltros } from "./RelatorioFiltros";

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
    const [editBreaks, setEditBreaks] = useState<BreakEditItem[]>([]);

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


    // === LÓGICA DE DOWNLOAD DETALHADA RE-ADICIONADA ===
    const handleDownload = () => {
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
                const statusLabel = getTranslatedStatus(status);
                doc.text(`Status: ${statusLabel}`, 20, yPosition);
                yPosition += 7;
            }

            doc.text(`Carga horária diária: ${referenceTime}`, 20, yPosition);
            yPosition += 7;

            if (selectedDates.length > 0) {
                const validDates = selectedDates.filter(date => date && !isNaN(date.getTime()));
                const datesList = validDates
                    .map(date => format(date, "dd/MM/yyyy", { locale: ptBR }))
                    .join(", ");
                doc.text(`Datas: ${datesList}`, 20, yPosition);
                yPosition += 10;
            }
            doc.setFont("helvetica", "bold");
            yPosition += 5;

            const COLOR_MAIN_RECORD = [245, 245, 245];
            const COLOR_BREAK_RECORD = [255, 255, 255];
            const COLOR_SEPARATOR = [200, 200, 200];
            const SEPARATOR_PADDING = 0.1

            const tableBody: any[] = [];

            reportData.forEach((item, index) => {
                const startDate = parseDate(item.startWork);
                const endDate = parseDate(item.endWork);

                const formattedStart = `${startDate ? format(startDate, "dd/MM/yyyy") : 'N/A'}\n${item.startHour}`;
                const formattedEnd = `${endDate ? format(endDate, "dd/MM/yyyy") : 'N/A'}\n${item.endHour}`;

                const mainStatusLabel = getTranslatedStatus(item.statusRecord);

                // Linha do Registro Principal - Forçando cor Cinza Claro
                const mainRowCells = [
                    { content: formattedStart, styles: { fillColor: COLOR_MAIN_RECORD } },
                    { content: formattedEnd, styles: { fillColor: COLOR_MAIN_RECORD } },
                    { content: item.hoursWork, styles: { fillColor: COLOR_MAIN_RECORD } },
                    { content: item.balance, styles: { fillColor: COLOR_MAIN_RECORD } },
                    { content: mainStatusLabel, styles: { fillColor: COLOR_MAIN_RECORD } }
                ];
                // Aplica estilos de alinhamento e fonte padrão para a linha principal
                tableBody.push(mainRowCells.map(cell => ({
                    ...cell,
                    styles: {
                        ...cell.styles,
                        halign: 'center',
                        cellPadding: 3,
                        fontSize: 9
                    }
                })));

                // Sub-linhas para as Pausas
                if (item.breaks && item.breaks.length > 0) {
                    item.breaks.forEach(breakItem => {
                        const breakStartDate = parseDate(breakItem.startWork);
                        const breakEndDate = parseDate(breakItem.endWork);
                        const breakStatusLabel = getTranslatedStatus(breakItem.statusRecord);

                        // Formatação das sub-linhas
                        const formattedBreakStart = `${breakStartDate ? format(breakStartDate, "dd/MM/yyyy") : ''}\n${breakItem.startHour}`;
                        const formattedBreakEnd = `${breakEndDate ? format(breakEndDate, "dd/MM/yyyy") : 'N/A'}\n${breakItem.endHour}`;

                        // Linha de Pausa - Forçando cor Branca
                        const breakRowCells = [
                            { content: formattedBreakStart, styles: { fillColor: COLOR_BREAK_RECORD, fontStyle: 'italic', cellPadding: 1, fontSize: 8, halign: 'center' } },
                            { content: formattedBreakEnd, styles: { fillColor: COLOR_BREAK_RECORD, fontStyle: 'italic', cellPadding: 1, fontSize: 8, halign: 'center' } },
                            { content: breakItem.hoursBreak, styles: { fillColor: COLOR_BREAK_RECORD, fontStyle: 'italic', cellPadding: 1, halign: 'center', fontSize: 8 } },
                            { content: '00:00', styles: { fillColor: COLOR_BREAK_RECORD, fontStyle: 'italic', cellPadding: 1, halign: 'center', fontSize: 8 } },
                            { content: breakStatusLabel, styles: { fillColor: COLOR_BREAK_RECORD, fontStyle: 'italic', cellPadding: 1, fontSize: 8, halign: 'center' } },
                        ];
                        tableBody.push(breakRowCells);
                    });
                }

                // NOVO: Adiciona a linha separadora SOMENTE no final de cada REGISTRO (não entre pausas)
                // E somente se não for o último item do relatório.
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
                head: [['Entrada (Data/Hora)', 'Saída (Data/Hora)', 'Horas Trabalhadas', 'Saldo', 'Status']],
                body: tableBody,
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
                    3: {
                        cellWidth: 20,
                        halign: 'center'
                    }
                },
                didParseCell: function (data) {
                    if (data.column.index === 3 && data.section === 'body') {
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
                description: (error as Error).message || "Não foi possível gerar o PDF. Tente novamente.",
                variant: "destructive",
            });
        }
    };
    // === FIM LÓGICA DE DOWNLOAD DETALHADA ===


    // === LÓGICA DE DOWNLOAD SIMPLES RE-ADICIONADA ===
    const handleSimpleDownload = () => {
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

            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.text('RELATÓRIO SIMPLES DE PONTO', 20, 25);

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
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

            if (selectedDates.length > 0) {
                const validDates = selectedDates.filter(date => date && !isNaN(date.getTime()));
                const datesList = validDates
                    .map(date => format(date, "dd/MM/yyyy", { locale: ptBR }))
                    .join(", ");
                doc.text(`Datas: ${datesList}`, 20, yPosition);
                yPosition += 10;
            }

            doc.setFont("helvetica", "bold");
            doc.text(`Total de Horas Trabalhadas: ${reportDataSimple.totalHoursWorked}`, 20, yPosition);
            yPosition += 7;
            doc.text(`Saldo Total: ${reportDataSimple.totalBalance}`, 20, yPosition);
            yPosition += 10;
            doc.setFont("helvetica", "normal");

            const tableData = reportDataSimple.days.map(day => {
                const parts = day.startDate.split('/');
                const dayDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                const holiday = isHoliday(dayDate) ? ' 🎉' : '';
                return [
                    `${day.startDate}${holiday}`,
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
                    2: {
                        cellWidth: 25,
                        halign: 'center'
                    }
                },
                didParseCell: function (data) {
                    if (data.column.index === 2 && data.section === 'body') {
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
                description: (error as Error).message || "Não foi possível gerar o PDF. Tente novamente.",
                variant: "destructive",
            });
        }
    };
    // === FIM LÓGICA DE DOWNLOAD SIMPLES ===


    // === FUNÇÃO CORRIGIDA QUE É PASSADA PARA O BOTÃO DE DOWNLOAD ===
    const handleDownloadClick = () => {
        if (reportType === "detailed") {
            handleDownload(); // Chama a nova função de download detalhado
        } else {
            handleSimpleDownload(); // Chama a nova função de download simples
        }
    };
    // === FIM FUNÇÃO CORRIGIDA ===


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

        // Usa o ID da pausa para rastreamento
        const transformedBreaks = transformBreakData(record.breaks);

        setEditBreaks(transformedBreaks);
        form.reset({
            startDate: formatDateToInput(record.startWork),
            endDate: formatDateToInput(record.endWork),
            managerId: managers[0]?.id || "",
            // Mantenha as horas originais se existirem no registro
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

            // NOVO: Mapeia as pausas editadas para o formato esperado pelo backend (List<BreakUpdateData>)
            const breakUpdates = mapEditBreaksToSubmission(editBreaks);

            // Função para converter YYYY-MM-DD (Input Date) para DD-MM-YYYY (Formato Java esperado)
            const formatDate = (dateString: string) => {
                const [year, month, day] = dateString.split('-');
                return `${day}-${month}-${year}`;
            };

            // ESTRUTURA DO BODY AGORA CORRESPONDE AO UpdateTimeRecordRequest (Java)
            const requestBody = {
                startDate: formatDate(data.startDate),
                endDate: formatDate(data.endDate),
                startHour: data.startHour,
                endHour: data.endHour,
                managerId: data.managerId,
                // NOVO CAMPO
                breakUpdates: breakUpdates, 
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


            <Header onMenuClick={() => setSidebarOpen(true)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
                    onDownload={handleDownloadClick} // AGORA CHAMA A FUNÇÃO CONDICIONAL CORRETA
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
                        editBreaks={editBreaks}
                        setEditBreaks={setEditBreaks}
                        onSaveRecord={handleSaveRecord}
                        form={form} // Passa a instância completa do useForm
                    />
                </Card>

            </main>
        </div>
    );
};

export default RelatorioDetalhado;