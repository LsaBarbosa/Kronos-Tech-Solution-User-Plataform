// src/pages/RelatorioDetalhado.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import PageShell from "@/components/PageShell";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";

import {
    DetailedReportItem,
    Employee,
    Manager,
    EditRecordFormData,
    editRecordSchema,
    isHoliday,
    getTranslatedStatus,
    formatDateWithDayOfWeek,
} from "@/utils/report-utils";
import {
    fetchDetailedReport,
    fetchManagerOptions,
    fetchReportEmployees,
    updateTimeRecord,
} from "@/service/records.service";

// Sub-componentes
import { ResultadosRelatorioDetalhado } from "@/components/ResultadosRelatorioDetalhado";
import { RegistroEdicaoModal } from "@/components/RegistroEdicaoModal";

// UI
import { Card } from "@/components/ui/card";
import { RelatorioFiltros } from "./RelatorioFiltros";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// === FUNÇÃO UTILITÁRIA PARA GERAÇÃO DE CSV ===
const generateCSV = (data: any[], headers: string[], fileName: string) => {
    const csvHeaders = headers.join(';');
    const csvRows = data.map(row =>
        row.map((item: any) => {
            let value = String(item);
            value = value.replace(/\n/g, ' ').replace(/,/g, '.');
            return /;/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(';')
    ).join('\n');

    const csvContent = `\ufeff${csvHeaders}\n${csvRows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const RelatorioDetalhado = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [referenceTime, setReferenceTime] = useState("08:00");
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [employeeActive, setEmployeeActive] = useState("active");
    const [isActive, setIsActive] = useState(true);
    const [status, setStatus] = useState<string[]>([]);
    
    // Removido estado de reportType (apenas detalhado agora)
    const [reportData, setReportData] = useState<DetailedReportItem[]>([]);
    
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<DetailedReportItem | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const { toast } = useToast();
    const [managers, setManagers] = useState<Manager[]>([]);
    const [isPartner, setIsPartner] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { status: authStatus, role, user } = useAuth();

    // Verifica se há dados para habilitar botões de download
    const hasResults = reportData.length > 0;

    const statusRegistroTips = (
        <div className="space-y-3"> 
            <h1 className="text-lg font-bold text-primary flex items-center gap-2">
                <Info className="w-5 h-5 text-primary"/> Instruções
            </h1>
            <div className="pt-2"> 
                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="animate-pulse">Relatório Detalhado</span>
                </h4>
                <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground ml-2 pt-1">
                    <li>Retorna todos registros feitos na data selecionada.</li>
                    <li>É possível filtrar pelo status do registro.</li>
                </ul>
            </div>
            <div className="pt-2"> 
                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="animate-pulse">Ajuste no ponto</span>
                </h4>
                <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground ml-2 pt-1">
                    <li>Após a geração do relatório, clique no registro e envie a solicitação.</li>
                    <li>A solicitação será enviada ao gestor que aprovará ou negará.</li>
                </ul>
            </div>
             <div className="pt-2"> 
                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="animate-pulse">Falta Injustificada</span>
                </h4>
            <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground ml-2 pt-1">
                <li>A ausência de marcação de ponto, gera um registro com status FOLGA.</li>
                <li>Em caso de causa FALTA sem justificativa, altere o status do registro de FOLGA para FALTA.</li>
                <li>
                    <Link 
                        to="/status-do-registro" 
                        className="animate-pulse font-bold text-primary hover:underline cursor-pointer"
                    >
                        Clique aqui
                    </Link>
                    {" "}para realizar a alteração!.
                </li>
            </ul>
        </div>
    </div>
);

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

    // --- Helpers de Data ---
    const parseDate = (dateString: string): Date | null => {
        if (!dateString) return null;
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12);
            if (!isNaN(date.getTime()) && date.getDate() === parseInt(day)) {
                return date;
            }
        }
        return null;
    };

    const fetchEmployees = useCallback(async () => {
        if (authStatus !== "authenticated") return;

        try {
            const userRole = role;
            const userId = user?.profile?.employeeId || user?.account.employeeId || "";
            const userName = user?.profile?.fullName || "";

            if (userRole === "PARTNER") {
                setIsPartner(true);
                setEmployees([{ employeeId: userId, fullName: userName }]);
                setSelectedEmployee(userId);
                return;
            } else {
                setIsPartner(false);
            }

            const activeStatus = employeeActive === "active";
            const data = await fetchReportEmployees(activeStatus);
            setEmployees(data);
            if (!selectedEmployee) setSelectedEmployee("");
        } catch (error) {
            console.error("Erro ao buscar funcionários:", error);
        }
    }, [authStatus, employeeActive, role, selectedEmployee, user]);

    const fetchManagers = async () => {
        try {
            const filteredManagers: Manager[] = (await fetchManagerOptions()).map((manager) => ({
                id: manager.userId,
                name: manager.username,
            }));
            setManagers(filteredManagers);
        } catch (error) {
            console.error("Erro ao buscar gerentes:", error);
            toast({ title: "Erro", description: (error as Error).message, variant: "destructive" });
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchManagers();
    }, [fetchEmployees]);

    // === BUSCA ===
    const handleSearch = async () => {
        setReportData([]);
        setIsLoading(true);

        try {
            const formattedDates = selectedDates.map(date => format(date, "dd-MM-yyyy"));
            const requestBody = {
                reference: referenceTime,
                active: isActive,
                dates: formattedDates,
                ...(status.length > 0 && { statuses: status }),
            };

            const data: DetailedReportItem[] = await fetchDetailedReport({
                ...requestBody,
                employeeId: selectedEmployee || undefined,
            });

            if (data.length === 0) {
                toast({ title: "Aviso", description: "Não há registros para os filtros selecionados", variant: "default" });
                return;
            }

            setReportData(data);
            toast({ title: "Busca realizada", description: `Relatório gerado com sucesso.` });
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error("Erro na busca:", error);
            toast({ title: "Erro", description: (error as Error).message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // === PDF DETALHADO (MODERNO E ESTILIZADO) ===
    const handleDownloadPDFDetailed = () => {
        if (reportData.length === 0) {
            toast({ title: "Erro", description: "Não há dados para gerar o PDF.", variant: "destructive" });
            return;
        }

        const doc = new jsPDF();
        
        // Configurações Visuais
        const PRIMARY_COLOR = [41, 128, 185]; 
        const TEXT_COLOR = [51, 65, 85];      
        const LABEL_COLOR = [100, 116, 139];  
        const BG_LIGHT = [248, 250, 252];     

        // Mapa de cores para Status
        const getStatusRGB = (status: string): [number, number, number] => {
            switch (status) {
                case 'CREATED': return [22, 163, 74];       
                case 'UPDATED': return [37, 99, 235];       
                case 'PENDING': return [234, 179, 8];       
                case 'ABSENCE': return [220, 38, 38];       
                case 'DAY_OFF': return [100, 116, 139];     
                case 'TIME_OFF': return [147, 51, 234];     
                case 'VACATION': return [13, 148, 136];     
                case 'IMPLICIT_BREAK': return [156, 163, 175]; 
                case 'PENDING_APPROVAL': return [249, 115, 22]; 
                default: return [71, 85, 105];              
            }
        };

        // Helpers de cálculo de horas
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

        let totalMinutesWorked = 0;
        let totalMinutesBalance = 0;

        reportData.forEach((item) => {
            const isBreak = item.statusRecord === 'IMPLICIT_BREAK';
            const isPending = item.statusRecord === 'PENDING';
            if (!isBreak && !isPending) {
                totalMinutesWorked += timeToMinutes(item.hoursWork);
                totalMinutesBalance += timeToMinutes(item.balance);
            }
        });

        const totalHoursStr = minutesToTime(totalMinutesWorked);
        const totalBalanceStr = minutesToTime(totalMinutesBalance);

        // Dados do Cabeçalho
        const fileName = `relatorio_detalhado_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
        const employeeName = reportData[0]?.employeeData?.employeeName || 'N/A';
        const companyName = reportData[0]?.employeeData?.companyName || 'N/A';
        const periodStart = selectedDates[0] ? format(selectedDates[0], 'dd/MM/yyyy') : '-';
        const periodEnd = selectedDates[selectedDates.length - 1] ? format(selectedDates[selectedDates.length - 1], 'dd/MM/yyyy') : '-';

        // --- Layout do Cabeçalho ---
        doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
        doc.rect(14, 15, 2, 12, 'F'); 

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
        doc.text("Relatório de Ponto", 20, 24);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(LABEL_COLOR[0], LABEL_COLOR[1], LABEL_COLOR[2]);
        doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 196, 24, { align: 'right' });

        const boxY = 32;
        const boxHeight = 35;
        
        doc.setFillColor(BG_LIGHT[0], BG_LIGHT[1], BG_LIGHT[2]);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, boxY, 182, boxHeight, 2, 2, 'FD');

        const col1X = 20;
        doc.setFontSize(8);
        doc.setTextColor(LABEL_COLOR[0], LABEL_COLOR[1], LABEL_COLOR[2]);
        doc.text("EMPRESA", col1X, boxY + 8);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
        doc.text(companyName.toUpperCase(), col1X, boxY + 13);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(LABEL_COLOR[0], LABEL_COLOR[1], LABEL_COLOR[2]);
        doc.text("COLABORADOR", col1X, boxY + 23);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
        doc.text(employeeName.toUpperCase(), col1X, boxY + 28);

        const col2X = 110;
        const col3X = 155;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(LABEL_COLOR[0], LABEL_COLOR[1], LABEL_COLOR[2]);
        doc.text("PERÍODO SELECIONADO", col2X, boxY + 8);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
        doc.text(`${periodStart} a ${periodEnd}`, col2X, boxY + 13);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(LABEL_COLOR[0], LABEL_COLOR[1], LABEL_COLOR[2]);
        doc.text("TOTAL TRABALHADO", col2X, boxY + 23);
        doc.text("SALDO DO PERÍODO", col3X, boxY + 23);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
        doc.text(totalHoursStr, col2X, boxY + 29);

        if (totalMinutesBalance < 0) {
            doc.setTextColor(220, 38, 38);
        } else {
            doc.setTextColor(22, 163, 74);
        }
        doc.text(totalBalanceStr, col3X, boxY + 29);

        // --- Tabela ---
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
            
            let rowFillColor = undefined; 
            if (isItemHoliday) rowFillColor = [254, 242, 242]; 
            if (isBreak) rowFillColor = [248, 250, 252]; 

            const fontStyle = isBreak ? 'italic' : 'normal';
            const statusRGB = getStatusRGB(item.statusRecord);

            const rowCells = [
                { content: colInicio, styles: { fontStyle: fontStyle, halign: 'center' } }, 
                { content: colFim, styles: { fontStyle: fontStyle, halign: 'center' } },    
                { content: displayDuration, styles: { fontStyle: fontStyle, halign: 'center' } }, 
                { content: displayBalance, styles: { fontStyle: fontStyle, halign: 'center' } },  
                { 
                    content: isItemHoliday ? `${statusLabel} (FERIADO)` : statusLabel, 
                    styles: { 
                        fontStyle: 'bold',
                        textColor: [255, 255, 255], 
                        fillColor: statusRGB,       
                        halign: 'center',
                        cellPadding: 3 
                    } 
                } 
            ];

            if (rowFillColor) {
                tableBody.push(rowCells.map((cell, index) => {
                    if (index === 4) return cell; 
                    return { ...cell, styles: { ...cell.styles, fillColor: rowFillColor } };
                }));
            } else {
                tableBody.push(rowCells);
            }
        });

        autoTable(doc, {
            startY: boxY + boxHeight + 10,
            head: [['Início da Jornada', 'Fim da Jornada', 'Duração', 'Saldo', 'Status']], 
            body: tableBody,
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 4,
                valign: 'middle',
                lineWidth: 0,
                lineColor: [226, 232, 240],
            },
            headStyles: {
                fillColor: PRIMARY_COLOR, 
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center',
                cellPadding: 5,
                lineWidth: 0,
            },
            columnStyles: {
                0: { cellWidth: 45 },
                1: { cellWidth: 45 },
                2: { cellWidth: 25 },
                3: { cellWidth: 25 },
                4: { cellWidth: 'auto', fontStyle: 'bold' }
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251] 
            }
        });

        doc.save(fileName);
    };

    // === CSV DETALHADO ===
    const handleDownloadCSVDetailed = () => {
        if (reportData.length === 0) {
            toast({ title: "Erro", description: "Não há dados para gerar o CSV.", variant: "destructive" });
            return;
        }

        const headers = ["Data Início", "Hora Início", "Data Fim", "Hora Fim", "Duração", "Saldo", "Status", "Funcionário", "Empresa"];

        const csvDataRows = reportData.map(item => {
            const isPending = item.statusRecord === 'PENDING';
            return [
                item.startWork, 
                item.startHour,
                isPending ? '' : item.endWork, 
                isPending ? '' : item.endHour, 
                isPending ? '' : item.hoursWork,
                (item.statusRecord === 'IMPLICIT_BREAK' || isPending) ? '00:00' : item.balance,
                getTranslatedStatus(item.statusRecord), 
                item.employeeData.employeeName,
                item.employeeData.companyName,
            ];
        });

        const fileName = `relatorio_detalhado_csv_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
        generateCSV(csvDataRows, headers, fileName); 
        toast({ title: "CSV Gerado", description: "Relatório detalhado baixado em formato CSV!" });
    };

    const handleEditRecord = (record: DetailedReportItem) => {
        setSelectedRecord(record);
        const formatDateToInput = (dateString: string) => {
            if (!dateString) return "";
            const parts = dateString.split('-');
            return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateString;
        };

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
            if (!selectedRecord || !selectedRecord.timeRecordId) throw new Error("Registro não encontrado.");

            const formatDate = (dateString: string) => {
                const [year, month, day] = dateString.split('-');
                return `${day}-${month}-${year}`;
            };

            const requestBody = {
                startDate: formatDate(data.startDate),
                endDate: formatDate(data.endDate),
                startHour: data.startHour,
                endHour: data.endHour,
                managerId: data.managerId,
            };

            await updateTimeRecord(selectedRecord.timeRecordId, requestBody);

            toast({ title: "Sucesso", description: "Solicitação enviada para aprovação." });
            setEditModalOpen(false);
            setSelectedRecord(null);
            form.reset();
            handleSearch();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast({ title: "Erro", description: (error as Error).message, variant: "destructive" });
        }
    };

    const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);

    return (
        <PageShell
            sidebarOpen={sidebarOpen}
            toggleSidebar={handleToggleSidebar}
            mainClassName="pt-16 mobile-container py-4 sm:py-20 space-y-6 sm:space-y-8 relative z-10"
        >
                <div className="space-y-6 sm:space-y-8 relative z-10">
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                            Relatório De Horas
                        </h1>
                        <p className="text-muted-foreground">
                            Gere relatórios detalhados com informações completas de registros de ponto
                        </p>
                    </div>

                    {reportData.length > 0 && (
                        <ResultadosRelatorioDetalhado
                            reportData={reportData}
                            statusFilter={status}
                            referenceTime={referenceTime}
                            selectedDates={selectedDates}
                            onEditRecord={handleEditRecord}
                            // --- ALTERAÇÃO AQUI: Passando as funções de download ---
                            onDownloadPDF={handleDownloadPDFDetailed}
                            onDownloadCSV={handleDownloadCSVDetailed}
                        />
                    )}

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
                        employees={employees}
                        isPartner={isPartner}
                        hasResults={hasResults}
                        onSearch={handleSearch}
                        onDownloadPDF={handleDownloadPDFDetailed} 
                        onDownloadCSV={handleDownloadCSVDetailed} 
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
                            form={form}
                        />
                    </Card>
                </div>
        </PageShell>
    );
};

export default RelatorioDetalhado;
