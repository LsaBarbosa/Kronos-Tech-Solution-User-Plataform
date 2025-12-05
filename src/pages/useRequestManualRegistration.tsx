// src/pages/RequestTimeOff.tsx

import { z } from "zod";
import { CalendarIcon, Clock, FileUp, User, AlertCircle, X, Loader2, HelpCircle, Info } from "lucide-react";
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
import { useRequestManualRegistration } from "../hooks/useManualRegister";
import { Separator } from "../components/ui/separator";
import { useCallback, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { ALLOWED_ACCEPT_STRING, MAX_UPLOAD_SIZE_BYTES, ALLOWED_MIME_TYPES } from "../types/document"; 
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Importe o RadioGroup

const blobToFile = (blob: Blob, fileName: string): File => {
    return new File([blob], fileName, { type: blob.type, lastModified: Date.now() });
};

const compressImage = (file: File, quality: number = 0.7): Promise<File> => {
    return new Promise((resolve) => {
        if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type.startsWith('image/svg')) {
            return resolve(file);
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const img = document.createElement('img');
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0, img.width, img.height);
                canvas.toBlob((blob) => {
                    if (blob && blob.size < file.size) { 
                        const compressedFile = blobToFile(blob, file.name);
                        resolve(compressedFile);
                    } else {
                        resolve(file);
                    }
                }, 'image/jpeg', quality);
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
};

type SetOpen = React.Dispatch<React.SetStateAction<boolean>>;

const formSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  startHour: z.string().nonempty(),
  endHour: z.string().nonempty(),
  managerId: z.string().nonempty(),
  document: z.any(),
  requestType: z.enum(['TIME_OFF_REQUEST', 'FORGOTTEN_REGISTRATION']), // Validação do Zod
});

export function RequestManualRegistration() {
  const {
    formState,
    managers,
    isLoading,
    errors,
    handleChange,
    handleSubmit,
  } = useRequestManualRegistration();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null); 
  const [isProcessingFile, setIsProcessingFile] = useState(false); 

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
      requestType: formState.requestType, // Valor inicial
    },
  });
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files ? e.target.files[0] : null;
    setFileError(null);
    handleChange("document", null); 

    if (!file) return;
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isAllowedType = ALLOWED_MIME_TYPES.some(type => fileExtension && type.includes(fileExtension));
    
    if (!fileExtension || !isAllowedType) {
        setFileError("Tipo de arquivo não permitido.");
        e.target.value = "";
        return;
    }

    if (file.type.startsWith('image/')) {
        setIsProcessingFile(true);
        file = await compressImage(file);
        setIsProcessingFile(false); 
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        const maxSizeMB = (MAX_UPLOAD_SIZE_BYTES / 1024 / 1024).toFixed(0);
        setFileError(`Arquivo muito grande. O limite é de ${maxSizeMB}MB.`);
        e.target.value = "";
        return;
    }
    
    handleChange("document", file);
  };

  const handleDateChange = (
    field: "startDate" | "endDate",
    date: Date | undefined,
    setOpen: SetOpen
  ) => {
    form.setValue(field, date);
    handleChange(field, date);
    if (date) {
      setOpen(false);
    }
  };

  const clearFile = () => {
    setFileError(null);
    handleChange("document", null);
    const fileInput = document.getElementById("document-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const isUploadDisabled = isLoading || isProcessingFile;
  const selectedFile = formState.document as File | null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background animations */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(-45deg, hsl(var(--black-primary)), hsl(var(--primary)), hsl(var(--black-primary)), hsl(var(--primary)))', backgroundSize: '400% 400%', animation: 'gradient-flow 15s ease-in-out infinite' }} />
      </div>

      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={handleToggleSidebar} />

        <main className="pt-16 mobile-container py-4 sm:py-20 space-y-6 sm:space-y-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                Solicitação de Ajuste
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Solicite abono de horas ou informe esquecimento de registro de ponto.
              </p>
            </div>
            <Card className="border-l-4 border-l-primary shadow-card">
              <Card className="border-primary/20 shadow-lg">
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={handleSubmit} className="grid gap-6 mt-6 md:grid-cols-2">
                      
                      {/* SELETOR DE TIPO DE SOLICITAÇÃO */}
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="requestType"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-semibold flex items-center">
                                <HelpCircle className="w-4 h-4 mr-2 text-primary" />
                                Tipo de Solicitação
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={(val: any) => {
                                    field.onChange(val);
                                    handleChange("requestType", val);
                                  }}
                                  defaultValue={field.value}
                                  className="flex flex-col sm:flex-row gap-4"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0 border p-4 rounded-md w-full cursor-pointer hover:bg-muted/50 transition-colors">
                                    <FormControl>
                                      <RadioGroupItem value="TIME_OFF_REQUEST" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer w-full">
                                      Abono de Horas
                                      <FormDescription>
                                        Para justificativas médicas ou folgas acordadas.
                                      </FormDescription>
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0 border p-4 rounded-md w-full cursor-pointer hover:bg-muted/50 transition-colors">
                                    <FormControl>
                                      <RadioGroupItem value="FORGOTTEN_REGISTRATION" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer w-full">
                                      Esquecimento de Ponto
                                      <FormDescription>
                                        Caso tenha esquecido de bater o ponto.
                                      </FormDescription>
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Separator className="my-2 bg-muted" />
                      </div>

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
                              <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full justify-start text-left font-normal ",
                                        !formState.startDate && "text-muted-foreground",
                                        errors.startDate && "border-destructive"
                                      )}
                                    >
                                      {formState.startDate ? (
                                        format(formState.startDate, "dd MMM yyyy", { locale: ptBR })
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
                                    onSelect={(date) => handleDateChange("startDate", date, setIsStartDatePickerOpen)}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="text-destructive">{errors.startDate}</FormMessage>
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
                              <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen}>
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
                                        format(formState.endDate, "dd MMM yyyy", { locale: ptBR })
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
                                    onSelect={(date) => handleDateChange("endDate", date, setIsEndDatePickerOpen)}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="text-destructive">{errors.endDate}</FormMessage>
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
                                  className={cn(errors.startHour && "border-destructive")}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleChange("startHour", e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage className="text-destructive">{errors.startHour}</FormMessage>
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
                                  className={cn(errors.endHour && "border-destructive")}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleChange("endHour", e.target.value);
                                  }}
                                /> 
                              </FormControl> 
                            
                              <FormMessage className="text-destructive">{errors.endHour}</FormMessage>
                            
                            </FormItem>
                            
                          )}
                        />
                        
                      </div>

                      {/* Manager */}
                      <FormField
                        control={form.control}
                        name="managerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-primary" />
                              Gestor Aprovador
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleChange("managerId", value);
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className={cn(errors.managerId && "border-destructive")}>
                                  <SelectValue placeholder="Selecione o Gestor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {managers.map((manager) => (
                                  <SelectItem key={manager.userId} value={manager.userId} className="flex flex-col items-start">
                                    <span className="font-medium">{manager.username}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              O gestor da sua empresa que fará a aprovação.
                            </FormDescription>
                            <FormMessage className="text-destructive">{errors.managerId}</FormMessage>
                          </FormItem>
                        )}
                      />
                            {/* Dica de Preenchimento de Horas - Tema Dinâmico */}
