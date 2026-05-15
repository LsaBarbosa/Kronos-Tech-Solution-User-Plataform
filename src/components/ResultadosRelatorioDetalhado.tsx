// src/components/ResultadosRelatorioDetalhado.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download, Edit, Coffee, FileText, MapPin, Clock, TrendingUp } from "lucide-react";
import type { DetailedReportItem} from "@/utils/report-utils";
import { getStatusColor, statusMap } from "@/utils/report-utils"; 
import { useToast } from "@/hooks/use-toast";
import { downloadDocument } from "@/service/document.service";
import { resolveDocumentId } from "@/utils/document-resolution";
import { Button } from "./ui/button";
import { PaginationComponent } from "./ui/PaginationComponent";
import {
    parseBalanceToMinutes,
    parseTimeToMinutes,
    formatMinutesToBalance,
    formatMinutesToTime,
    formatCoordinates,
    groupRecordsByDate,
} from "./ResultadosRelatorioDetalhado.utils";

// Define 5 itens por página para a paginação local (Client-Side)
const ROWS_PER_PAGE = 5; 

interface ResultadosDetalhadoProps {
    reportData: DetailedReportItem[];
    statusFilter: string[];
    referenceTime: string;
    selectedDates: Date[];
    onEditRecord: (record: DetailedReportItem) => void;
    // Novas props para receber as funções do pai
    onDownloadPDF: () => void;
    onDownloadCSV: () => void;
}

