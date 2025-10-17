// src/components/ResultadosRelatorioSimples.tsx

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download } from "lucide-react";
import { ReportDataSimple, isHoliday } from "@/utils/report-utils";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ResultadosSimplesProps {
    reportDataSimple: ReportDataSimple | null;
    referenceTime: string;
    selectedDates: Date[];
}

export const ResultadosRelatorioSimples: React.FC<ResultadosSimplesProps> = ({
    reportDataSimple,
    referenceTime,
    selectedDates,
}) => {
    const { toast } = useToast();

    // Lógica do PDF Simples (Migrada)
    const handleDownload = () => {
        if (!reportDataSimple || reportDataSimple.days.length === 0) {
            toast({
                title: "Erro",
                description: "Gere o relatório primeiro para poder fazer o download.",
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

            // Adicionando os totais antes da tabela
            doc.setFont("helvetica", "bold");
            doc.text(`Total de Horas Trabalhadas: ${reportDataSimple.totalHoursWorked}`, 20, yPosition);
            yPosition += 7;
            doc.text(`Saldo Total: ${reportDataSimple.totalBalance}`, 20, yPosition);
            yPosition += 10;
            doc.setFont("helvetica", "normal"); // Volta para normal

            const tableData = reportDataSimple.days.map(day => {
                const parts = day.startDate.split('/'); // DD/MM/YYYY
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
                    2: { // Coluna do saldo
                        cellWidth: 25,
                        halign: 'center'
                    }
                },
                didParseCell: function (data) {
                    // Colorir saldo positivo/negativo
                    if (data.column.index === 2 && data.section === 'body') {
                        const balance = data.cell.text[0];
                        if (balance && balance.startsWith('-')) {
                            data.cell.styles.textColor = [220, 53, 69]; // Vermelho para negativo
                            data.cell.styles.fontStyle = 'bold';
                        } else if (balance && !balance.startsWith('-') && balance !== '00:00') {
                            data.cell.styles.textColor = [40, 167, 69]; // Verde para positivo
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

    if (!reportDataSimple || reportDataSimple.days.length === 0) {
        return null;
    }

    return (
        <Card className="mt-8 border-2 border-primary/20 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>Resultados do Relatório Simples</CardTitle>
                    <CardDescription>Resumo de saldo para {reportDataSimple.days.length} dias.</CardDescription>
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
                <div className="mb-4 p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
                    <h3 className="text-xl font-bold mb-2 text-foreground">Totais do Período</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="font-medium text-muted-foreground">Total de Horas Trabalhadas:</div>
                        <div className="text-right font-bold text-foreground">{reportDataSimple.totalHoursWorked}</div>

                        <div className="font-medium text-muted-foreground">Saldo Total:</div>
                        <div className={`text-right font-bold ${reportDataSimple.totalBalance.startsWith('-') ? 'text-destructive' : 'text-green-600'}`}>
                            {reportDataSimple.totalBalance}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-primary/20 rounded-lg overflow-hidden border border-primary/20">
                        <thead className="bg-primary/10">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                                    Data
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-primary uppercase tracking-wider">
                                    Horas Trabalhadas
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-primary uppercase tracking-wider">
                                    Saldo do Dia
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-primary/10">
                            {reportDataSimple.days.map((day, index) => {
                                const parts = day.startDate.split('/');
                                const dayDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                                const isDayOffOrHoliday = isHoliday(dayDate) || day.totalHours === '00:00';

                                return (
                                    <tr key={index} className={`hover:bg-primary/5 transition-colors ${isDayOffOrHoliday ? 'bg-secondary/5 text-muted-foreground/80' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-primary/70" />
                                            {day.startDate}
                                            {isHoliday(dayDate) && <Badge variant="outline" className="text-destructive border-destructive/50 bg-destructive/5">Feriado</Badge>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">{day.totalHours}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${day.balance.startsWith('-') ? 'text-destructive' : 'text-green-600'}`}>
                                            {day.balance}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};