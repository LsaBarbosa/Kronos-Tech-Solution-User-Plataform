// src/components/RelatorioFiltros.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, Search, Download, FileText } from "lucide-react";
import { format } from "date-fns";
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

    const handleDateSelect = (days: Date[] | undefined) => {
        setSelectedDates(days || []);
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
            <Card className="border-2 border-primary/20 shadow-card bg-gradient-to-br from-card via-card to-primary/5">
                <CardHeader className="border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                        </div>
                        Selecionar Datas
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Escolha múltiplas datas para o relatório
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <Card className="border-l-4 border-l-primary shadow-card w-fit max-w-lg mx-auto">
                        <Calendar 
                            mode="multiple"
                            selected={selectedDates}
                            onSelect={handleDateSelect}
                            className="w-full pointer-events-auto"
                            classNames={{
                                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-calendar-selected-hover/20 hover:text-calendar-selected transition-colors duration-200 relative", day_selected: "bg-calendar-selected text-calendar-selected-foreground hover:bg-calendar-selected-hover hover:text-calendar-selected-foreground focus:bg-calendar-selected focus:text-calendar-selected-foreground font-semibold shadow-sm z-10",
                                day_today: "bg-transparent text-foreground font-bold border-2 border-primary hover:bg-primary/10",
                                day_outside: "text-muted-foreground opacity-50 aria-selected:bg-calendar-selected/50 aria-selected:text-calendar-selected-foreground aria-selected:opacity-80",
                                day_disabled: "text-muted-foreground opacity-50",
                                day_range_middle: "aria-selected:bg-calendar-selected/20 aria-selected:text-calendar-selected",
                                day_hidden: "invisible",
                            }}
                            modifiers={{
                                selected: selectedDates,
                                holiday: allHolidays,
                            }}
                            modifiersClassNames={{
                                selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground z-10",
                                holiday: "bg-destructive/10 text-destructive font-semibold border border-destructive/20 hover:bg-destructive/20 hover:text-destructive !text-destructive",
                            }}
                        />
                        <div className="grid grid-cols-1 gap-3 ml-4 mb-4 text-xs">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-primary/80 shadow-sm"></div>
                                <span className="text-muted-foreground">Data selecionada</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded bg-destructive/10 border-2 border-destructive/30"></div>
                                <span className="text-destructive font-semibold">Feriado nacional</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded border-2 border-primary/50 bg-transparent"></div>
                                <span className="text-muted-foreground">Hoje</span>
                            </div>
                        </div>
                    </Card>
                    <div className="mt-4 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-primary/20 backdrop-blur-sm">
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                            💡 Dica de uso:
                        </h4>
                        <p className="text-xs text-muted-foreground mb-4">
                            1. Clique em qualquer data no calendário para selecioná-la.
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                            2. O status FOLGA é atribuido automaticamente no dia que não houver registro.<br />
                            * Em caso de FALTA, navegue até a pagina  <a
                                href="status-do-registro"
                                className="text-primary hover:text-primary/80 underline font-semibold transition-colors duration-150 ml-1"
                            >
                                Status do registro
                            </a>  para realizar a mudança
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                            3. Relatorio Simples: <br/>
                            * Retorna a data, as horas trabalhadas e o saldo do dia selecionado.
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                            4. Relatorio Detalhado:<br />
                            * Retorna todos os registros realizados na data selecionada.<br />
                            * Retorna o status do registros.<br />
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                            5. Ao cliclar no registro é possivel solicitar a alteração (data e hora).
                        </p>
                    </div>

                    {selectedDates.length > 0 && (
                        <div className="mt-4 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/30 backdrop-blur-sm">
                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                Datas Selecionadas ({selectedDates.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedDates.map((date, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-sm border border-primary/20"
                                    >
                                        {format(date, "dd/MM/yyyy", { locale: ptBR })}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-2 border-primary/30 shadow-xl bg-gradient-to-br from-card via-card/95 to-primary/10 backdrop-blur-sm">
                <CardHeader className="border-b border-primary/30 bg-gradient-to-r from-primary/15 via-primary/8 to-secondary/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50"></div>
                    <CardTitle className="text-foreground flex items-center gap-3 relative z-10">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/80 animate-pulse shadow-sm"></div>
                        </div>
                        <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent font-semibold">
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
                        <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full blur-sm"></div>
                        <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-br from-secondary to-secondary/60 rounded-full blur-sm"></div>
                    </div>

                    {/* SEÇÃO DE TIPO DE RELATÓRIO */}
                    <div className="space-y-3 relative border-b border-primary/20 pb-4">
                        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            Tipo de Relatório
                        </Label>
                        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 flex flex-wrap gap-3 sm:gap-6">
                            {/* Checkbox Detalhado */}
                            <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                                <Checkbox
                                    id="report-detailed"
                                    checked={reportType === "detailed"}
                                    onCheckedChange={() => handleReportTypeChange("detailed")}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/50"
                                />
                                <Label htmlFor="report-detailed" className="text-sm cursor-pointer font-medium">
                                    Detalhado
                                </Label>
                            </div>

                            {/* Checkbox Simples */}
                            <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                                <Checkbox
                                    id="report-simple"
                                    checked={reportType === "simple"}
                                    onCheckedChange={() => handleReportTypeChange("simple")}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/50"
                                />
                                <Label htmlFor="report-simple" className="text-sm cursor-pointer font-medium">
                                    Simples
                                </Label>
                            </div>
                        </div>
                    </div>
                    {/* FIM: SEÇÃO DE TIPO DE RELATÓRIO */}

                    <div className="space-y-3 relative">
                        <Label htmlFor="reference-time" className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            Carga Horária diária
                        </Label>
                        <div className="relative">
                            <Input
                                id="reference-time"
                                type="time"
                                value={referenceTime}
                                onChange={(e) => setReferenceTime(e.target.value)}
                                className="focus:border-primary focus:ring-2 focus:ring-primary/20 border-primary/20 bg-gradient-to-r from-background to-primary/5 transition-all duration-200"
                            />
                            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-muted-foreground/50"></div>
                            Horário de referência para cálculo do relatório
                        </p>
                    </div>

                    {/* Alteração 1: Esconder Funcionário se for PARTNER */}
                    {!isPartner && (
                        <div className="space-y-3 relative">
                            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                Funcionário
                            </Label>
                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={isPartner}>
                                <SelectTrigger className="focus:border-primary focus:ring-2 focus:ring-primary/20 border-primary/20 bg-gradient-to-r from-background to-primary/5 hover:bg-primary/10 transition-all duration-200">
                                    <SelectValue placeholder="Selecione um funcionário" />
                                </SelectTrigger>
                                <SelectContent className="border-primary/20">
                                    {employees.map((employee) => (
                                        <SelectItem
                                            key={employee.employeeId}
                                            value={employee.employeeId}
                                            className="hover:bg-primary/10 focus:bg-primary/10"
                                        >
                                            {employee.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* NOVO: SEÇÃO DE STATUS DO FUNCIONÁRIO COM RADIO GROUP */}
                    {!isPartner && (
                        <div className="space-y-3 relative">
                            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                Status do Funcionário
                            </Label>
                            <RadioGroup
                                value={employeeActive}
                                onValueChange={setEmployeeActive}
                                // AJUSTE RESPONSIVO
                                className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 flex flex-wrap gap-3 sm:gap-6"
                            >
                                {/* Radio Button TODOS */}
                                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                                    <RadioGroupItem
                                        value=""
                                        id="emp-todos"
                                        className="data-[state=checked]:border-primary data-[state=checked]:text-primary border-primary/50"
                                    />
                                    <Label htmlFor="emp-todos" className="text-sm cursor-pointer font-medium">
                                        Todos
                                    </Label>
                                </div>

                                {/* Radio Button ATIVO */}
                                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                                    <RadioGroupItem
                                        value="active"
                                        id="emp-active"
                                        className="data-[state=checked]:border-primary data-[state=checked]:text-primary border-primary/50"
                                    />
                                    <Label htmlFor="emp-active" className="text-sm cursor-pointer font-medium">
                                        Ativo
                                    </Label>
                                </div>

                                {/* Radio Button INATIVO */}
                                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                                    <RadioGroupItem
                                        value="inactive"
                                        id="emp-inactive"
                                        className="data-[state=checked]:border-primary data-[state=checked]:text-primary border-primary/50"
                                    />
                                    <Label htmlFor="emp-inactive" className="text-sm cursor-pointer font-medium">
                                        Inativo
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}
                    {/* FIM: SEÇÃO DE STATUS DO FUNCIONÁRIO COM RADIO GROUP */}

                    {/* SEÇÃO DE REGISTRO ATIVO/INATIVO COMO RADIO GROUP */}
                    <div className="space-y-3 relative">
                        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            Registro Aprovado/Reprovado
                        </Label>
                        <RadioGroup
                            value={isActive ? "ativo" : "inativo"}
                            onValueChange={(value) => setIsActive(value === "ativo")}
                            // AJUSTE RESPONSIVO
                            className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 flex flex-wrap gap-3 sm:gap-6"
                        >
                            {/* Radio Button ATIVO */}
                            <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                                <RadioGroupItem
                                    value="ativo"
                                    id="reg-ativo"
                                    className="data-[state=checked]:border-primary data-[state=checked]:text-primary border-primary/50"
                                />
                                <Label htmlFor="reg-ativo" className="text-sm cursor-pointer font-medium">
                                    Aprovado
                                </Label>
                            </div>

                            {/* Radio Button INATIVO */}
                            <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                                <RadioGroupItem
                                    value="inativo"
                                    id="reg-inativo"
                                    className="data-[state=checked]:border-primary data-[state=checked]:text-primary border-primary/50"
                                />
                                <Label htmlFor="reg-inativo" className="text-sm cursor-pointer font-medium">
                                    Reprovado
                                </Label>
                            </div>
                        </RadioGroup>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-muted-foreground/50"></div>
                            Incluir registros ativos ou inativos no relatório
                        </p>
                    </div>
                    {/* FIM: SEÇÃO DE REGISTRO ATIVO/INATIVO COMO RADIO GROUP */}

                    <div className="space-y-3 relative">
                        <Label className={`text-sm font-semibold text-foreground flex items-center gap-2 ${reportType === "simple" ? 'opacity-50' : ''}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                            Status
                        </Label>
                        <Select value={status} onValueChange={setStatus} disabled={reportType === "simple"}>
                            <SelectTrigger className={`focus:border-primary focus:ring-2 focus:ring-primary/20 border-primary/20 bg-gradient-to-r from-background to-primary/5 hover:bg-primary/10 transition-all duration-200 ${reportType === "simple" ? 'opacity-50' : ''}`}>
                                <SelectValue placeholder="Todos os status" />
                            </SelectTrigger>
                            <SelectContent className="border-primary/20">
                                {statusOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="hover:bg-primary/10 focus:bg-primary/10 hover:text-foreground focus:text-foreground"
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

                    <div className="space-y-3 pt-6 border-t border-primary/20 relative">
                        <div className="absolute -top-px left-1/2 transform -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>

                        <Button
                            onClick={onSearch}
                            size="lg"
                            className="group w-full font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all duration-200 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                            <Search className="mr-2 h-4 w-4" />
                            <span className="relative z-10">Buscar</span>
                        </Button>

                        {/* BOTÃO DE DOWNLOAD PDF */}
                        <Button
                            onClick={onDownloadPDF}
                            size="lg"
                            variant="outline"
                            disabled={selectedDates.length === 0}
                            className="w-full font-semibold border-2 border-red-600/30 bg-gradient-to-r from-red-600/10 to-red-600/5 text-red-600 hover:bg-red-600/10 transition-all duration-200 relative overflow-hidden"
                        >
                            <Download className="mr-2 h-4 w-4 relative z-10" />
                            <span className="relative z-10">Download PDF</span>
                        </Button>

                        {/* BOTÃO DE DOWNLOAD CSV */}
                        <Button
                            onClick={onDownloadCSV}
                            size="lg"
                            variant="outline"
                            disabled={selectedDates.length === 0}
                            className="w-full font-semibold border-2 border-green-600/30 bg-gradient-to-r from-green-600/10 to-green-600/5 text-green-600 hover:bg-green-600/10 transition-all duration-200 relative overflow-hidden"
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