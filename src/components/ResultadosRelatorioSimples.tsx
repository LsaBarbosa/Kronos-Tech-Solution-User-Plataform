// src/components/ResultadosRelatorioSimples.tsx

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";
import { isHoliday } from "@/utils/report-utils";

// 💡 NOVO: Estendendo as interfaces para incluir as novas horas
interface ReportDayExtended {
    startDate: string;
    totalHours: string;
    balance: string;
    startHour?: string; // Novo Campo
    endHour?: string;   // Novo Campo
}

interface ReportDataSimpleExtended {
    totalHoursWorked: string;
    totalBalance: string;
    days: ReportDayExtended[];
    employeeName?: string;
    companyName?: string;
}

interface ResultadosSimplesProps {
    reportDataSimple: ReportDataSimpleExtended | null;
}


export const ResultadosRelatorioSimples: React.FC<ResultadosSimplesProps> = ({
    reportDataSimple,
}) => {
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
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-primary uppercase tracking-wider">
                                    Entrada
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-primary uppercase tracking-wider">
                                    Saída
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-primary uppercase tracking-wider">
                                    Horas Trabalhadas
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-primary uppercase tracking-wider">
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
                                            {isHoliday(dayDate) && <Badge variant="outline" className="text-destructive   border-destructive/50 bg-destructive/5">Feriado</Badge>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">{day.startHour || 'N/A'}</td> 
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">{day.endHour || 'N/A'}</td>   
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">{day.totalHours}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${day.balance.startsWith('-') ? 'text-destructive' : 'text-green-600'}`}>
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
