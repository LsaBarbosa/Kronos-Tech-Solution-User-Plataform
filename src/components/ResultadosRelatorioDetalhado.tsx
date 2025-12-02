// src/components/ResultadosRelatorioDetalhado.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download, Edit, Coffee, FileText, MapPin } from "lucide-react"; // Usando Coffee para Pausa
import { DetailedReportItem, statusOptions, getStatusColor, getTranslatedStatus, formatDateWithDayOfWeek } from "@/utils/report-utils"; 
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";
import { Button } from "./ui/button";
import { PaginationComponent } from "./ui/PaginationComponent";

// Define 5 itens por página para a paginação local (Client-Side)
const ROWS_PER_PAGE = 5; 
const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    if (!latitude || !longitude) return "Localização indisponível";

    try {
        // API OpenStreetMap (Nominatim)
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'KronosSystem/1.0',
                'Accept-Language': 'pt-BR' // Força resposta em português
            }
        });

        if (!response.ok) throw new Error('Erro na geocodificação');

        const data = await response.json();
        
        // LÓGICA ATUALIZADA:
        // Verifica se o objeto 'address' existe na resposta
        if (data.address) {
            const { road, village, municipality, state, postcode } = data.address;

            // Cria um array com os campos desejados na ordem que você pediu
            const addressParts = [
                road, 
                village, 
                municipality, 
                state, 
                postcode
            ];

            // O .filter(Boolean) remove campos que vierem vazios ou nulos (undefined)
            // O .join(", ") junta tudo com vírgula e espaço
            const formattedAddress = addressParts.filter(Boolean).join(", ");

            // Retorna o endereço formatado. Se ficar vazio (nenhum campo encontrado), usa o display_name como fallback.
            return formattedAddress || data.display_name;
        }

        // Fallback caso o objeto address não venha estruturado
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
}

