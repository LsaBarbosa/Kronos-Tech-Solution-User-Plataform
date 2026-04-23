import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, User, Shield, Loader2, MapPin, CheckCircle, Building2, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateManager } from "@/hooks/useCreateManager";

const CriarManager = () => {
    const navigate = useNavigate();
    const {
        form,
        isSubmitting,
        sidebarOpen,
        handleToggleSidebar,
        companies,
        isFetchingCompanies,
        savedEmployeeId,
        stepCompleted,
        usernameAvailability,
        isCheckingUsername,
        cpfAvailability,
        isCheckingCPF,
        selectedScheduleType,
        maskCPF,
        maskPhone,
        maskCEP,
        maskCurrency,
        handleCheckCPF,
        handleCheckUsername,
        onSubmit,
        scheduleTypes,
        daysOfWeek,
    } = useCreateManager();

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background (Mantido) */}
            <div className="fixed inset-0 z-0">
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        background: 'linear-gradient(-45deg, hsl(var(--black-primary)), hsl(var(--primary)), hsl(var(--black-primary)), hsl(var(--primary)))',
                        backgroundSize: '400% 400%',
                        animation: 'gradient-flow 15s ease-in-out infinite'
                    }}
                />

                <div className="absolute inset-0">
                    <div
                        className="absolute top-1/4 left-1/4 w-32 h-32 opacity-3"
                        style={{
                            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), transparent)',
                            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                            animation: 'float-shapes 20s ease-in-out infinite'
                        }}
                    />
                    <div
                        className="absolute top-3/4 right-1/4 w-48 h-48 opacity-2"
                        style={{
                            background: 'linear-gradient(45deg, hsl(var(--black-primary) / 0.05), transparent)',
                            borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
                            animation: 'float-shapes 25s ease-in-out infinite reverse'
                        }}
                    />
                    <div
                        className="absolute top-1/2 right-1/3 w-24 h-24 opacity-4"
                        style={{
                            background: 'radial-gradient(circle, hsl(var(--primary) / 0.08), transparent)',
                            borderRadius: '50%',
                            animation: 'float-shapes 18s ease-in-out infinite 5s'
                        }}
                    />
                </div>
            </div>
 <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={handleToggleSidebar} />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-6 pt-20">
                <div className="w-full max-w-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                            Criar Novo Administrador
                        </h1>
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

                                        {/* CAMPO: SELEÇÃO DE EMPRESA */}
                                        <FormField
                                            control={form.control}
                                            name="companyId"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                                                        <Building2 className="h-4 w-4" /> Empresa
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={isFetchingCompanies || companies.length === 0}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 text-base">
                                                                <SelectValue
                                                                    placeholder={isFetchingCompanies ? "Carregando empresas..." : "Selecione a empresa"}
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {companies.map((company) => (
                                                                <SelectItem key={company.companyId} value={company.companyId}>
                                                                    {company.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField control={form.control} name="nomeCompleto" render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-base font-semibold">Nome Completo</FormLabel>
                                                <FormControl><Input placeholder="Digite o nome completo" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        
                                        {/* CAMPO: CPF COM VERIFICAÇÃO */}
                                        <FormField control={form.control} name="cpf" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">CPF</FormLabel>
                                                <div className="flex space-x-2">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="000.000.000-00"
                                                            className="h-12 text-base"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(maskCPF(e.target.value));
                                                                setCpfAvailability(null); // Resetar status ao digitar
                                                            }}
                                                            maxLength={14}
                                                        />
                                                    </FormControl>
                                                    <Button
                                                        type="button"
                                                        onClick={handleCheckCPF}
                                                        disabled={isCheckingCPF || field.value.length < 14}
                                                        className="touch-target w-auto h-12"
                                                    >
                                                        {isCheckingCPF ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verificar'}
                                                    </Button>
                                                </div>
                                                <FormMessage>
                                                    {cpfAvailability === 'unavailable' && 'CPF já existe no sistema.'}
                                                    {cpfAvailability === 'available' && <span className="text-green-500">CPF disponível para cadastro.</span>}
                                                </FormMessage>
                                            </FormItem>
                                        )} />
                                        {/* FIM: CPF COM VERIFICAÇÃO */}

                                        <FormField control={form.control} name="cargo" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Cargo</FormLabel>
                                                <FormControl><Input placeholder="Ex: Padeiro, Atendente" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Email</FormLabel>
                                                <FormControl><Input type="email" placeholder="email@exemplo.com" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="salario" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Salário</FormLabel>
                                                <FormControl><Input placeholder="R$ 0,00" className="h-12 text-base" {...field} onChange={(e) => field.onChange(maskCurrency(e.target.value))} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="telefone" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Telefone</FormLabel>
                                                <FormControl><Input placeholder="(00) 00000-0000" className="h-12 text-base" {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} maxLength={15} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 pt-6">
                                        <FormField control={form.control} name="cep" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" /> CEP</FormLabel>
                                                <FormControl><Input placeholder="00000-000" className="h-12 text-base" {...field} onChange={(e) => field.onChange(maskCEP(e.target.value))} maxLength={9} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="numero" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Número</FormLabel>
                                                <FormControl><Input placeholder="Ex: 123, 45A" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
<div className="md:col-span-2 mt-6 mb-4 border-t pt-4">
                                            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary mb-4">
                                                <CalendarDays className="h-5 w-5" /> Configuração de Escala
                                            </h3>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField control={form.control} name="scheduleType" render={({ field }) => (
                                                    <FormItem className="md:col-span-2">
                                                        <FormLabel>Tipo de Escala</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {SCHEDULE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}/>

                                                {(selectedScheduleType === "ROTATING_12X36" || selectedScheduleType === "ROTATING_24X72" || selectedScheduleType?.includes("SIX_BY_ONE")) && (
                                                    <FormField control={form.control} name="scaleStartDate" render={({ field }) => (
                                                        <FormItem><FormLabel>Início Ciclo</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                                    )}/>
                                                )}

                                                {selectedScheduleType?.includes("SIX_BY_ONE") && (
                                                    <FormField control={form.control} name="preferredDayOff" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Folga Fixa</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Dia" /></SelectTrigger></FormControl>
                                                                <SelectContent>{DAYS_OF_WEEK.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}/>
                                                )}

                                                {selectedScheduleType === "SIX_BY_ONE_ONE_WEEKEND" && (
                                                    <FormField control={form.control} name="weekendOffIndex" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Índice FDS</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Qual?" /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="1">1º FDS</SelectItem>
                                                                    <SelectItem value="2">2º FDS</SelectItem>
                                                                    <SelectItem value="3">3º FDS</SelectItem>
                                                                    <SelectItem value="4">4º FDS</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}/>
                                                )}
                                            </div>

                                            {selectedScheduleType === "TRADITIONAL_5X2" && (
                                                <FormField control={form.control} name="fixedWorkDays" render={() => (
                                                    <FormItem className="mt-4">
                                                        <FormLabel className="mb-2 block">Dias de Trabalho</FormLabel>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                            {DAYS_OF_WEEK.map((day) => (
                                                                <FormField key={day.value} control={form.control} name="fixedWorkDays" render={({ field }) => (
                                                                    <FormItem key={day.value} className="flex items-center space-x-2 space-y-0">
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(day.value)}
                                                                                onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), day.value]) : field.onChange(field.value?.filter((v) => v !== day.value))}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal cursor-pointer text-sm">{day.label.substring(0, 3)}</FormLabel>
                                                                    </FormItem>
                                                                )} />
                                                            ))}
                                                        </div>
                                                    </FormItem>
                                                )}/>
                                            )}
                                        </div>
                                    {/* Botão de Submissão do Passo 1 */}
                                    {!stepCompleted && (
                                        <Button
                                            type="submit"
                                            variant="default"
                                            size="lg"
                                            className="w-full h-14 text-lg font-semibold mt-6 shadow-md"
                                            // Desabilita se estiver submetendo ou se ainda estiver buscando as empresas
                                            disabled={isSubmitting || isFetchingCompanies}
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
                                                    <FormControl><Input placeholder="Digite o nome de usuário" className="h-12 text-base" {...field} onChange={(e) => { field.onChange(e); setUsernameAvailability(null); }} /></FormControl>

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
                                        )} />

                                        <FormField control={form.control} name="password" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold">Senha inicial</FormLabel>
                                                <FormControl><Input type="password" placeholder="Opcional na criação inicial" className="h-12 text-base" {...field} /></FormControl>
                                                <FormMessage />
                                                <p className="text-xs text-muted-foreground">Se o backend não exigir senha neste fluxo, o campo pode permanecer vazio.</p>
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="role" render={() => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-base font-semibold">Perfil</FormLabel>
                                                <Select value="MANAGER" disabled>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 text-base">
                                                            <SelectValue placeholder="Administrador (MANAGER)" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="MANAGER">Administrador (Acesso Total)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                                <p className="text-xs text-muted-foreground">O papel é fixo nesta tela e sempre será criado como administrador.</p>
                                            </FormItem>
                                        )} />
                                    </div>

                                    {/* Botão de Submissão do Passo 2 (Final) */}
                                    {stepCompleted && (
                                        <div className="pt-6">
                                            <Button
                                                type="submit"
                                                variant="login"
                                                size="lg"
                                                className="w-full h-14 text-lg font-semibold shadow-button hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                                // Botão Final exige submissão e checagem de username.
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
                </div>
            </div>
        </div>
    );
};

export default CriarManager;
