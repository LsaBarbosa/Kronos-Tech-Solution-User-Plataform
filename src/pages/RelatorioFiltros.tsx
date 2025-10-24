import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// Importado CalendarCheck e CalendarX (para remover)
import { CalendarIcon, Search, Download, FileText, CalendarCheck, CalendarX } from "lucide-react"; 
// Imports atualizados do date-fns para a lógica de seleção/remoção
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay, isSameDay } from "date-fns"; 
import { ptBR } from "date-fns/locale";
import { Employee, statusOptions, allHolidays } from "@/utils/report-utils";

interface RelatorioFiltrosProps {
    selectedDates: Date[];
    setSelectedDates: React.Dispatch<React.SetStateAction<Date[]>>;
    referenceTime: string;
    setReferenceTime: React.Dispatch<React.SetStateAction<string>>;
    selectedEmployee: string;
    setSelectedEmployee: React.Dispatch<React.SetStateAction<string>>;
    employeeActive: string;
    setEmployeeActive: React.Dispatch<React.SetStateAction<string>>;
    isActive: boolean;
    setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
    status: string;
    setStatus: React.Dispatch<React.SetStateAction<string>>;
    reportType: "detailed" | "simple";
    setReportType: React.Dispatch<React.SetStateAction<"detailed" | "simple">>;
    employees: Employee[];
    isPartner: boolean;
    onSearch: () => void;
    onDownloadPDF: () => void;
    onDownloadCSV: () => void;
}

const isHoliday = (date: Date) => {
    return allHolidays.some(holiday =>
        holiday.toDateString() === date.toDateString()
    );
};