<div className="md:col-span-2 mt-2">
  {/* bg-primary/5: Fundo com 5% da cor do tema
      border-primary/20: Borda suave com 20% da cor do tema
  */}
  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
    <div className="flex items-start gap-3">
      {/* Ícone usando a cor principal do tema */}
      <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
      
      <div className="space-y-2">
        {/* Título com a cor principal do tema */}
        <h4 className="text-sm font-semibold text-primary">
          Como preencher as horas corretamente?
        </h4>
        
        {/* Texto descritivo em muted-foreground para garantir leitura em qualquer cor (ex: amarelo) */}
        <p className="text-sm text-muted-foreground">
          Defina as horas efetivamente trabalhadas, <strong>desconsiderando</strong> o tempo de intervalo.
        </p>

        {/* Bloco de Exemplo: Fundo um pouco mais forte (10%) */}
        <div className="mt-2 rounded bg-primary/10 p-2 text-xs text-muted-foreground">
          <p className="font-medium mb-1 text-primary">Exemplo Prático:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              Horário real: 09:00 às 18:00 (com 1h de almoço) = 8h totais.
            </li>
            <li>
              <span className="font-bold text-primary underline decoration-primary/50">Como preencher:</span> 09:00 às 17:00 (Totalizando exatas 8h líquidas).
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
                      <div className="md:col-span-2">
                        <Separator className="my-4 bg-muted" />
                      </div>

                      {/* Upload */}
                      <div className="md:col-span-2">
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <FileUp className="w-4 h-4 mr-2 text-primary" />
                            Comprovante (Opcional)
                          </FormLabel>
                          <Input
                            id="document-upload"
                            type="file"
                            className="flex-1"
                            onChange={handleFileChange}
                            accept={ALLOWED_ACCEPT_STRING}
                            disabled={isUploadDisabled}
                          />
                          {fileError && (
                            <p className="text-sm text-destructive flex items-center gap-2 mt-2">
                              <AlertCircle className="h-4 w-4" /> {fileError}
                            </p>
                          )}
                          {isProcessingFile && (
                              <p className="text-sm text-primary flex items-center gap-2 mt-2">
                                  <Loader2 className="h-4 w-4 animate-spin" /> Otimizando imagem, aguarde...
                              </p>
                          )}
                          {selectedFile && !fileError && (
                            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/50 mt-3">
                              <div className="flex items-center space-x-3">
                                <FileUp className="w-5 h-5 text-primary" />
                                <div>
                                  <p className="font-medium text-foreground text-sm line-clamp-1">{selectedFile.name}</p>
                                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <Button type="button" variant="ghost" size="icon" onClick={clearFile} className="text-destructive hover:bg-destructive/10" disabled={isUploadDisabled}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          <FormDescription className="mt-4">
                            Formatos aceitos: PDF, JPEG, PNG, DOCX, DOC. <br />
                            Limite de {(MAX_UPLOAD_SIZE_BYTES / 1024 / 1024).toFixed(0)}MB.
                          </FormDescription>
                        </FormItem>
                      </div>

                      {/* Submit */}
                      <div className="md:col-span-2 flex justify-end mt-4">
                        <Button
                          type="submit"
                          className="w-full md:w-auto"
                          disabled={isUploadDisabled || !!fileError || !formState.startDate || !formState.endDate || !formState.managerId} 
                        >
                          {isLoading ? (
                            <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando... </>
                          ) : "Enviar Solicitação"}
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

export default RequestManualRegistration;