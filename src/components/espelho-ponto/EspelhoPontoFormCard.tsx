import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, Calendar as CalendarIcon, Download, FileText, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState } from "@/components/states";
import { cn } from "@/lib/utils";
import type { EspelhoPontoViewModel } from "./useEspelhoPontoViewModel";

interface EspelhoPontoFormCardProps {
  viewModel: EspelhoPontoViewModel;
  variant: "desktop" | "mobile";
}

export const EspelhoPontoFormCard = ({ viewModel, variant }: EspelhoPontoFormCardProps) => {
  const {
    date,
    setDate,
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    isLoading,
    isLoadingEmployees,
    canSelectEmployee,
    handleDownload,
  } = viewModel;

  const isCompact = variant === "mobile";

  return (
    <Card className="border border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.08)]">
      <CardHeader className={cn("space-y-2", isCompact ? "p-4" : "p-6")}>
        <CardTitle className="flex items-center gap-2 text-lg text-[#102A43] sm:text-xl">
          <FileText className="h-5 w-5 text-[#1F4E5F]" />
          Emissão do espelho de ponto
        </CardTitle>
        <CardDescription className="text-sm text-[#627D98]">
          Defina o mês de referência e, se houver permissão, o colaborador. O sistema gera automaticamente do dia 01 ao último dia do mês.
        </CardDescription>
      </CardHeader>

      <CardContent className={cn("space-y-5", isCompact ? "p-4 pt-0" : "p-6 pt-0")}>
        <Alert className="border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">
          <AlertCircle className="h-4 w-4 text-[#1D4ED8]" />
          <AlertTitle className="text-sm font-semibold text-[#1D4ED8]">
            Atenção ao período
          </AlertTitle>
          <AlertDescription className="text-sm text-[#1E40AF]">
            Selecione qualquer dia dentro do mês desejado — o intervalo é calculado automaticamente
            do dia 01 ao último dia do mês.
          </AlertDescription>
        </Alert>

        <div className="grid gap-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#102A43]">Mês de referência</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-12 w-full justify-start gap-2 rounded-2xl border-[#D8E2EC] bg-white text-left text-base font-medium text-[#102A43] hover:bg-[#F1F5F9]",
                    !date && "text-[#94A3B8]"
                  )}
                >
                  <CalendarIcon className="h-5 w-5 text-[#1F4E5F]" />
                  {date ? format(date, "MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto rounded-2xl border-[#D8E2EC] p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ptBR}
                  disabled={(value) => value > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {canSelectEmployee && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#102A43]">Colaborador</Label>
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
                disabled={isLoadingEmployees || isLoading}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl border-[#D8E2EC] bg-white text-left text-[#102A43]">
                  <SelectValue
                    placeholder={
                      isLoadingEmployees
                        ? "Carregando colaboradores..."
                        : "Selecione um colaborador ou deixe em branco para gerar o próprio espelho"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.employeeId} value={employee.employeeId}>
                      {employee.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs leading-5 text-[#627D98]">
                Opcional para gestores e CTOs. Se nenhum colaborador for selecionado, o seu próprio
                espelho será gerado.
              </p>
              {isLoadingEmployees && (
                <LoadingState
                  title="Carregando colaboradores..."
                  className="items-start py-2 text-left"
                />
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter
        className={cn(
          "flex flex-col gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] sm:flex-row sm:justify-end",
          isCompact ? "p-4" : "p-6"
        )}
      >
        <Button
          size="lg"
          onClick={handleDownload}
          disabled={isLoading || !date}
          className="w-full gap-2 rounded-2xl bg-[#102A43] text-white shadow-[0_10px_24px_rgba(16,42,67,0.18)] transition-all hover:bg-[#1F4E5F] sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Baixar PDF
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EspelhoPontoFormCard;