export const ResultadosRelatorioDetalhado: React.FC<ResultadosDetalhadoProps> = ({
    reportData,
    statusFilter,
    referenceTime,
    selectedDates,
    onEditRecord
}) => {
    const { toast } = useToast();

    // --- PAGINAÇÃO E SCROLL CONTROL ---
    const [currentPage, setCurrentPage] = useState(0);
    const resultsRef = useRef<HTMLDivElement>(null); 
    const cardHeaderRef = useRef<HTMLDivElement>(null); // NOVO: Referência para o CardHeader
    const isInitialMount = useRef(true); 
    // --- FIM PAGINAÇÃO E SCROLL CONTROL ---
// Dentro do componente que exibe um único registro
   type AddressPair = { entry?: string; exit?: string };

const [addressMap, setAddressMap] = useState<Record<number, AddressPair>>({});

    // --- CÁLCULOS DE PAGINAÇÃO (Memorizados) ---
    const totalElements = reportData.length;
    const totalPages = Math.ceil(totalElements / ROWS_PER_PAGE);

    // Usa useMemo para calcular a fatia de dados a ser exibida na página atual
    const currentRecords = useMemo(() => {
        const startIndex = currentPage * ROWS_PER_PAGE;
        const endIndex = startIndex + ROWS_PER_PAGE;
        return reportData.slice(startIndex, endIndex);
    }, [reportData, currentPage]);
    
    // Se a página atual não tiver dados (pode acontecer se o filtro esvaziar a última página),
    // volta para a página 0.
    if (currentPage > 0 && currentRecords.length === 0 && totalElements > 0) {
        setCurrentPage(0);
    }

    useEffect(() => {
        const fetchAddresses = async () => {
            // Agora o objeto armazena pares de endereços
            const newAddresses: Record<number, AddressPair> = {};
            let hasNewAddress = false;

            // Filtra registros que precisam de atualização (entrada ou saída faltando)
            const recordsToFetch = currentRecords.filter(item => {
                // Se não é CREATED ou UPDATED (depende da sua regra), ignora
                // Ajuste se quiser mostrar local para outros status
                if (item.statusRecord !== 'CREATED' && 
                    item.statusRecord !== 'UPDATED' && 
                    item.statusRecord !== 'PENDING' && 
                    item.statusRecord !== 'UPDATE_REJECTED' && 
                    item.statusRecord !== 'PENDING_APPROVAL') return false;

                const current = addressMap[item.timeRecordId] || {};
                
                // Precisa buscar se: tem coordenada MAS não tem endereço salvo
                const needEntry = item.latitude && item.longitude && !current.entry;
                const needExit = item.endLatitude && item.endLongitude && !current.exit;

                return needEntry || needExit;
            });

            if (recordsToFetch.length === 0) return;

            await Promise.all(recordsToFetch.map(async (record) => {
                const current = addressMap[record.timeRecordId] || {};
                let entryAddr = current.entry;
                let exitAddr = current.exit;

                // Busca Entrada se necessário
                if (record.latitude && record.longitude && !entryAddr) {
                    entryAddr = await getAddressFromCoordinates(record.latitude, record.longitude);
                    hasNewAddress = true;
                }

                // Busca Saída se necessário
                if (record.endLatitude && record.endLongitude && !exitAddr) {
                    exitAddr = await getAddressFromCoordinates(record.endLatitude, record.endLongitude);
                    hasNewAddress = true;
                }

                if (hasNewAddress) {
                    newAddresses[record.timeRecordId] = { 
                        entry: entryAddr, 
                        exit: exitAddr 
                    };
                }
            }));

            if (hasNewAddress) {
                setAddressMap(prev => ({ 
                    ...prev, 
                    // Faz o merge inteligente para não perder dados anteriores
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
    
// --- FUNÇÃO DE DOWNLOAD ROBUSTA (MANTIDA) ---
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
            const token = localStorage.getItem('token');
            if (!token) {
                toast({
                    title: "Não Autorizado",
                    description: "Token de autenticação ausente. Faça login novamente.",
                    variant: "destructive"
                });
                return;
            }

            // 1. Monta a URL: /documents/{documentId}?employeeId={employeeId}
            const url = `${API_BASE_URL}documents/${documentId}?employeeId=${employeeId}`;

            // 2. Realiza o fetch com o token no header
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                let errorMessage = "Não foi possível realizar o download.";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                } catch {
                    // Ignora se não for JSON, usa a mensagem padrão.
                }
                throw new Error(errorMessage);
            }

            // 3. Extrai o nome do arquivo do header Content-Disposition
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `${employeeName}_justificativa_de_abono`; 

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = decodeURIComponent(filenameMatch[1].replace(/\"/g, ''));
                }
            }

            // 4. Cria o Blob e força o download
            const blob = await response.blob();
            const href = window.URL.createObjectURL(blob);
            const link = window.document.createElement('a');
            link.href = href;
            link.download = filename;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            window.URL.revokeObjectURL(href);

            toast({
                title: "Download Iniciado",
                description: `Download de ${filename} concluído.`,
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
    // --- FIM DA FUNÇÃO DE DOWNLOAD ROBUSTA ---
    
    // Lógica do PDF Detalhado (MANTIDA)
    const handleDownload = () => {
        // Usa reportData (todos os registros) para o download do PDF, pois é o relatório completo.
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

            // ESTILO: TÍTULO PRINCIPAL
            doc.setTextColor(0, 150, 136); 
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.text('RELATÓRIO DETALHADO DE PONTO', 20, 25);

            // Volta para estilo de texto normal
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0); 
            let yPosition = 40;

            if (reportData.length > 0 && reportData[0].employeeData) {
                doc.text(`Funcionário: ${reportData[0].employeeData.employeeName}`, 20, yPosition);
                yPosition += 7;
                doc.text(`Empresa: ${reportData[0].employeeData.companyName}`, 20, yPosition);
                yPosition += 7;
            }

         if (statusFilter && statusFilter.length > 0) {
                
                const statusLabel = statusFilter.map(getTranslatedStatus).join(', '); 
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

            // ESTILOS DE CORES PARA LINHAS
            const COLOR_MAIN_RECORD = [240, 255, 240]; 
            const COLOR_BREAK_RECORD = [230, 230, 250]; 
            const COLOR_SEPARATOR = [200, 200, 200];       

            // Prepara os dados da tabela
            const tableBody: any[] = [];

            reportData.forEach(item => { 
                const isBreak = item.statusRecord === 'IMPLICIT_BREAK';
                
                const formattedDateStart = formatDateWithDayOfWeek(item.startWork); 
                const formattedDateEnd = formatDateWithDayOfWeek(item.endWork);   

                const formattedStart = `${formattedDateStart}\n${item.startHour}`; 
                const formattedEnd = `${formattedDateEnd}\n${item.endHour}`;       

                const statusLabel = getTranslatedStatus(item.statusRecord);
                const fillColor = isBreak ? COLOR_BREAK_RECORD : COLOR_MAIN_RECORD;
                const fontStyle = isBreak ? 'italic' : 'normal';

                const rowCells = [
                    { content: formattedStart, styles: { fillColor: fillColor } },
                    { content: formattedEnd, styles: { fillColor: fillColor } },
                    { content: item.hoursWork, styles: { fillColor: fillColor } },
                    { content: isBreak ? '00:00' : item.balance, styles: { fillColor: fillColor } },
                    { content: statusLabel, styles: { fillColor: fillColor } }
                ];
                
                tableBody.push(rowCells.map(cell => ({
                    ...cell,
                    styles: {
                        ...cell.styles,
                        halign: 'center',
                        cellPadding: isBreak ? 2 : 4, 
                        fontSize: isBreak ? 8 : 9,
                        fontStyle: fontStyle
                    }
                })));

                // Linha separadora
                tableBody.push([
                   { content: '', colSpan: 5, styles: { fillColor: COLOR_SEPARATOR, cellPadding: 0.2 } }
                ]);
            });


            yPosition += 10;

            // Remove a última linha separadora extra
            if (tableBody.length > 0) {
                tableBody.pop();
            }

            autoTable(doc, {
                head: [['Início (Data/Dia da Semana/Hora)', 'Fim (Data/Dia da Semana/Hora)', 'Duração', 'Saldo', 'Status']], 
                body: tableBody,
                startY: yPosition,
                margin: { left: 20, right: 20 },
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
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
                        
                        if (status === getTranslatedStatus('IMPLICIT_BREAK') || balance === '00:00') {
                            data.cell.styles.textColor = [0, 0, 0]; 
                            data.cell.styles.fontStyle = 'italic';
                        } else if (balance) {
                            if (balance.toString().startsWith('-')) {
                                data.cell.styles.textColor = [220, 53, 69]; 
                                data.cell.styles.fontStyle = 'bold';
                            } else if (!balance.toString().startsWith('-') && balance !== '00:00') {
                                data.cell.styles.textColor = [40, 167, 69]; 
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
                doc.setTextColor(100, 149, 237); 
                doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
                doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, doc.internal.pageSize.height - 10);
            }
            doc.setTextColor(0, 0, 0); 


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

    // --- EFEITO DE CORREÇÃO DE SCROLL (Aprimorado para a Paginação) ---
    useEffect(() => {
        // 1. Na montagem inicial, apenas marca a flag e retorna.
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // 2. Em qualquer mudança de página subsequente:
        if (cardHeaderRef.current) { // ALTERADO: Usa cardHeaderRef
            // Rola até o topo do Card Header. O block: 'start' garante que o título fique visível.
            cardHeaderRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'      
            });
        }
    }, [currentPage]);
    // --- FIM EFEITO DE CORREÇÃO DE SCROLL ---

    return (
       // O componente Card continua com a ref principal, mas o scroll mira no CardHeader
       <Card className="shadow-card border-t-4 border-t-primary mb-8" ref={resultsRef}>
            <CardHeader 
                className="flex flex-row justify-between items-center" 
                ref={cardHeaderRef} // ADICIONADO: Ref no CardHeader para mira do scroll
            >
                <div>
                    <CardTitle>Resultados do Relatório Detalhado</CardTitle>
                    {/* A descrição agora reflete a página e o total de registros */}
                    <CardDescription>{totalElements} registro(s) detalhado(s) encontrado(s). (Página {currentPage + 1} de {totalPages})</CardDescription> 
                </div>
            </CardHeader>
            <CardContent className="p-4">
                {/* O loop agora utiliza currentRecords, que contém apenas os 5 itens da página atual */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentRecords.map((item, index) => {
                        const isBreak = item.statusRecord === 'IMPLICIT_BREAK';
                        const isCreated = item.statusRecord === 'CREATED';
                        const addresses = addressMap[item.timeRecordId] || {};
                        const handleCardClick = () => {
                            // Impedir a edição de registros de Pausa (IMPLICIT_BREAK)
                            if (!isBreak) {
                                onEditRecord(item);
                            }
                        };
                        
                        return (
                            <Card
                                key={item.timeRecordId || index}
                                // Estilos para Pausa vs Trabalho
                                className={`
                                    border-l-4 shadow-md transition-all duration-300
                                    ${isBreak ? 'border-l-gray-500 bg-gray-500/10 cursor-default' : 'border-l-primary bg-card/80 cursor-pointer hover:shadow-lg hover:border-primary/80 group'}
                                `}
                                onClick={handleCardClick}
                            >
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <div className="flex items-center gap-2">
                                            {isBreak ? <Coffee className="h-4 w-4 text-gray-500" /> : <CalendarIcon className="h-4 w-4 text-primary" />}
                                            <span className="font-bold text-lg text-foreground">{item.startWork}</span>
                                        </div>
                                        <Badge className={`${getStatusColor(item.statusRecord)}`}>
                                            {statusOptions.find(opt => opt.value === item.statusRecord)?.label || item.statusRecord}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div className="font-medium text-muted-foreground">Início:</div>
                                        <div className="text-right font-semibold text-foreground">{item.startHour}</div>

                                        <div className="font-medium text-muted-foreground">Fim:</div>
                                        <div className="text-right font-semibold text-foreground">{item.endHour}</div>

                                        {/* Título de Duração muda se for Pausa */}
                                        <div className="font-medium text-muted-foreground">
                                            {isBreak ? 'Duração da Pausa' : 'Horas Trabalhadas'}
                                        </div>
                                        <div className="text-right font-bold text-foreground">{item.hoursWork}</div>

                                        {/* Saldo é apenas para registros de Trabalho */}
                                        {!isBreak && (
                                            <>
                                                <div className="font-medium text-muted-foreground">Saldo:</div>
                                                <div className={`text-right font-bold ${item.balance.startsWith('-') ? 'text-destructive' : 'text-green-600'}`}>{item.balance}</div>
                                            </>
                                        )}
                                    </div>
{/* Renderização Condicional de Localização */}
{( (item.latitude && item.longitude) || (item.endLatitude && item.endLongitude) ) && (
    <div className="flex flex-col pt-3 border-t mt-2 gap-2">
        
        {/* Endereço de Entrada */}
        {item.latitude && item.longitude && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mt-0.5 text-green-600 shrink-0" />
                <span className="break-words leading-tight">
                    <strong>Entrada: </strong>
                    {addresses.entry ? addresses.entry : <span className="animate-pulse">Carregando...</span>}
                </span>
            </div>
        )}

        {/* Endereço de Saída - NOVO */}
        {item.endLatitude && item.endLongitude && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mt-0.5 text-red-500 shrink-0" />
                <span className="break-words leading-tight">
                    <strong>Saída: </strong>
                    {addresses.exit ? addresses.exit : <span className="animate-pulse">Carregando...</span>}
                </span>
            </div>
        )}
    </div>
)}
                                    {/* --- Botão/Status de Documento Anexo --- */}
                                    {item.documentDownloadPath && ( 
                                        <div className="flex justify-between items-center pt-3 border-t mt-4">
                                            <div className="flex items-center gap-2 text-primary text-sm font-medium">
                                                 <FileText className="h-4 w-4" />
                                                Documento Anexado
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Evita que o clique no botão ative o handleCardClick
                                                    handleDocumentDownload(
                                                        item.documentDownloadPath!, // ID do Documento
                                                        item.employeeId, // ID do Colaborador
                                                        item.employeeData.employeeName // Nome do Colaborador para o nome do arquivo
                                                    );
                                                }}
                                                title="Baixar Comprovante"
                                            >
                                                <Download className="h-4 w-4 text-foreground   " />
                                            </Button>
                                        </div>
                                    )}
                                    {/* --- FIM Botão/Status de Documento Anexo --- */}
                                    
                                    {/* Ícone de Edição só aparece se não for pausa */}
                                    {!isBreak && (
                                        <div className="flex justify-end pt-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Edit className="h-4 w-4" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
                {/* --- COMPONENTE DE PAGINAÇÃO (Renderizado se houver mais de 1 página) --- */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                        <PaginationComponent
                            totalPages={totalPages}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage} // Função para mudar a página
                            totalElements={totalElements}
                        />
                    </div>
                )}
                {/* --- FIM COMPONENTE DE PAGINAÇÃO --- */}
            </CardContent>
        </Card>
    );
};