export const RelatorioFiltros: React.FC<RelatorioFiltrosProps> = ({
    selectedDates,
    setSelectedDates,
    referenceTime,
    setReferenceTime,
    selectedEmployee,
    setSelectedEmployee,
    employeeActive,
    setEmployeeActive,
    isActive,
    setIsActive,
    status,
    setStatus,
    reportType,
    setReportType,
    employees,
    isPartner,
    onSearch,
    onDownloadPDF,
    onDownloadCSV,
}) => {
    const [displayMonth, setDisplayMonth] = React.useState<Date | undefined>(startOfDay(new Date()));

    const handleDateSelect = (days: Date[] | undefined) => {
        setSelectedDates(days || []);
    };
    
    // 🚀 LÓGICA: Função para checar se o mês visível está totalmente selecionado
    const isMonthFullySelected = React.useMemo(() => {
        if (!displayMonth || selectedDates.length === 0) return false;

        const daysInMonth = eachDayOfInterval({ 
            start: startOfMonth(displayMonth), 
            end: endOfMonth(displayMonth) 
        });

        if (daysInMonth.length === 0) return false;

        // Verifica se cada dia do mês está incluído nas datas selecionadas
        return daysInMonth.every(dayOfMonth => 
            selectedDates.some(selectedDate => isSameDay(selectedDate, dayOfMonth))
        );
    }, [displayMonth, selectedDates]);

    // 🚀 FUNÇÃO DE ALTERNÂNCIA (Toggle)
    const handleSelectMonth = () => {
        if (!displayMonth) return;

        const daysInMonth = eachDayOfInterval({ 
            start: startOfMonth(displayMonth), 
            end: endOfMonth(displayMonth) 
        });

        if (isMonthFullySelected) {
            // Se o mês está selecionado, removemos as datas desse mês da seleção geral
            const newSelectedDates = selectedDates.filter(selectedDate => {
                return !daysInMonth.some(dayOfMonth => isSameDay(selectedDate, dayOfMonth));
            });
            setSelectedDates(newSelectedDates);
        } else {
            // Se o mês NÃO está totalmente selecionado, adicionamos as datas desse mês
            // Primeiro, removemos quaisquer datas do mês que JÁ estejam selecionadas (para evitar duplicatas)
            let newSelectedDates = selectedDates.filter(selectedDate => {
                return !daysInMonth.some(dayOfMonth => isSameDay(selectedDate, dayOfMonth));
            });
            
            // Depois, adicionamos todos os dias do mês
            newSelectedDates = [...newSelectedDates, ...daysInMonth];

            // Por fim, removemos duplicatas e ordenamos (opcional, mas recomendado)
            const uniqueDates = Array.from(new Set(newSelectedDates.map(d => d.getTime())))
                                    .map(time => new Date(time))
                                    .sort((a, b) => a.getTime() - b.getTime());
                                    
            setSelectedDates(uniqueDates);
        }
    };

    const handleReportTypeChange = (typeValue: "detailed" | "simple") => {
        if (reportType !== typeValue) {
            setReportType(typeValue);
            if (typeValue === "simple") {
                setStatus("");
            }
        }
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* CARD 1: SELEÇÃO DE DATAS */}
            <Card className="border-2 border-primary/20 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card via-card to-primary/5">
                <CardHeader className="border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <div className="p-2 rounded-lg bg-primary/10 shadow-inner">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                        </div>
                        Selecionar Datas
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Escolha múltiplas datas para o relatório
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <Card className="border-l-4 border-l-primary shadow-2xl shadow-primary/10 w-lg  p-4 transition-all duration-300 hover:shadow-primary/20">

                         {/* 🚀 BOTÃO ALTERNÁVEL: Selecionar ou Remover Mês Inteiro */}
                        <Button
                            onClick={handleSelectMonth}
                            variant="outline"
                            // 🚀 ALTERAÇÃO DE ESTILOS e ICONE CONFORME O ESTADO
                            className={`w-full mb-4 font-semibold border-2 transition-all duration-200 relative overflow-hidden shadow-md hover:shadow-lg transform hover:scale-[1.005] ${
                                isMonthFullySelected
                                    ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/60 hover:shadow-destructive/20"
                                    : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/40 hover:shadow-primary/20"
                            }`}
                            disabled={!displayMonth}
                        >
                            {isMonthFullySelected ? (
                                <CalendarX className="mr-2 h-4 w-4 relative z-10" />
                            ) : (
                                <CalendarCheck className="mr-2 h-4 w-4 relative z-10" />
                            )}
                            <span className="relative z-10">
                                {isMonthFullySelected ? "Remover" : "Selecionar"} {displayMonth ? format(displayMonth, "MMMM 'de' yyyy", { locale: ptBR }) : "Mês Inteiro"}
                            </span>
                        </Button>
                        {/* CALENDÁRIO COM ESTILIZAÇÃO APERFEIÇOADA */}
                     <Calendar
                            mode="multiple"
                            selected={selectedDates}
                            onSelect={handleDateSelect}
                            month={displayMonth} 
                            onMonthChange={setDisplayMonth} 
                            className="w-full pointer-events-auto"
                            locale={ptBR}
                            // Estilos base (classNames) ajustados
                            classNames={{
                                // Classes simplificadas e dependentes do calendar.tsx para dimensões/tamanho do texto
                                day: "font-normal aria-selected:opacity-100 relative rounded-lg transition-all duration-200",
                                day_selected: "bg-transparent text-foreground rounded-lg ",
                                // Estilo para 'Hoje' (Reforçado)
                                day_today: " font-normal aria-selected:opacity-100 border-2 border-primary/50 hover:bg-primary/20 transition-colors duration-150 rounded-lg",
                                day_outside: "text-muted-foreground opacity-50",
                                day_disabled: "text-muted-foreground opacity-50",
                                day_range_middle: "aria-selected:bg-primary/20 aria-selected:text-primary",
                                day_hidden: "invisible",
                            }}
                            modifiers={{
                                selected: selectedDates,
                                holiday: allHolidays,
                            }}
                            modifiersClassNames={{
                                // ESTILO FINAL OTIMIZADO: Adiciona borda de 4px para maior destaque responsivo
                                selected: "bg-primary text-primary-foreground font-extrabold shadow-lg shadow-primary/30 rounded-lg hover:bg-primary/90 border-4 border-primary/50",
                                // Feriados (Circular Elegante com Sombra)
                                holiday:
                                    " text-destructive font-normal aria-selected:opacity-100 rounded-lg border-2 border-destructive/50 bg-destructive/10 hover:bg-destructive/20 transition-all duration-300 ease-in-out shadow-lg shadow-destructive/10",
                            }}
                        />
                        {/* LEGENDA DE DATAS */}
                        <div className="grid grid-cols-1 gap-3 ml-4 mb-4 text-xs pt-4 border-t border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-lg bg-primary shadow-sm shadow-primary/30"></div>
                                <span className="text-muted-foreground">Data selecionada</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full bg-destructive/5 border-2 border-destructive/30 shadow-sm shadow-destructive/10"></div>
                                <span className="text-destructive font-semibold">Feriado nacional</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-lg border-2 border-primary/50 bg-primary/10"></div>
                                <span className="text-muted-foreground">Hoje</span>
                            </div>
                        </div>
                    </Card>

                    {/* DICAS DE USO */}
                    <div className="mt-4 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/20 backdrop-blur-sm shadow-inner shadow-primary/5">
                        <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                            Dicas e Regras
                        </h4>
                        <ul className="list-disc list-inside text-xs space-y-2 text-muted-foreground ml-2">
                            <li>O status <span className="text-primary hover:text-primary/80   font-semibold transition-colors duration-150">FOLGA</span> é atribuído no dia que não houver registro.</li>
                            <li>Em caso de <span className="text-primary hover:text-primary/80   font-semibold transition-colors duration-150">FALTA</span>, navegue até a página <a href="status-do-registro" className="text-primary hover:text-primary/80 underline font-semibold transition-colors duration-150">Status do registro</a> para realizar a mudança.</li>
                            <li> <span className="text-primary hover:text-primary/80   font-semibold transition-colors duration-150">Relatório Simples:</span> Retorna data, hora de entrada e saída, horas trabalhadas e saldo do dia.</li>
                            <li> <span className="text-primary hover:text-primary/80   font-semibold transition-colors duration-150">Relatório Detalhado:</span> Retorna todos os registros e status do dia.</li>
                            <li>Clique no registro para solicitar alteração (data e hora).</li>
                        </ul>
                    </div>

                    {selectedDates.length > 0 && (
                        <div className="mt-4 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border-2 border-primary/30 backdrop-blur-sm shadow-md shadow-primary/10">
                            <h4 className="text-sm font-extrabold text-foreground mb-3 flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></div>
                                Datas Selecionadas ({selectedDates.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedDates.map((date, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 border border-primary/30"
                                    >
                                        {format(date, "dd/MM/yyyy", { locale: ptBR })}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* CARD 2: PARÂMETROS DO RELATÓRIO */}
            <Card className="border-2 border-primary/30 shadow-2xl hover:shadow-primary/40 transition-all duration-300 bg-gradient-to-br from-card via-card/95 to-primary/10 backdrop-blur-sm">
                <CardHeader className="border-b border-primary/30 bg-gradient-to-r from-primary/15 via-primary/8 to-secondary/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50"></div>
                    <CardTitle className="text-foreground flex items-center gap-3 relative z-10">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 shadow-md">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/80 animate-pulse shadow-sm"></div>
                        </div>
                        <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent font-extrabold">
                            Parâmetros do Relatório
                        </span>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground relative z-10 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary/50"></div>
                        Configure os filtros para o relatório
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6 relative">
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-full blur-xl"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-secondary to-secondary/60 rounded-full blur-lg"></div>
                    </div>

                    {/* SEÇÃO TIPO DE RELATÓRIO */}
                    <div className="space-y-3 relative border-b border-primary/20 pb-4">
                        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            Tipo de Relatório
                        </Label>
                        <div className="p-3 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 flex flex-wrap gap-4 shadow-inner">
                            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                                <Checkbox
                                    id="report-detailed"
                                    checked={reportType === "detailed"}
                                    onCheckedChange={() => handleReportTypeChange("detailed")}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/50"
                                />
                                <Label htmlFor="report-detailed" className="text-sm cursor-pointer font-medium">Detalhado</Label>
                            </div>
                            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                                <Checkbox
                                    id="report-simple"
                                    checked={reportType === "simple"}
                                    onCheckedChange={() => handleReportTypeChange("simple")}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/50"
                                />
                                <Label htmlFor="report-simple" className="text-sm cursor-pointer font-medium">Simples</Label>
                            </div>
                        </div>
                    </div>

                    {/* CARGA HORÁRIA DIÁRIA */}
                    <div className="space-y-3 relative">
                        <Label htmlFor="reference-time" className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            Carga Horária diária
                        </Label>
                        <div className="relative group">
                            <Input
                                id="reference-time"
                                type="time"
                                value={referenceTime}
                                onChange={(e) => setReferenceTime(e.target.value)}
                                className="focus:border-primary focus:ring-2 focus:ring-primary/40 border-primary/30 bg-background hover:border-primary/50 transition-all duration-200 shadow-sm"
                            />
                            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-transparent group-hover:border-primary/30"></div>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-muted-foreground/50"></div>
                            Horário de referência para cálculo do relatório
                        </p>
                    </div>

                    {/* FUNCIONÁRIO (SELECT) */}
                    {!isPartner && (
                        <div className="space-y-3 relative">
                            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                Funcionário
                            </Label>
                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={isPartner}>
                                <SelectTrigger className="focus:border-primary focus:ring-2 focus:ring-primary/40 border-primary/30 bg-background hover:border-primary/50 transition-all duration-200 shadow-sm">
                                    <SelectValue placeholder="Selecione um funcionário" />
                                </SelectTrigger>
                                <SelectContent className="border-primary/20">
                                    {employees.map((employee) => (
                                        <SelectItem
                                            key={employee.employeeId}
                                            value={employee.employeeId}
                                            className="hover:bg-primary/10 focus:bg-primary/10 transition-colors duration-150"
                                        >
                                            {employee.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* STATUS DO FUNCIONÁRIO (RADIO GROUP) */}
                    {!isPartner && (
                        <div className="space-y-3 relative">
                            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                Status do Funcionário
                            </Label>
                            <RadioGroup
                                value={employeeActive}
                                onValueChange={setEmployeeActive}
                                className="p-3 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 flex flex-wrap gap-3 sm:gap-6 shadow-inner"
                            >
                                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors cursor-pointer">
                                    <RadioGroupItem value="" id="emp-todos" className="data-[state=checked]:border-primary data-[state=checked]:text-primary border-primary/50" />
                                    <Label htmlFor="emp-todos" className="text-sm cursor-pointer font-medium">Todos</Label>
                                </div>
                                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors cursor-pointer">
                                    <RadioGroupItem value="active" id="emp-active" className="data-[state=checked]:border-primary data-[state=checked]:text-primary border-primary/50" />
                                    <Label htmlFor="emp-active" className="text-sm cursor-pointer font-medium">Ativo</Label>
                                </div>
                                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors cursor-pointer">
                                    <RadioGroupItem value="inactive" id="emp-inactive" className="data-[state=checked]:border-primary data-[state=checked]:text-primary border-primary/50" />
                                    <Label htmlFor="emp-inactive" className="text-sm cursor-pointer font-medium">Inativo</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    {/* REGISTRO APROVADO/REPROVADO */}
                    <div className="space-y-3 relative">
                        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            Registro Aprovado/Reprovado
                        </Label>
                        <RadioGroup
                            value={isActive ? "ativo" : "inativo"}
                            onValueChange={(value) => setIsActive(value === "ativo")}
                            className="p-3 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 flex flex-wrap gap-3 sm:gap-6 shadow-inner"
                        >
                            <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors cursor-pointer">
                                <RadioGroupItem value="ativo" id="reg-ativo" className="data-[state=checked]:border-primary data-[state=checked]:text-primary border-primary/50" />
                                <Label htmlFor="reg-ativo" className="text-sm cursor-pointer font-medium">Aprovado</Label>
                            </div>
                            <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors cursor-pointer">
                                <RadioGroupItem value="inativo" id="reg-inativo" className="data-[state=checked]:border-primary data-[state=checked]:text-primary border-primary/50" />
                                <Label htmlFor="reg-inativo" className="text-sm cursor-pointer font-medium">Reprovado</Label>
                            </div>
                        </RadioGroup>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-muted-foreground/50"></div>
                            Incluir registros ativos ou inativos no relatório
                        </p>
                    </div>

                    {/* STATUS DE REGISTRO (SELECT) */}
                    <div className="space-y-3 relative">
                        <Label className={`text-sm font-semibold text-foreground flex items-center gap-2 ${reportType === "simple" ? 'opacity-50' : ''}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            Status
                        </Label>
                        <Select value={status} onValueChange={setStatus} disabled={reportType === "simple"}>
                            <SelectTrigger className={`focus:border-primary focus:ring-2 focus:ring-primary/40 border-primary/30 bg-background hover:border-primary/50 transition-all duration-200 shadow-sm ${reportType === "simple" ? 'opacity-50 pointer-events-none' : ''}`}>
                                <SelectValue placeholder="Todos os status" />
                            </SelectTrigger>
                            <SelectContent className="border-primary/20">
                                {statusOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="hover:bg-primary/10 focus:bg-primary/10 hover:text-foreground focus:text-foreground transition-colors duration-150"
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-muted-foreground/50"></div>
                            Status dos registros a serem filtrados
                        </p>
                    </div>

                    {/* BOTÕES DE AÇÃO */}
                    <div className="space-y-3 pt-6 border-t border-primary/20 relative">
                        <div className="absolute -top-px left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

                        {/* BOTÃO BUSCAR (PRIMARY) */}
                        <Button
                            onClick={onSearch}
                            size="lg"
                            className="group w-full font-bold text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl hover:shadow-primary/40 transition-all duration-300 relative overflow-hidden transform hover:scale-[1.005] hover:translate-y-[-1px]"
                            disabled={selectedDates.length === 0}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Search className="mr-2 h-5 w-5 relative z-10" />
                            <span className="relative z-10">Buscar</span>
                        </Button>

                        {/* BOTÃO DOWNLOAD PDF (DESTRUCTIVE/ALERTA) */}
                        <Button
                            onClick={onDownloadPDF}
                            size="lg"
                            variant="outline"
                            disabled={selectedDates.length === 0}
                            className="group w-full font-semibold border-2 border-red-600/40 bg-gradient-to-r from-red-600/10 to-red-600/5 text-red-600 hover:bg-red-600/15 transition-all duration-200 relative overflow-hidden shadow-md hover:shadow-lg hover:shadow-red-600/20 transform hover:scale-[1.005]"
                        >
                            <Download className="mr-2 h-4 w-4 relative z-10" />
                            <span className="relative z-10">Download PDF</span>
                        </Button>

                        {/* BOTÃO DOWNLOAD CSV (SUCCESS/CONFIRMAÇÃO) */}
                        <Button
                            onClick={onDownloadCSV}
                            size="lg"
                            variant="outline"
                            disabled={selectedDates.length === 0}
                            className="group w-full font-semibold border-2 border-green-600/40 bg-gradient-to-r from-green-600/10 to-green-600/5 text-green-600 hover:bg-green-600/15 transition-all duration-200 relative overflow-hidden shadow-md hover:shadow-lg hover:shadow-green-600/20 transform hover:scale-[1.005]"
                        >
                            <FileText className="mr-2 h-4 w-4 relative z-10" />
                            <span className="relative z-10">Download CSV</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};