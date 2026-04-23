import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Building2, Loader2, MapPin, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateCompany } from "@/hooks/useCreateCompany";

const CriarEmpresa = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const navigate = useNavigate();

  const {
    form,
    isSubmitting,
    isGeocoding,
    cnpjAvailability,
    isCheckingCNPJ,
    handleCheckCNPJ,
    onSubmit,
    handleReset,
  } = useCreateCompany();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background:
              "linear-gradient(-45deg, hsl(var(--black-primary)), hsl(var(--primary)), hsl(var(--black-primary)), hsl(var(--primary)))",
            backgroundSize: "400% 400%",
            animation: "gradient-flow 15s ease-in-out infinite",
          }}
        />
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/4 w-32 h-32 opacity-3"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.50), transparent)",
              borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
              animation: "float-shapes 20s ease-in-out infinite",
            }}
          />
          <div
            className="absolute top-3/4 right-1/4 w-48 h-48 opacity-2"
            style={{
              background: "linear-gradient(45deg, hsl(var(--black-primary) / 0.50), transparent)",
              borderRadius: "70% 30% 30% 70% / 70% 70% 30% 30%",
              animation: "float-shapes 25s ease-in-out infinite reverse",
            }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-24 h-24 opacity-4"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.50), transparent)",
              borderRadius: "50%",
              animation: "float-shapes 18s ease-in-out infinite 5s",
            }}
          />
        </div>
      </div>

      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={handleToggleSidebar} />

        <main className="pt-16 mobile-container py-4 sm:py-20 space-y-6 sm:space-y-8 relative z-10">
          <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Voltar">
                <ArrowLeft className="h-6 w-6 text-foreground" />
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                  Criar Empresa
                </h1>
                <p className="text-muted-foreground">
                  Cadastre as informações básicas da nova empresa.
                </p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card className="border-l-4 border-l-primary shadow-card">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-foreground">Dados da Empresa</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          Informações principais da empresa
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium">Nome da Empresa</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Digite o nome da empresa"
                                className="border-border focus:border-primary focus:ring-primary/20"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Razão social ou nome fantasia da empresa</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cnpj"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium">CNPJ</FormLabel>
                            <div className="flex space-x-2">
                              <FormControl>
                                <Input
                                  placeholder="12345678000123"
                                  maxLength={14}
                                  className="border-border focus:border-primary focus:ring-primary/20"
                                  onChange={(e) => {
                                    field.onChange(e.target.value.replace(/\D/g, ""));
                                    form.setValue("location.latitude", undefined);
                                    form.setValue("location.longitude", undefined);
                                  }}
                                  value={field.value}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                onClick={() => handleCheckCNPJ(field.value)}
                                disabled={isCheckingCNPJ || field.value.length !== 14}
                                className="touch-target w-auto"
                              >
                                {isCheckingCNPJ ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
                              </Button>
                            </div>
                            <FormDescription>CNPJ da empresa (apenas números)</FormDescription>
                            <FormMessage>
                              {cnpjAvailability === "unavailable" && (
                                <span className="text-red-500">CNPJ já existe no sistema.</span>
                              )}
                              {cnpjAvailability === "available" && (
                                <span className="text-green-500">CNPJ disponível para cadastro.</span>
                              )}
                            </FormMessage>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Email Corporativo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="contato@empresa.com"
                              type="email"
                              className="border-border focus:border-primary focus:ring-primary/20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Email principal da empresa</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="address.postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium">CEP</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="12345678"
                                maxLength={8}
                                className="border-border focus:border-primary focus:ring-primary/20"
                                onChange={(e) => {
                                  field.onChange(e.target.value.replace(/\D/g, "").slice(0, 8));
                                  form.setValue("location.latitude", undefined);
                                  form.setValue("location.longitude", undefined);
                                }}
                                value={field.value}
                              />
                            </FormControl>
                            <FormDescription>CEP do endereço (apenas números)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium">Número</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123"
                                className="border-border focus:border-primary focus:ring-primary/20"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  form.setValue("location.latitude", undefined);
                                  form.setValue("location.longitude", undefined);
                                }}
                              />
                            </FormControl>
                            <FormDescription>Número do endereço</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="location.latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Latitude
                              {isGeocoding && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                disabled
                                placeholder={isGeocoding ? "Buscando..." : "Preenchimento automático"}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location.longitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Longitude
                              {isGeocoding && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                disabled
                                placeholder={isGeocoding ? "Buscando..." : "Preenchimento automático"}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormDescription className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      As coordenadas de latitude e longitude são preenchidas automaticamente ao informar o CEP e o Número.
                    </FormDescription>
                  </CardContent>
                </Card>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-button"
                    disabled={isSubmitting || isGeocoding || cnpjAvailability !== "available"}
                  >
                    {isSubmitting ? "Criando Empresa..." : isGeocoding ? "Aguarde Geocodificação..." : <span className="inline-flex items-center gap-2"><Save className="h-4 w-4" /> Criar Empresa</span>}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border hover:bg-muted"
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    Limpar
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CriarEmpresa;
