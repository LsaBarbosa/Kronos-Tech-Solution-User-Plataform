// src/pages/AtualizarEmpresa.tsx

import { useState, useCallback } from "react";
// REMOVIDOS: useForm, zodResolver, z, useEffect, useCallback, useToast, API_BASE_URL, getGeolocationFromCEP, Interfaces de Dados (Movidos para hook/service/types)

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Building2, Save, MapPin, Mail, Loader2, Hash, LocateFixed } from "lucide-react";
import { useNavigate } from "react-router-dom";

// 💡 NOVO: Importa o hook customizado com toda a lógica e estado
import { useUpdateCompanyForm } from "@/hooks/useUpdateCompanyForm";

const AtualizarEmpresa = () => {
    // 💡 ESTADO DE UI (Sidebar) é o único estado mantido localmente
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
    const navigate = useNavigate();

    // 💡 HOOK: Desestrutura toda a lógica e estado
    const {
        form,
        companies,
        originalCompany,
        isSubmitting,
        isFetchingCompanies,
        isLoadingDetails,
        isGeocoding,
        onSubmit,
        formatCNPJ,
        cleanCEP,
        handleCancel
    } = useUpdateCompanyForm();

    // Acessa os valores do form para renderização condicional/status
    const currentLatitude = form.getValues('latitude');
    const currentLongitude = form.getValues('longitude');
    
    const isSaveDisabled = isSubmitting || isLoadingDetails || isGeocoding || !originalCompany;

    return (
      <div className="min-h-screen bg-background relative  overflow-hidden">
      {/* Animated Background and Header/Sidebar components */}
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
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.50), transparent)',
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
              animation: 'float-shapes 20s ease-in-out infinite'
            }}
          />
          <div
            className="absolute top-3/4 right-1/4 w-48 h-48 opacity-2"
            style={{
              background: 'linear-gradient(45deg, hsl(var(--black-primary) / 0.50), transparent)',
              borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
              animation: 'float-shapes 25s ease-in-out infinite reverse'
            }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-24 h-24 opacity-4"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.50), transparent)',
              borderRadius: '50%',
              animation: 'float-shapes 18s ease-in-out infinite 5s'
            }}
          />
        </div>
      </div>

    <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 💡 CORREÇÃO: Header usa 'toggleSidebar' */}
        <Header toggleSidebar={handleToggleSidebar} />

      <main className="pt-16 mobile-container py-4 sm:py-20 space-y-6 sm:space-y-8 relative z-10">
                    <div className="max-w-4xl mx-auto py-8">
                        <div className="flex items-center gap-4 mb-6">
                            <Button variant="ghost" size="icon" onClick={() => navigate("/empresa")} aria-label="Voltar">
                                <ArrowLeft className="h-6 w-6 text-foreground" />
                            </Button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                                    Atualizar Dados da Empresa
                                </h1>
                                <p className="text-muted-foreground">
                                    Selecione uma empresa para editar suas informações e status.
                                </p>
                            </div>
                        </div>

                        <Form {...form}>
                            {/* 💡 AÇÃO de submit aponta para a função do HOOK */}
                            <form onSubmit={onSubmit} className="space-y-8"> 
                                
                                {/* CARD DE SELEÇÃO */}
                                <Card className="border-l-4 border-l-secondary shadow-card">
                                    <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent">
                                        <div className="flex items-center gap-3">
                                            <Hash className="h-6 w-6 text-secondary" />
                                            <div>
                                                <CardTitle className="text-xl text-foreground">1. Selecionar Empresa</CardTitle>
                                                <CardDescription className="text-muted-foreground">
                                                    Escolha qual empresa você deseja editar
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="selectedCnpj"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-foreground font-medium">Empresa</FormLabel>
                                                    <Select 
                                                        onValueChange={field.onChange} 
                                                        value={field.value}
                                                        disabled={isFetchingCompanies || isLoadingDetails}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="border-border focus:border-primary focus:ring-primary/20">
                                                                <SelectValue placeholder={isFetchingCompanies ? "Carregando lista..." : "Selecione a empresa pelo nome"} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {companies.map((company) => (
                                                                <SelectItem key={company.id} value={company.cnpj}>
                                                                    {company.name} ({formatCNPJ(company.cnpj)})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {isLoadingDetails && (
                                            <div className="flex items-center gap-2 text-primary">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Carregando dados da empresa...</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* CARD DE EDIÇÃO */}
                                <Card className={`border-l-4 border-l-primary shadow-card ${!originalCompany || isLoadingDetails ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-6 w-6 text-primary" />
                                            <div>
                                                <CardTitle className="text-xl text-foreground">2. Editar Dados</CardTitle>
                                                <CardDescription className="text-muted-foreground">
                                                    Altere as informações da empresa selecionada.
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* CAMPO NOME */}
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-foreground font-medium">Nome da Empresa</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Nome da empresa" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* CNPJ (apenas visualização) */}
                                            <FormItem>
                                                <FormLabel className="text-foreground font-medium">CNPJ (Visualização)</FormLabel>
                                                <Input 
                                                    value={originalCompany ? formatCNPJ(originalCompany.cnpj) : ''} 
                                                    disabled 
                                                    placeholder="CNPJ"
                                                />
                                                <FormDescription>CNPJ não pode ser editado.</FormDescription>
                                            </FormItem>
                                            
                                            {/* CAMPO EMAIL */}
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem className="md:col-span-2">
                                                        <FormLabel className="text-foreground font-medium flex items-center gap-2">
                                                            <Mail className="h-4 w-4" /> Email Corporativo
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="contato@empresa.com" type="email" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* ENDEREÇO E STATUS */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                                            {/* CEP */}
                                            <FormField
                                                control={form.control}
                                                name="address.postalCode"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-foreground font-medium flex items-center gap-2">
                                                            <MapPin className="h-4 w-4" /> CEP
                                                        </FormLabel>
                                                        <FormControl>
                                                            {/* 💡 Uso de cleanCEP do hook/types para limpeza */}
                                                            <Input
                                                                placeholder="12345678"
                                                                maxLength={8}
                                                                {...field}
                                                                onChange={(e) => field.onChange(cleanCEP(e.target.value))}
                                                                value={field.value.replace(/[^0-9]/g, '')}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                        <FormDescription>Atualize o CEP (8 dígitos).</FormDescription>
                                                    </FormItem>
                                                )}
                                            />

                                            {/* NÚMERO */}
                                            <FormField
                                                control={form.control}
                                                name="address.number"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-foreground font-medium">Número</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="123" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            
                                            {/* STATUS GEOLOCALIZAÇÃO */}
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-foreground font-medium flex items-center gap-2">
                                                    <LocateFixed className="h-4 w-4" /> Status Geolocalização
                                                </FormLabel>
                                                {isGeocoding ? (
                                                    <div className="flex items-center gap-2 text-yellow-600">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span>Recalculando coordenadas...</span>
                                                    </div>
                                                ) : currentLatitude !== null && currentLongitude !== null ? (
                                                    <div className="text-green-600">
                                                        Coordenadas obtidas: **Lat: {currentLatitude}, Lon: {currentLongitude}**
                                                    </div>
                                                ) : (
                                                    <div className="text-red-600">
                                                        Atenção: Coordenadas pendentes ou inválidas.
                                                    </div>
                                                )}
                                                <FormDescription>As coordenadas são essenciais para a marcação de ponto.</FormDescription>
                                                {/* Campos ocultos para Lat/Lon */}
                                                <FormField control={form.control} name="latitude" render={() => <Input type="hidden" />} />
                                                <FormField control={form.control} name="longitude" render={() => <Input type="hidden" />} />
                                            </FormItem>
                                            
                                            {/* STATUS (ACTIVE) */}
                                            <FormField
                                                control={form.control}
                                                name="active"
                                                render={({ field }) => (
                                                    <FormItem className="md:col-span-2">
                                                        <FormLabel className="text-foreground font-medium">Status da Empresa</FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Selecione o status" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="true">Ativa</SelectItem>
                                                                <SelectItem value="false">Inativa</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        
                                        {/* Botões de Ação */}
                                        <div className="flex justify-end gap-4 pt-6 border-t border-border">
                                            <Button
                                                type="submit"
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-button"
                                                disabled={isSaveDisabled}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        Salvando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-5 w-5 mr-2" />
                                                        Salvar Alterações
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="border-border hover:bg-muted"
                                                onClick={handleCancel}
                                                disabled={isSubmitting}
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>
                        </Form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AtualizarEmpresa;
