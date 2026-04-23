// src/components/ResultadosRelatorioDetalhado.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download, Edit, Coffee, FileText, MapPin, Clock } from "lucide-react";
import { DetailedReportItem, statusOptions, getStatusColor, statusMap } from "@/utils/report-utils"; 
import { useToast } from "@/hooks/use-toast";
import { downloadDocument } from "@/service/document.Service";
import { Button } from "./ui/button";
import { PaginationComponent } from "./ui/PaginationComponent";

// Define 5 itens por página para a paginação local (Client-Side)
const ROWS_PER_PAGE = 5; 

// --- FUNÇÕES AUXILIARES DE CÁLCULO DE TEMPO ---
const parseBalanceToMinutes = (balanceStr: string): number => {
    if (!balanceStr || balanceStr === "00:00" || balanceStr.length < 5) return 0;
    
    const cleanStr = balanceStr.trim();
    const sign = cleanStr.startsWith("-") ? -1 : 1;
    
    const timePart = cleanStr.replace(/[+-]/, "");
    const [hours, minutes] = timePart.split(":").map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) return 0;
    
    return sign * (hours * 60 + minutes);
};

// Nova função específica para parsear horas trabalhadas (sem sinal negativo)
const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr || timeStr === "00:00" || timeStr.length < 5) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours * 60 + minutes;
};

