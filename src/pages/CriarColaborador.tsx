import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, Shield, Loader2, MapPin, CheckCircle, Clock, CalendarDays } from "lucide-react";
import PageShell from "@/components/PageShell";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateCollaborator } from "@/hooks/useCreateCollaborator";

const CriarColaborador = () => {
    const {
        form,
        isSubmitting,
        sidebarOpen,
        handleToggleSidebar,
        stepCompleted,
        cpfAvailability,
        isCheckingCPF,
        usernameAvailability,
        isCheckingUsername,
        faceImageBase64,
        fileName,
        selectedScheduleType,
        maskCPF,
        maskPhone,
        maskCEP,
        maskCurrency,
        handleImageUpload,
        handleCheckCPF,
        handleCheckUsername,
        onSubmit,
        scheduleTypes,
        daysOfWeek,
    } = useCreateCollaborator();

    return (
      <PageShell
        sidebarOpen={sidebarOpen}
        toggleSidebar={handleToggleSidebar}
        mainClassName="relative z-10 min-h-screen flex items-center justify-center p-6 pt-20"
      >
        <div className="w-full max-w-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                            Criar Colaborador
                        </h1>
                        <p className="text-muted-foreground">
                            {stepCompleted ? "Vínculo de Acesso do Usuário" : "Dados Pessoais e Profissionais"}
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* CARD 1: DADOS DO COLABORADOR (PASSO 1) */}
                            <Card className={`border-l-4 border-l-primary shadow-2xl bg-card/80 backdrop-blur-sm ${stepCompleted ? 'opacity-50 pointer-events-none' : ''}`}>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <User className="h-6 w-6 text-primary" />
                                        <div>
                                            <CardTitle className="text-xl">Dados Pessoais</CardTitle>
                                            <CardDescription>
                                                Informações pessoais e profissionais do colaborador
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        <FormField control={form.control} name="nomeCompleto" render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-base font-semibold">Nome Completo</FormLabel>
                                                <FormControl><Input placeholder="Digite o nome completo" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>

                                        <FormField control={form.control} name="cpf" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">CPF</FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="000.000.000-00"
                                                            className="h-12 text-base"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(maskCPF(e.target.value));
                                                            }}
                                                            maxLength={14}
                                                        />
                                                    </FormControl>
                                                    <Button
                                                        type="button"
                                                        onClick={handleCheckCPF}
                                                        disabled={isCheckingCPF || field.value.replace(/\D/g, "").length < 11}
                                                        className="touch-target w-auto h-12"
                                                    >
                                                        {isCheckingCPF ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
                                                    </Button>
                                                </div>
                                                <FormMessage>
                                                    {cpfAvailability === "unavailable" && "CPF já existe."}
                                                    {cpfAvailability === "available" && <span className="text-green-500">CPF disponível.</span>}
                                                </FormMessage>
                                            </FormItem>
                                        )}/>

                                        <FormField control={form.control} name="cargo" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Cargo</FormLabel>
                                                <FormControl><Input placeholder="Ex: Padeiro, Atendente" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Email</FormLabel>
                                                <FormControl><Input type="email" placeholder="email@exemplo.com" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>

                                        <FormField control={form.control} name="salario" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Salário</FormLabel>
                                                <FormControl><Input placeholder="R$ 0,00" className="h-12 text-base" {...field} onChange={(e) => field.onChange(maskCurrency(e.target.value))} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>

                                        <FormField control={form.control} name="telefone" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Telefone</FormLabel>
                                                <FormControl><Input placeholder="(00) 00000-0000" className="h-12 text-base" {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} maxLength={15} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 pt-6">
                                        <FormField control={form.control} name="cep" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" /> CEP</FormLabel>
                                                <FormControl><Input placeholder="00000-000" className="h-12 text-base" {...field} onChange={(e) => field.onChange(maskCEP(e.target.value))} maxLength={9} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>

                                        <FormField control={form.control} name="numero" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Número</FormLabel>
                                                <FormControl><Input placeholder="Ex: 123, 45A" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        
                                        {/* NOVO CAMPO: HOME OFFICE */}
                                        <FormField control={form.control} name="homeOffice" render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-base font-semibold">Trabalho Remoto (Home Office)</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 text-base">
                                                            <SelectValue placeholder="O colaborador trabalha remotamente?" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="false">Não (Exige Geolocalização)</SelectItem>
                                                        <SelectItem value="true">Sim (Ignora Geolocalização)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        {/* FIM NOVO CAMPO */}
                                    </div>