export const ResultadosRelatorioDetalhado: React.FC<ResultadosDetalhadoProps> = ({
    reportData,
    statusFilter,
    referenceTime,
    selectedDates,
    onEditRecord,
    onDownloadPDF, // Recebendo via prop
    onDownloadCSV  // Recebendo via prop
}) => {
    const { toast } = useToast();
    void statusFilter;
    void referenceTime;
    void selectedDates;

    // --- PAGINAÇÃO E SCROLL CONTROL ---
    const [currentPage, setCurrentPage] = useState(0);
    const resultsRef = useRef<HTMLDivElement>(null); 
    const cardHeaderRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true); 
    
    // --- CÁLCULOS DE TOTAIS DO PERÍODO (Memoized) ---
    const { totalPeriodBalance, totalPeriodHours } = useMemo(() => {
        const uniqueDays = new Set<string>();
        let totalBalanceMinutes = 0;
        let totalWorkedMinutes = 0;

        reportData.forEach(record => {
            // Lógica de Data
            let dateKey = "";
            if (record.startWork && record.startWork.includes(' ')) {
                 dateKey = record.startWork.split(' ')[0]; 
            } else {
                 dateKey = record.startWork;
            }

            // 1. Saldo: Somamos apenas uma vez por dia (pois o backend envia o saldo diário repetido)
            if (!uniqueDays.has(dateKey)) {
                uniqueDays.add(dateKey);
                if (record.balance) {
                    totalBalanceMinutes += parseBalanceToMinutes(record.balance);
                }
            }

            // 2. Horas Trabalhadas: Somamos todos os registros que NÃO são pausa
            if (record.statusRecord !== 'IMPLICIT_BREAK' && record.hoursWork) {
                totalWorkedMinutes += parseTimeToMinutes(record.hoursWork);
            }
        });

        return {
            totalPeriodBalance: formatMinutesToBalance(totalBalanceMinutes),
            totalPeriodHours: formatMinutesToTime(totalWorkedMinutes)
        };
    }, [reportData]);

    // --- CÁLCULOS DE PAGINAÇÃO ---
    const totalElements = reportData.length;
    const totalPages = Math.ceil(totalElements / ROWS_PER_PAGE);

    const currentRecords = useMemo(() => {
        const startIndex = currentPage * ROWS_PER_PAGE;
        const endIndex = startIndex + ROWS_PER_PAGE;
        return reportData.slice(startIndex, endIndex);
    }, [reportData, currentPage]);
    
    // --- AGRUPAMENTO POR DATA (Apenas da página atual para exibição) ---
    const groupedCurrentRecords = useMemo(() => groupRecordsByDate(currentRecords), [currentRecords]);

    if (currentPage > 0 && currentRecords.length === 0 && totalElements > 0) {
        setCurrentPage(0);
    }

    // --- DOWNLOAD DE DOCUMENTOS ---
    const handleDocumentDownload = async (documentId: string, employeeId: string, employeeName: string) => {
        if (!documentId || !employeeId) {
            toast({
                title: "Erro de Download",
                description: "Não há documentos anexados para esse registro.",
                variant: "destructive"
            });
            return;
        }

        try {
            await downloadDocument(documentId, `${employeeName}_documento`, employeeId);

            toast({
                title: "Download Iniciado",
                description: `Download de ${employeeName}_documento concluído.`,
            });

        } catch (error) {
            console.error("Erro ao iniciar o download:", error);
            toast({
                title: "Falha no Download",
                description: `Erro: ${(error as Error).message}`,
                variant: "destructive",
            });
        }
    };

    // --- SCROLL CONTROL ---
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (cardHeaderRef.current) { 
            cardHeaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [currentPage]);

    if (!reportData || reportData.length === 0) {
        return (
            <Card className="overflow-hidden border border-dashed border-[#D1D5DB] dark:border-[#4B5563] bg-gradient-to-br from-muted/20 to-muted/5 dark:from-slate-800/40 dark:to-slate-800/20">
                <CardContent className="py-12 px-6 text-center flex flex-col items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/10">
                        <FileText className="h-6 w-6 text-primary dark:text-[#A78BFA]" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Nenhum registro encontrado para o período.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
       <div className="space-y-6">
            {/* CARDS DE RESUMO - GRID MODERNO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card: Saldo Total */}
                <Card className="overflow-hidden border border-[#E5E7EB] dark:border-[#404854] bg-gradient-to-br from-[#F8FAFC] to-white dark:from-slate-800 dark:to-slate-800/80 shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Saldo do Período</p>
                                <div className="mt-3">
                                    <p className={`text-3xl font-bold ${totalPeriodBalance.startsWith('-') ? 'text-destructive' : 'text-[#10B981] dark:text-[#34D399]'}`}>
                                        {totalPeriodBalance}
                                    </p>
                                </div>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10B981]/10 dark:bg-[#34D399]/10">
                                <TrendingUp className={`h-5 w-5 ${totalPeriodBalance.startsWith('-') ? 'text-destructive' : 'text-[#10B981] dark:text-[#34D399]'}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card: Horas Trabalhadas */}
                <Card className="overflow-hidden border border-[#E5E7EB] dark:border-[#404854] bg-gradient-to-br from-[#F8FAFC] to-white dark:from-slate-800 dark:to-slate-800/80 shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Horas Trabalhadas</p>
                                <div className="mt-3">
                                    <p className="text-3xl font-bold text-foreground">
                                        {totalPeriodHours}
                                    </p>
                                </div>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-[#A78BFA]/10">
                                <Clock className="h-5 w-5 text-primary dark:text-[#A78BFA]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card: Total de Registros */}
                <Card className="overflow-hidden border border-[#E5E7EB] dark:border-[#404854] bg-gradient-to-br from-[#F8FAFC] to-white dark:from-slate-800 dark:to-slate-800/80 shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Registros</p>
                                <div className="mt-3">
                                    <p className="text-3xl font-bold text-foreground">
                                        {totalElements}
                                    </p>
                                </div>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-[#67E8F9]/10">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-[#67E8F9]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card: Carga Horária de Referência */}
                <Card className="overflow-hidden border border-[#E5E7EB] dark:border-[#404854] bg-gradient-to-br from-[#F8FAFC] to-white dark:from-slate-800 dark:to-slate-800/80 shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Carga Horária</p>
                                <div className="mt-3">
                                    <p className="text-3xl font-bold text-foreground">
                                        {referenceTime}
                                    </p>
                                </div>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 dark:bg-[#06B6D4]/10">
                                <Clock className="h-5 w-5 text-cyan-600 dark:text-[#06B6D4]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* LISTA PRINCIPAL */}
            <Card className="overflow-hidden border border-[#E5E7EB] dark:border-[#404854] bg-card dark:bg-slate-800/80 shadow-sm" ref={resultsRef}>
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-blue-500" />
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-[#E5E7EB] dark:border-[#404854]" ref={cardHeaderRef}>
                    <div>
                        <CardTitle>Resultados do Relatório</CardTitle>
                        <CardDescription>
                            {totalElements} registro(s) encontrados. (Página {currentPage + 1} de {totalPages})
                        </CardDescription> 
                    </div>
                    
                    {/* BOTÕES DE EXPORTAÇÃO - Modernizados */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDownloadPDF}
                            className="gap-2 border border-[#E5E7EB] dark:border-[#404854] text-[#374151] dark:text-[#F8FAFC] bg-white dark:bg-slate-700/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/40 dark:hover:border-primary/40 transition-all justify-start sm:justify-center"
                        >
                            <Download className="h-4 w-4" />
                            Exportar PDF
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDownloadCSV}
                            className="gap-2 border border-[#E5E7EB] dark:border-[#404854] text-[#374151] dark:text-[#F8FAFC] bg-white dark:bg-slate-700/50 hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/40 dark:hover:border-primary/40 transition-all justify-start sm:justify-center"
                        >
                            <FileText className="h-4 w-4" />
                            Exportar CSV
                        </Button>
                    </div>
                </CardHeader>
                
                <CardContent className="p-4 space-y-6">
                    {/* Renderiza Grupos por Dia */}
                    {groupedCurrentRecords.map(([dateKey, dayRecords]) => {
                        // Pega o saldo do primeiro registro do dia
                        const dailyBalance = dayRecords[0]?.balance || "00:00";
                        const isNegativeBalance = dailyBalance.startsWith('-');

                        // Calcula total de horas trabalhadas no DIA (excluindo pausas)
                        const dailyWorkedMinutes = dayRecords.reduce((acc, item) => {
                            if (item.statusRecord !== 'IMPLICIT_BREAK' && item.hoursWork) {
                                return acc + parseTimeToMinutes(item.hoursWork);
                            }
                            return acc;
                        }, 0);
                        const dailyWorkedHours = formatMinutesToTime(dailyWorkedMinutes);

                        return (
                            <Card key={dateKey} className="overflow-hidden border border-[#E5E7EB] dark:border-[#404854] bg-card dark:bg-slate-800/60 shadow-sm">
                                {/* Cabeçalho do Dia */}
                                <div className="bg-gradient-to-r from-muted/30 to-primary/5 dark:from-slate-800/40 dark:to-primary/10 p-4 border-b border-[#E5E7EB] dark:border-[#404854] flex flex-wrap justify-between items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5 text-primary" />
                                        <h3 className="font-semibold text-lg capitalize text-foreground">
                                            {dateKey} 
                                        </h3>
                                    </div>
                                    
                                    {/* Infos do Dia: Saldo e Horas Trabalhadas */}
                                    <div className="flex flex-col items-end gap-1 sm:flex-row sm:gap-4 sm:items-center">
                                        <div className="flex items-center gap-2 bg-background dark:bg-slate-700/50 px-3 py-1 rounded-md shadow-sm border border-[#E5E7EB] dark:border-[#404854]">
                                            <span className="text-xs font-medium text-muted-foreground">Horas trabalhadas:</span>
                                            <span className="font-bold text-foreground">
                                                {dailyWorkedHours}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 bg-background dark:bg-slate-700/50 px-3 py-1 rounded-md shadow-sm border border-[#E5E7EB] dark:border-[#404854]">
                                            <span className="text-xs font-medium text-muted-foreground">Saldo do Dia:</span>
                                            <span className={`font-bold ${isNegativeBalance ? 'text-destructive' : 'text-[#10B981] dark:text-[#34D399]'}`}>
                                                {dailyBalance}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Grid de Registros do Dia */}
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {dayRecords.map((item, index) => {
                                        const isBreak = item.statusRecord === 'IMPLICIT_BREAK';
                                        const documentId = resolveDocumentId(item);
                                        return (
                                            <Card
                                                key={item.timeRecordId || index}
                                                className={`
                                                    overflow-hidden border transition-all duration-200 relative
                                                    ${isBreak
                                                        ? 'border-[#D1D5DB] dark:border-[#4B5563] bg-[#F3F4F6] dark:bg-slate-700/30 cursor-default'
                                                        : 'border-[#E5E7EB] dark:border-[#404854] bg-card dark:bg-slate-800/80 hover:shadow-md hover:border-primary/40 dark:hover:border-[#A78BFA]/40 cursor-pointer group'}
                                                `}
                                                onClick={() => !isBreak && onEditRecord(item)}
                                            >
                                                {!isBreak && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
                                                <CardContent className="p-4 space-y-3">
                                                    <div className="flex justify-between items-start pb-2 border-b border-border/50">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1.5">
                                                                {isBreak ? <Coffee className="h-4 w-4 text-gray-500" /> : <Clock className="h-4 w-4 text-primary" />}
                                                                <span className="font-bold text-lg">{item.startHour}</span>
                                                                <span className="text-muted-foreground text-xs mx-1">até</span>
                                                                <span className="font-bold text-lg">{item.endHour || '--:--'}</span>
                                                            </div>
                                                        </div>
                                                        <Badge className={`${getStatusColor(item.statusRecord)} text-[10px] px-2 py-0.5 h-5`}>
                                                            {statusMap[item.statusRecord] || item.statusRecord}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-muted-foreground">
                                                            {isBreak ? 'Tempo de Pausa:' : 'Horas Trabalhadas:'}
                                                        </span>
                                                        <span className="font-bold font-mono text-base">
                                                            {item.hoursWork}
                                                        </span>
                                                    </div>

                                                    {((item.latitude && item.longitude) || (item.endLatitude && item.endLongitude)) && (
                                                        <div className="flex flex-col pt-3 border-t border-[#E5E7EB] dark:border-[#404854] gap-2.5 mt-3 bg-gradient-to-br from-muted/30 to-muted/10 dark:from-slate-700/20 dark:to-slate-700/10 p-3 rounded-xl text-xs">
                                                            {item.latitude && (
                                                                <div className="flex items-start gap-2">
                                                                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#10B981]/10 dark:bg-[#34D399]/10 flex-shrink-0 mt-0.5">
                                                                        <MapPin className="h-3 w-3 text-[#10B981] dark:text-[#34D399]" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-muted-foreground font-medium text-[10px] uppercase tracking-wide opacity-70">Entrada</p>
                                                                        <p className="text-muted-foreground line-clamp-2 mt-0.5">
                                                                            {formatCoordinates(item.latitude, item.longitude)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {item.endLatitude && (
                                                                <div className="flex items-start gap-2">
                                                                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-destructive/10 dark:bg-red-500/10 flex-shrink-0 mt-0.5">
                                                                        <MapPin className="h-3 w-3 text-destructive dark:text-red-400" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-muted-foreground font-medium text-[10px] uppercase tracking-wide opacity-70">Saída</p>
                                                                        <p className="text-muted-foreground line-clamp-2 mt-0.5">
                                                                            {formatCoordinates(item.endLatitude, item.endLongitude)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center pt-3 mt-2 border-t border-[#E5E7EB] dark:border-[#404854]">
                                                        {documentId ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 px-2 text-xs gap-1.5 text-primary dark:text-[#A78BFA] hover:bg-primary/10 dark:hover:bg-primary/10 transition-all rounded-md"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDocumentDownload(documentId, item.employeeId, item.employeeData.employeeName);
                                                                }}
                                                            >
                                                                <FileText className="h-3.5 w-3.5" />
                                                                Ver Anexo
                                                            </Button>
                                                        ) : <div />}

                                                        {!isBreak && (
                                                            <div className="flex items-center gap-1.5 text-primary/40 dark:text-[#A78BFA]/40 group-hover:text-primary dark:group-hover:text-[#A78BFA] transition-colors text-xs font-medium">
                                                                <Edit className="h-3.5 w-3.5" />
                                                                <span className="hidden sm:inline">Editar</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </Card>
                        );
                    })}

                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center">
                            <PaginationComponent
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                                totalElements={totalElements}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
       </div>
    );
};