const formatMinutesToBalance = (totalMinutes: number): string => {
    const sign = totalMinutes < 0 ? "-" : "+";
    const absMinutes = Math.abs(totalMinutes);
    const hours = Math.floor(absMinutes / 60);
    const minutes = absMinutes % 60;
    
    return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const formatMinutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
// --- FIM FUNÇÕES AUXILIARES ---

const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    if (!latitude || !longitude) return "Localização indisponível";

    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'KronosSystem/1.0',
                'Accept-Language': 'pt-BR'
            }
        });

        if (!response.ok) throw new Error('Erro na geocodificação');

        const data = await response.json();
        
        if (data.address) {
            const { road, village, municipality, state, postcode } = data.address;
            const addressParts = [road, village, municipality, state, postcode];
            const formattedAddress = addressParts.filter(Boolean).join(", ");
            return formattedAddress || data.display_name;
        }

        return data.display_name || "Endereço não encontrado";

    } catch (error) {
        console.error("Erro ao buscar endereço:", error);
        return "Erro ao carregar endereço";
    }
};

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

    // --- PAGINAÇÃO E SCROLL CONTROL ---
    const [currentPage, setCurrentPage] = useState(0);
    const resultsRef = useRef<HTMLDivElement>(null); 
    const cardHeaderRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true); 
    
    type AddressPair = { entry?: string; exit?: string };
    const [addressMap, setAddressMap] = useState<Record<number, AddressPair>>({});

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
    const groupedCurrentRecords = useMemo(() => {
        const groups: Record<string, DetailedReportItem[]> = {};
        
        currentRecords.forEach(record => {
            const dateKey = record.startWork; 
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(record);
        });
        
        return Object.entries(groups);
    }, [currentRecords]);

    if (currentPage > 0 && currentRecords.length === 0 && totalElements > 0) {
        setCurrentPage(0);
    }

    // --- BUSCA DE ENDEREÇOS ---
    useEffect(() => {
        const fetchAddresses = async () => {
            const newAddresses: Record<number, AddressPair> = {};
            let hasNewAddress = false;

            const recordsToFetch = currentRecords.filter(item => {
                if (item.statusRecord !== 'CREATED' && 
                    item.statusRecord !== 'UPDATED' && 
                    item.statusRecord !== 'PENDING' && 
                    item.statusRecord !== 'UPDATE_REJECTED' && 
                    item.statusRecord !== 'PENDING_APPROVAL') return false;

                const current = addressMap[item.timeRecordId] || {};
                const needEntry = item.latitude && item.longitude && !current.entry;
                const needExit = item.endLatitude && item.endLongitude && !current.exit;

                return needEntry || needExit;
            });

            if (recordsToFetch.length === 0) return;

            await Promise.all(recordsToFetch.map(async (record) => {
                const current = addressMap[record.timeRecordId] || {};
                let entryAddr = current.entry;
                let exitAddr = current.exit;

                if (record.latitude && record.longitude && !entryAddr) {
                    entryAddr = await getAddressFromCoordinates(record.latitude, record.longitude);
                    hasNewAddress = true;
                }

                if (record.endLatitude && record.endLongitude && !exitAddr) {
                    exitAddr = await getAddressFromCoordinates(record.endLatitude, record.endLongitude);
                    hasNewAddress = true;
                }

                if (hasNewAddress) {
                    newAddresses[record.timeRecordId] = { entry: entryAddr, exit: exitAddr };
                }
            }));

            if (hasNewAddress) {
                setAddressMap(prev => ({ 
                    ...prev, 
                    ...Object.keys(newAddresses).reduce((acc, key) => {
                        const id = Number(key);
                        acc[id] = { ...prev[id], ...newAddresses[id] };
                        return acc;
                    }, {} as Record<number, AddressPair>)
                }));
            }
        };

        fetchAddresses();
    }, [currentRecords, addressMap]);
    
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
            await downloadDocument(documentId, `${employeeName}_documento`);

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
            <Card className="shadow-card border-t-4 border-t-muted mb-8">
                <CardContent className="py-8 text-center text-muted-foreground">
                    Nenhum registro encontrado para o período.
                </CardContent>
            </Card>
        );
    }

    return (
       <div className="space-y-6">
            {/* CARD DE RESUMO GERAL */}
            <Card className="bg-primary/5 border-primary/20 shadow-sm">
                <CardContent className="flex flex-row items-center justify-between p-6">
                    <div className="space-y-3 w-full">
                        {/* Saldo Total */}
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Saldo Total do Período Selecionado</p>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-3xl font-bold ${totalPeriodBalance.startsWith('-') ? 'text-destructive' : 'text-green-600'}`}>
                                    {totalPeriodBalance}
                                </span>
                                <span className="text-sm text-muted-foreground">horas</span>
                            </div>
                        </div>
                        
                        {/* Divisória sutil */}
                        <div className="h-px bg-border/50 w-1/2" />

                        {/* Total Horas Trabalhadas */}
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total de horas trabalhadas</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-foreground">
                                    {totalPeriodHours}
                                </span>
                                <span className="text-sm text-muted-foreground">horas</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-background p-4 rounded-full shadow-sm self-start mt-2">
                        <Clock className="h-8 w-8 text-primary" />
                    </div>
                </CardContent>
            </Card>

            {/* LISTA PRINCIPAL */}
            <Card className="shadow-card border-t-4 border-t-primary mb-8" ref={resultsRef}>
                <CardHeader className="flex flex-row justify-between items-start" ref={cardHeaderRef}>
                    <div>
                        <CardTitle>Resultados do Relatório</CardTitle>
                        <CardDescription>
                            {totalElements} registro(s) encontrados. (Página {currentPage + 1} de {totalPages})
                        </CardDescription> 
                    </div>
                    
                    {/* BOTÕES DE EXPORTAÇÃO - Agora usam as props passadas pelo pai */}
                    <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={onDownloadPDF} className="gap-2 w-full justify-start">
                            <Download className="h-4 w-4" />
                            Exportar PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={onDownloadCSV} className="gap-2 w-full justify-start">
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
                            <div key={dateKey} className="border rounded-lg bg-slate-50/50 dark:bg-slate-900/20 overflow-hidden">
                                {/* Cabeçalho do Dia */}
                                <div className="bg-muted/30 p-3 border-b flex flex-wrap justify-between items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5 text-primary" />
                                        <h3 className="font-semibold text-lg capitalize text-foreground">
                                            {dateKey} 
                                        </h3>
                                    </div>
                                    
                                    {/* Infos do Dia: Saldo e Horas Trabalhadas */}
                                    <div className="flex flex-col items-end gap-1 sm:flex-row sm:gap-4 sm:items-center">
                                        <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-md shadow-sm border border-transparent">
                                            <span className="text-xs font-medium text-muted-foreground">Horas trabalhadas:</span>
                                            <span className="font-bold text-foreground">
                                                {dailyWorkedHours}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-md shadow-sm border">
                                            <span className="text-xs font-medium text-muted-foreground">Saldo do Dia:</span>
                                            <span className={`font-bold ${isNegativeBalance ? 'text-destructive' : 'text-green-600'}`}>
                                                {dailyBalance}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Grid de Registros do Dia */}
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {dayRecords.map((item, index) => {
                                        const isBreak = item.statusRecord === 'IMPLICIT_BREAK';
                                        const addresses = addressMap[item.timeRecordId] || {};
                                        
                                        return (
                                            <Card
                                                key={item.timeRecordId || index}
                                                className={`
                                                    border-l-4 shadow-sm transition-all duration-200
                                                    ${isBreak 
                                                        ? 'border-l-gray-400 bg-gray-100/50 dark:bg-gray-800/50 cursor-default' 
                                                        : 'border-l-primary bg-card hover:shadow-md cursor-pointer group'}
                                                `}
                                                onClick={() => !isBreak && onEditRecord(item)}
                                            >
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
                                                        <div className="flex flex-col pt-2 border-t border-border/50 gap-1.5 mt-2 bg-muted/20 p-2 rounded text-xs">
                                                            {item.latitude && (
                                                                <div className="flex items-start gap-1.5">
                                                                    <MapPin className="h-3 w-3 mt-0.5 text-green-600 shrink-0" />
                                                                    <span className="text-muted-foreground line-clamp-2" title={addresses.entry}>
                                                                        {addresses.entry || "Carregando..."}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {item.endLatitude && (
                                                                <div className="flex items-start gap-1.5">
                                                                    <MapPin className="h-3 w-3 mt-0.5 text-red-500 shrink-0" />
                                                                    <span className="text-muted-foreground line-clamp-2" title={addresses.exit}>
                                                                        {addresses.exit || "Carregando..."}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center pt-2 mt-1">
                                                        {item.documentDownloadPath ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 px-2 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDocumentDownload(item.documentDownloadPath!, item.employeeId, item.employeeData.employeeName);
                                                                }}
                                                            >
                                                                <FileText className="h-3.5 w-3.5" />
                                                                Ver Anexo
                                                            </Button>
                                                        ) : <div />}
                                                        
                                                        {!isBreak && (
                                                            <div className="text-primary/50 group-hover:text-primary transition-colors">
                                                                <Edit className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
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
