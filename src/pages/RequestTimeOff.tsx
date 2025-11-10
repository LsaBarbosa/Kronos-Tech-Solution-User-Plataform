// src/pages/RequestTimeOff.tsx

import { z } from "zod";
import { CalendarIcon, Clock, FileUp, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
} from "../components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { cn } from "../lib/utils";
import { useRequestTimeOff } from "../hooks/useRequestTimeOff";
import { Separator } from "../components/ui/separator";
import { useCallback, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

// Definição de tipo para a função que fecha o Popover
type SetOpen = React.Dispatch<React.SetStateAction<boolean>>;

// Schema de validação (para integração com react-hook-form e exibição de erros)
const formSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  startHour: z.string().nonempty(),
  endHour: z.string().nonempty(),
  managerId: z.string().nonempty(),
  document: z.any(),
});

export function RequestTimeOff() {
  const {
    formState,
    managers,
    isLoading,
    errors,
    handleChange,
    handleSubmit,
  } = useRequestTimeOff();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Estados para controlar a abertura/fechamento dos Popovers do calendário
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      startDate: formState.startDate,
      endDate: formState.endDate,
      startHour: formState.startHour,
      endHour: formState.endHour,
      managerId: formState.managerId,
      document: formState.document,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    handleChange("document", file);
  };

  /**
   * Função para lidar com a mudança de data no calendário.
   * Agora recebe a função setter do Popover para fechá-lo automaticamente.
   */
  const handleDateChange = (
    field: "startDate" | "endDate",
    date: Date | undefined,
    setOpen: SetOpen
  ) => {
    form.setValue(field, date);
    handleChange(field, date);
    if (date) {
      setOpen(false); // <--- FECHA O CALENDÁRIO AUTOMATICAMENTE
    }
  };

  const clearFile = () => {
    handleChange("document", null);
    const fileInput = document.getElementById("document-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ""; // Limpa visualmente o input de arquivo
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={handleToggleSidebar} />

        <main className="flex-1 mobile-container py-4 pt-20 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                Solicitar Abono </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Preencha o período exato e anexe um comprovante (opcional) para abono de horas.
              </p>
            </div>
            <Card className="border-l-4 border-l-primary shadow-card">
              <Card className="border-primary/20 shadow-lg">
                <CardContent>
                  <Form {...form}>
                    <form
                      // Usa o handleSubmit do hook customizado para a submissão final
                      onSubmit={handleSubmit}
                      className="grid gap-6 mt-6 md:grid-cols-2"
                    >
                      {/* Datas */}
                      <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={() => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
                                Data de Início*
                              </FormLabel>
                              <Popover
                                open={isStartDatePickerOpen} // <--- CONTROLADO PELO ESTADO
                                onOpenChange={setIsStartDatePickerOpen} // <--- ATUALIZA O ESTADO
                              >
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full justify-start text-left font-normal ",
                                        !formState.startDate && "text-muted-foreground",
                                        errors.startDate && "border-destructive" // Erro do hook
                                      )}
                                    >
                                      {formState.startDate ? (
                                        format(formState.startDate, "PPP", {
                                          locale: ptBR,
                                        })
                                      ) : (
                                        <span>Selecione a data</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    locale={ptBR}
                                    selected={formState.startDate}
                                    onSelect={(date) =>
                                      handleDateChange("startDate", date, setIsStartDatePickerOpen) // <--- PASSA O SETTER
                                    }
                                    // disabled={(date) => isBefore(date, new Date())} <--- REMOVIDO PARA PERMITIR DATAS PASSADAS
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="text-destructive">
                                {errors.startDate}
                              </FormMessage>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endDate"
                          render={() => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
                                Data de Fim*
                              </FormLabel>
                              <Popover
                                open={isEndDatePickerOpen} // <--- CONTROLADO PELO ESTADO
                                onOpenChange={setIsEndDatePickerOpen} // <--- ATUALIZA O ESTADO
                              >
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !formState.endDate && "text-muted-foreground",
                                        errors.endDate && "border-destructive"
                                      )}
                                    >
                                      {formState.endDate ? (
                                        format(formState.endDate, "PPP", {
                                          locale: ptBR,
                                        })
                                      ) : (
                                        <span>Selecione a data</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    locale={ptBR}
                                    selected={formState.endDate}
                                    onSelect={(date) =>
                                      handleDateChange("endDate", date, setIsEndDatePickerOpen) // <--- PASSA O SETTER
                                    }
                                    // disabled={(date) => isBefore(date, new Date())} <--- REMOVIDO PARA PERMITIR DATAS PASSADAS
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="text-destructive">
                                {errors.endDate}
                              </FormMessage>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Horários */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startHour"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-primary" />
                                Hora de Início*
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="time"
                                  className={cn(
                                    errors.startHour && "border-destructive"
                                  )}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleChange("startHour", e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage className="text-destructive">
                                {errors.startHour}
                              </FormMessage>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endHour"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-primary" />
                                Hora de Fim*
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="time"
                                  className={cn(
                                    errors.endHour && "border-destructive"
                                  )}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleChange("endHour", e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage className="text-destructive">
                                {errors.endHour}
                              </FormMessage>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Seleção do Manager */}
                      <FormField
                        control={form.control}
                        name="managerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-primary" />
                              Gestor Aprovador*
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleChange("managerId", value);
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    errors.managerId && "border-destructive"
                                  )}
                                >
                                  <SelectValue placeholder="Selecione o Gestor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {managers.map((manager) => (
                                  <SelectItem
                                    key={manager.userId}
                                    value={manager.userId}
                                    className="flex flex-col items-start"
                                  >
                                    <span className="font-medium">
                                      {manager.username}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              O gestor da sua empresa que fará a aprovação.
                            </FormDescription>
                            <FormMessage className="text-destructive">
                              {errors.managerId}
                            </FormMessage>
                          </FormItem>
                        )}
                      />

                      <div className="md:col-span-2">
                        <Separator className="my-4 bg-muted" />
                      </div>

                      {/* Upload de Documento (Opcional) */}
                      <div className="md:col-span-2">
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <FileUp className="w-4 h-4 mr-2 text-primary" />
                            Comprovante (Atestado/Documento)
                          </FormLabel>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="document-upload"
                              type="file"
                              className="flex-1"
                              onChange={handleFileChange}
                              accept="application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                            />
                            {formState.document && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearFile}
                                className="text-red-500 hover:text-red-600"
                                title="Remover arquivo"
                              >
                                Remover
                              </Button>
                            )}
                          </div>
                          <FormDescription>
                            Formatos aceitos: PDF, JPEG, PNG, DOCX, DOC.
                          </FormDescription>
                          {formState.document && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Arquivo selecionado:{" "}
                              <span className="font-semibold text-primary">
                                {formState.document.name}
                              </span>
                            </p>
                          )}
                        </FormItem>
                      </div>

                      {/* Botão de Envio */}
                      <div className="md:col-span-2 flex justify-end mt-4">
                        <Button
                          type="submit"
                          className="w-full md:w-auto"
                          disabled={isLoading || !formState.startDate || !formState.endDate || !formState.managerId}
                        >
                          {isLoading ? "Enviando..." : "Solicitar Abono"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default RequestTimeOff;