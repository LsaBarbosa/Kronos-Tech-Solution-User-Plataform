// src/components/ResultadosRelatorioDetalhado.tsx

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download, Edit, Coffee } from "lucide-react"; // Usando Coffee para Pausa
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

    // Lógica do PDF Detalhado (Atualizada para Pausa como registro principal e Estilizada)
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

            // 💡 ESTILO: NOVO ESQUEMA DE CORES PARA LINHAS
            const COLOR_MAIN_RECORD = [240, 255, 240]; // Honeydew (Trabalho - Linha Mais Clara)
            const COLOR_BREAK_RECORD = [230, 230, 250]; // Lavanda/Muito Claro (Pausa - Linha Suave)
            const COLOR_SEPARATOR = [200, 200, 200];       // Cinza (Separador)

            // Prepara os dados da tabela
            const tableBody: any[] = [];

            reportData.forEach(item => {
                const isBreak = item.statusRecord === 'IMPLICIT_BREAK';
                
                const startDate = parseDate(item.startWork);
                const endDate = parseDate(item.endWork);

                const formattedStart = `${startDate ? format(startDate, "dd/MM/yyyy") : 'N/A'}\n${item.startHour}`;
                const formattedEnd = `${endDate ? format(endDate, "dd/MM/yyyy") : 'N/A'}\n${item.endHour}`;

                const statusLabel = getTranslatedStatus(item.statusRecord);
                const fillColor = isBreak ? COLOR_BREAK_RECORD : COLOR_MAIN_RECORD;
                const fontStyle = isBreak ? 'italic' : 'normal';

                // Linha Única para Segmento de Trabalho OU Pausa
                const rowCells = [
                    { content: formattedStart, styles: { fillColor: fillColor } },
                    { content: formattedEnd, styles: { fillColor: fillColor } },
                    { content: item.hoursWork, styles: { fillColor: fillColor } },
                    { content: isBreak ? 'N/A' : item.balance, styles: { fillColor: fillColor } },
                    { content: statusLabel, styles: { fillColor: fillColor } }
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
                    fontSize: 11, // Aumentado
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

    return (
        <Card className="mt-8 border-2 border-primary/20 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>Resultados do Relatório Detalhado</CardTitle>
                    <CardDescription>{reportData.length} registro(s) detalhado(s) encontrado(s).</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportData.map((item, index) => {
                        const isBreak = item.statusRecord === 'IMPLICIT_BREAK';
                        
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
                                            {isBreak ? 'Duração da Pausa' : 'Horas Trabalhadas (Líquidas)'}
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
            </CardContent>
        </Card>
    );
};