{/* --- NOVA SEÇÃO: CONFIGURAÇÃO DE ESCALA --- */}
                                    <div className="md:col-span-2 mt-6 mb-4 border-t pt-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2 text-primary mb-4">
                                            <CalendarDays className="h-5 w-5" /> Configuração de Escala
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Tipo de Escala */}
                                            <FormField control={form.control} name="scheduleType" render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Tipo de Escala</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione a escala" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {scheduleTypes.map(type => (
                                                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>

                                            {/* Datas e Folgas Condicionais */}
                                            {(selectedScheduleType === "ROTATING_12X36" || selectedScheduleType === "ROTATING_24X72" || selectedScheduleType?.includes("SIX_BY_ONE")) && (
                                                <FormField control={form.control} name="scaleStartDate" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Data Início Ciclo</FormLabel>
                                                        <FormControl><Input type="date" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}/>
                                            )}

                                            {selectedScheduleType?.includes("SIX_BY_ONE") && (
                                                <FormField control={form.control} name="preferredDayOff" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Folga Fixa na Semana</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o dia" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {daysOfWeek.map(day => (
                                                                    <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}/>
                                            )}

                                            {selectedScheduleType === "SIX_BY_ONE_ONE_WEEKEND" && (
                                                <FormField control={form.control} name="weekendOffIndex" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Índice do Fim de Semana</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Qual semana?" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="1">1º Final de Semana</SelectItem>
                                                                <SelectItem value="2">2º Final de Semana</SelectItem>
                                                                <SelectItem value="3">3º Final de Semana</SelectItem>
                                                                <SelectItem value="4">4º Final de Semana</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}/>
                                            )}
                                        </div>

                                        {/* Dias Fixos (Tradicional) */}
                                        {selectedScheduleType === "TRADITIONAL_5X2" && (
                                            <FormField control={form.control} name="fixedWorkDays" render={() => (
                                                <FormItem className="mt-4">
                                                    <FormLabel className="mb-2 block">Dias de Trabalho (Fixo)</FormLabel>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                        {daysOfWeek.map((day) => (
                                                            <FormField key={day.value} control={form.control} name="fixedWorkDays" render={({ field }) => {
                                                                return (
                                                                    <FormItem key={day.value} className="flex items-center space-x-2 space-y-0">
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(day.value)}
                                                                                onCheckedChange={(checked) => {
                                                                                    return checked
                                                                                        ? field.onChange([...(field.value || []), day.value])
                                                                                        : field.onChange(field.value?.filter((value) => value !== day.value));
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal cursor-pointer text-sm">{day.label}</FormLabel>
                                                                    </FormItem>
                                                                );
                                                            }} />
                                                        ))}
                                                    </div>
                                                </FormItem>
                                            )}/>
                                        )}
                                    </div>
                                    
                                    <div className="md:col-span-2 mt-4 mb-2">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                                        <Clock className="h-5 w-5" /> Jornada de Trabalho
                                    </h3>
                                    <p className="text-sm text-muted-foreground">Defina o horário contratual para o cálculo do ponto.</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <FormField control={form.control} name="workStartTime" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Entrada</FormLabel>
                                            <FormControl>
                                                <Input type="time" className="h-12 text-base" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>

                                    <FormField control={form.control} name="breakStartTime" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Saída Intervalo</FormLabel>
                                            <FormControl>
                                                <Input type="time" className="h-12 text-base" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>

                                    <FormField control={form.control} name="breakEndTime" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Volta Intervalo</FormLabel>
                                            <FormControl>
                                                <Input type="time" className="h-12 text-base" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>

                                    <FormField control={form.control} name="workEndTime" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Saída</FormLabel>
                                            <FormControl>
                                                <Input type="time" className="h-12 text-base" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="faceImage">Imagem Facial (Opcional)</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input 
                                                id="faceImage"
                                                type="file" 
                                                accept="image/jpeg, image/png"
                                                onChange={handleImageUpload} 
                                                className="flex-1 hidden" // Esconde o input file padrão
                                            />
                                            <label htmlFor="faceImage" className="cursor-pointer flex-1 flex items-center justify-between p-2 h-10 border border-input rounded-md bg-background hover:border-primary/40 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary">
                                                <span className="truncate text-sm text-gray-500">
                                                    {fileName || "Clique para selecionar a imagem (.jpg, .png)"}
                                                </span>
                                                <span className="text-gray-400">📁</span>
                                            </label>
                                            {faceImageBase64 && <CheckCircle className="h-5 w-5 text-green-500" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Recomendado para uso do ponto facial.</p>
                                    </div>

                                    
                                    {/* Botão de Submissão do Passo 1 */}
                                    {!stepCompleted && (
                                        <Button
                                            type="submit"
                                            variant="default"
                                            size="lg"
                                            className="w-full h-14 text-lg font-semibold mt-6 shadow-md"
                                            // Botão agora depende APENAS do estado de submissão.
                                            disabled={isSubmitting} 
                                        >
                                            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : "Salvar Dados e Continuar"}
                                        </Button>
                                    )}
                                    {stepCompleted && (
                                        <div className="w-full flex items-center justify-center p-3 bg-green-500/10 text-green-600 rounded-lg mt-6 border border-green-500">
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                            <span>Passo 1 Concluído! Prossiga abaixo.</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* CARD 2: DADOS DO USUÁRIO (PASSO 2 - BLOQUEADO) */}
                            <Card className={`border-l-4 border-l-secondary shadow-2xl bg-card/80 backdrop-blur-sm ${!stepCompleted ? 'opacity-50 pointer-events-none' : ''}`}>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-6 w-6 text-secondary" />
                                        <div>
                                            <CardTitle className="text-xl">Credenciais de Acesso</CardTitle>
                                            <CardDescription>
                                                Defina o nome de usuário e a senha de acesso ao sistema
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        <FormField control={form.control} name="username" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold flex items-center">Nome de Usuário</FormLabel>
                                                <div className="flex space-x-2">
                                                    <FormControl><Input placeholder="Digite o nome de usuário" className="h-12 text-base" {...field} onChange={(e) => { field.onChange(e); }} /></FormControl>
                                                    
                                                    {/* BLOQUEIO DO BOTÃO DE VERIFICAR */}
                                                    <Button 
                                                        type="button" 
                                                        onClick={handleCheckUsername} 
                                                        disabled={isCheckingUsername || field.value.length < 4 || !stepCompleted} 
                                                        className="touch-target w-auto h-12"
                                                    >
                                                        {isCheckingUsername ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar'}
                                                    </Button>
                                                </div>
                                                <FormMessage>
                                                    {usernameAvailability === 'unavailable' && 'Nome de usuário já existe.'}
                                                    {usernameAvailability === 'available' && <span className="text-green-500">Nome de usuário disponível.</span>}
                                                </FormMessage>
                                            </FormItem>
                                        )}/>
                                        
                                      
                            

                                        <FormField control={form.control} name="role" render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-base font-semibold">Perfil</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!stepCompleted}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 text-base">
                                                            <SelectValue placeholder="Selecione o perfil" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="PARTNER">Colaborador (Acesso Padrão)</SelectItem>
                                                        <SelectItem value="MANAGER">Administrador (Acesso Total)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </div>

                                    {/* Botão de Submissão do Passo 2 (Final) */}
                                    {stepCompleted && (
                                        <div className="pt-6">
                                            <Button
                                                type="submit"
                                                variant="login"
                                                size="lg"
                                                className="w-full h-14 text-lg font-semibold shadow-button hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                                // Botão Final agora exige tanto a submissão, quanto a checagem de username
                                                disabled={isSubmitting || usernameAvailability !== 'available'}
                                            >
                                                {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : "Concluir Cadastro"}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                        </form>
                    </Form>
 
        </div>
      </PageShell>
    );
};

export default CriarColaborador;
