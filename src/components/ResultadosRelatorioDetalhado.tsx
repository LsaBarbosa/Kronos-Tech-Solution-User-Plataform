// src/components/ResultadosRelatorioDetalhado.tsx

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download, Edit, Pause, Play } from "lucide-react";
import { DetailedReportItem, statusOptions, getStatusColor, getTranslatedStatus } from "@/utils/report-utils";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ResultadosDetalhadoProps {
    reportData: DetailedReportItem[];
    statusFilter: string;
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

    // Lógica do PDF Detalhado (Migrada)
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

            if (statusFilter) {
                const statusLabel = getTranslatedStatus(statusFilter);
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

            // Definição das cores (RGB)
            const COLOR_MAIN_RECORD = [245, 245, 245]; // Cinza Claro (Padrão para registro principal)
            const COLOR_BREAK_RECORD = [255, 255, 255]; // Branco (Padrão para pausa)
            const COLOR_SEPARATOR = [220, 220, 220];       // Cinza (Padrão para separador)

            // Prepara os dados da tabela, incluindo sub-linhas para as pausas
            const tableBody: any[] = [];

            reportData.forEach(item => {
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

                        // Linha separadora
                        tableBody.push([
                            { content: '', colSpan: 1, styles: { fillColor: COLOR_SEPARATOR, cellPadding: 0.2 } }
                        ]);
                    });
                } else {
                    // Linha separadora após registro principal sem pausa
                    tableBody.push([
                       { content: '', colSpan: 1, styles: { fillColor: COLOR_SEPARATOR, cellPadding: 0.2 } }
                    ]);
                }
            });


            yPosition += 10;

            // Remove a última linha separadora extra
            if (tableBody.length > 0) {
                tableBody.pop();
            }

            autoTable(doc, {
                head: [['Entrada (Data/Hora)', 'Saída (Data/Hora)', 'Horas Trabalhadas', 'Saldo', 'Status']], // Novo Cabeçalho
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
                    3: { // Coluna do Saldo
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

    return (
        <Card className="mt-8 border-2 border-primary/20 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>Resultados do Relatório Detalhado</CardTitle>
                    <CardDescription>{reportData.length} registro(s) detalhado(s) encontrado(s).</CardDescription>
                </div>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 text-primary text-sm hover:opacity-80 transition-opacity"
                >
                    <Download className="h-4 w-4" />
                    Download PDF
                </button>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportData.map((item, index) => (
                        <Card
                            key={item.timeRecordId || index}
                            className="border-l-4 border-primary shadow-md cursor-pointer hover:shadow-lg hover:border-primary/80 transition-all duration-300 group"
                            onClick={() => onEditRecord(item)}
                        >
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-primary" />
                                        <span className="font-bold text-lg text-foreground">{item.startWork}</span>
                                    </div>
                                    <Badge className={`${getStatusColor(item.statusRecord)}`}>
                                        {statusOptions.find(opt => opt.value === item.statusRecord)?.label || item.statusRecord}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div className="font-medium text-muted-foreground">Entrada:</div>
                                    <div className="text-right font-semibold text-foreground">{item.startHour}</div>

                                    <div className="font-medium text-muted-foreground">Saída:</div>
                                    <div className="text-right font-semibold text-foreground">{item.endHour}</div>

                                    {/* Exibição das Horas Trabalhadas Efetivas (pausa já descontada pelo backend) */}
                                    <div className="font-medium text-muted-foreground">Horas Trabalhadas (Líquidas)</div>
                                    <div className="text-right font-semibold text-foreground">{item.hoursWork}</div>

                                    <div className="font-medium text-muted-foreground">Saldo:</div>
                                    <div className={`text-right font-bold ${item.balance.startsWith('-') ? 'text-destructive' : 'text-green-600'}`}>{item.balance}</div>
                                </div>

                                {/* Seção para exibir as pausas */}
                                {item.breaks && item.breaks.length > 0 && (
                                    <div className="pt-3 border-t border-primary/10">
                                        <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
                                            <Pause className="h-3 w-3" />
                                            Detalhes da Pausa
                                        </h4>
                                        <div className="space-y-2">
                                            {item.breaks.map((breakItem, breakIndex) => (
                                                <div key={breakIndex} className={`flex justify-between text-xs p-2 rounded-md ${breakItem.statusRecord === 'BREAK_IN_PROGRESS' ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-secondary/10'}`}>
                                                    <div className="flex items-center gap-1">
                                                        {breakItem.statusRecord === 'BREAK_IN_PROGRESS' ? (
                                                            <Pause className="h-3 w-3 text-yellow-600 animate-pulse" />
                                                        ) : (
                                                            <Play className="h-3 w-3 text-green-600" />
                                                        )}
                                                        <span className="font-medium text-muted-foreground">
                                                            {breakItem.startHour} - {breakItem.endHour || '...'}
                                                        </span>
                                                    </div>
                                                    <span className="font-bold text-foreground">
                                                        {breakItem.hoursBreak}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit className="h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};