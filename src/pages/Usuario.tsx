// src/pages/Usuario.tsx

import { useState, useCallback } from "react"; 
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
// 💡 Ícones que indicam funcionalidade e estado
import { User, Lock, Eye, EyeOff, Save, X, Pencil, Briefcase, Phone, MapPin, AtSign, CircleUserRound, Loader2, CircleCheck, CircleX, Home, DollarSign, IdCardIcon, User2Icon, LucideIdCard, IdCard, SquareUser } from "lucide-react";
// 💡 Componentes de UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
// 💡 Utilitários de data e helpers
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// 💡 Importa o hook customizado com toda a lógica de estado, API e actions
import { useUser } from "@/hooks/useUser"; 
// 💡 Importa funções utilitárias (como mapeamento de cargo)
import { getRoleDisplayName } from "@/types/dashboard"; 

const Usuario = () => {
  // 💡 ESTADO DE UI (Sidebar e Senha) é o único estado mantido localmente
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  // 💡 HOOK: Desestrutura toda a lógica de dados, API e handlers
  const {
    userAccountData, // Dados da conta (username, role, active)
    userData,        // Dados detalhados do funcionário
    isLoading,
    isEditingEmail,
    isEditingPhone,
    showPasswordFields,
    isSavingPassword,
    newEmail,         // Estado de edição do email (gerenciado pelo hook)
    newPhone,         // Estado de edição do telefone (gerenciado pelo hook)
    passwordData,     // Formulário de senha (gerenciado pelo hook)
    toggleEditingEmail,
    toggleEditingPhone,
    handleEmailChange, // Handler de mudança de input do email
    handlePhoneChange, // Handler de mudança de input do telefone
    handlePasswordChange, // Handler de mudança de input da senha
    handleSaveEmail,      // Chamada de API para salvar email
    handleSavePhone,      // Chamada de API para salvar telefone
    handleChangePassword, // Chamada de API para salvar senha
    togglePasswordFields,
  } = useUser();
  
  // Variáveis auxiliares para a apresentação (Mantida, mas é o isLoading que indica o salvamento)
  const isUpdatingContact = isEditingEmail || isEditingPhone;
  
 

  // --- Funções de Apresentação Puras ---
  
  const SkeletonCard = () => (
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
  
  const formatDateString = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
    } catch {
        return dateString;
    }
  };
  
  const formatPhoneDisplay = (phone: string | undefined) => {
    if (!phone) return "N/A";
    const cleaned = ('' + phone).replace(/\D/g, '').slice(0, 11);
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const formatAddressDisplay = () => {
    const address = userData?.address;

    if (!address) {
      return "Endereço não informado";
    }

    const streetAndNumber = [address.street, address.number].filter(Boolean).join(", ");
    const cityAndState = [address.city, address.state].filter(Boolean).join("/");

    return [streetAndNumber, cityAndState].filter(Boolean).join(" - ") || "Endereço não informado";
  };
  
  // Validação local para desabilitar o botão de senha
  const isPasswordChangeDisabled = (
    !passwordData.newPassword || 
    passwordData.newPassword !== passwordData.confirmPassword || 
    !passwordData.currentPassword
  );

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
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-foreground page-title">Meu Perfil</h1>
            
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* CARD DE DADOS PESSOAIS */}
              <Card className="shadow-lg border-l-4 border-l-primary text-primary">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl flex  items-center gap-2">
                    <CircleUserRound className="h-5 w-5 text-primary" /> Dados Pessoais
                  </CardTitle>
                  <CardDescription>Informações de perfil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <SkeletonCard />
                  ) : (
                    <div className="space-y-4">
                      
                      {/* Full Name Field */}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Nome Completo</Label>
                         <div className="mt-1 p-3 bg-muted rounded-xl flex items-center gap-2 border border-border/50 shadow-inner">
                          <User2Icon className="h-4 w-4 text-primary flex-shrink-0" />
                          <p className="text-foreground font-semibold">{userData?.fullName}</p>
                        </div>
                      </div>

                      {/* CPF Field */}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">CPF</Label>
                         <div className="mt-1 p-3 bg-muted rounded-xl flex items-center gap-2 border border-border/50 shadow-inner">
                          <IdCard className="h-4 w-4 text-primary flex-shrink-0" />
                          <p className="text-foreground">{userData?.maskedCpf}</p>
                        </div>
                      </div>

                      <Separator />

                      {/* Job Position Field */}
                      <div>
                        <Label htmlFor="jobPosition" className="text-sm font-medium text-muted-foreground">
                          Cargo
                        </Label>
                        <div className="mt-1 p-3 bg-muted rounded-lg flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                          <p className="text-foreground">{userData?.jobPosition}</p>
                        </div>
                      </div>
     {/* Salary Field (Adicionado ícone de dinheiro) */}
                      <div className="data-field-group">
                        <Label htmlFor="salary" className="text-sm font-medium text-muted-foreground">
                          Remuneração
                        </Label>
                        <div className="mt-1 p-3 bg-muted rounded-xl flex items-center gap-2 border border-border/50 shadow-inner">
                          <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                          <p className="text-foreground">{userData?.salary}</p>
                        </div>
                      </div>
                         
                         {/* homeoffice Field (Adicionado ícone de casa) */}
                      <div className="data-field-group">
                        <Label htmlFor="homeOffice" className="text-sm font-medium text-muted-foreground">
                          Local de Trabalho
                        </Label>
                        <div className="mt-1 p-3 bg-muted rounded-xl flex items-center gap-2 border border-border/50 shadow-inner">
                          <Home className="h-4 w-4 text-primary flex-shrink-0" />
                          {/* Lógica de exibição Remoto/Escritório */}
                          <p className="text-foreground">
                            {userData?.homeOffice === true ? 'Remoto' : 
                             userData?.homeOffice === false ? 'Escritório' : 'N/A'}
                          </p>
                        </div>
                      </div>
                        <Separator />

                      {/* Role Field */}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Tipo de Usuário</Label>
                        <div className="mt-1 p-3 bg-muted rounded-xl flex items-center gap-2 border border-border/50 shadow-inner">
                              <SquareUser className="h-4 w-4 text-primary flex-shrink-0" />
                          <p className="text-foreground font-semibold">
                            {getRoleDisplayName(userAccountData?.role || 'PARTNER')}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status da Conta Field */}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status da Conta</Label>
                        <div className="mt-1 p-3 bg-muted rounded-lg flex items-center gap-2">
                          {userAccountData?.active ? (
                            <>
                              <CircleCheck className="h-5 w-5 text-green-500" />
                              <p className="text-foreground text-sm">Ativa</p>
                            </>
                          ) : (
                            <>
                              <CircleX className="h-5 w-5 text-destructive" />
                              <p className="text-foreground text-sm">Inativa</p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CARD DE CONTATO E SEGURANÇA */}
              <Card className="shadow-lg border-l-4 border-l-secondary">
                <CardHeader className="flex flex-row items-center text-primary justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" /> Contato e Segurança
                  </CardTitle>
                  <CardDescription>Informações de acesso</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <SkeletonCard />
                  ) : (
                    <div className="space-y-4">
                      
                      {/* Email Field */}
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                          E-mail
                        </Label>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="relative flex-1">
                            <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary z-10" />
                            <Input
                              id="email"
                              type="email"
                              value={newEmail}
                              onChange={handleEmailChange} // 💡 Handler do hook
                              // FIX 1: Desabilita se não estiver em edição OU se estiver salvando (usando isLoading)
                              disabled={!isEditingEmail || isLoading}
                              className={`pl-10 pr-10  ${isEditingEmail ? "bg-card border-primary" : "bg-muted border-transparent"}`}
                            />
                          </div>
                          {isEditingEmail ? (
                            <div className="flex gap-1 ">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleSaveEmail} 
                                className="p-1 h-auto hover:bg-green-600/10"
                                disabled={isLoading} // FIX 2: Desabilita o botão enquanto estiver salvando
                              >
                                {/* FIX 3: Usa isLoading para o loader do botão de salvar */}
                                {isLoading ? <Loader2 className="h-4 w-4 text-green-600 animate-spin" /> : <Save className="h-4 w-4 text-green-600" />} 
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={toggleEditingEmail} 
                                className="p-1 h-auto hover:bg-red-600/10"
                                disabled={isLoading} // Desabilita o cancelar durante o salvamento
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleEditingEmail}
                              className="p-1 h-auto hover:bg-muted-foreground/10"
                            >
                              <Pencil className="h-4 w-4 text-primary" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Phone Field */}
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">
                          Telefone
                        </Label>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary z-10" />
                            <Input
                              id="phone"
                              type="tel"
                              // FIX 4: Aplica a máscara para exibição no modo edição
                              value={formatPhoneDisplay(newPhone)}
                              onChange={handlePhoneChange} // 💡 Handler do hook
                              // FIX 5: Desabilita se não estiver em edição OU se estiver salvando (usando isLoading)
                              disabled={!isEditingPhone || isLoading}
                              className={`pl-10 pr-10 ${isEditingPhone ? "bg-card border-primary" : "bg-muted border-transparent"}`}
                            />
                          </div>
                          {isEditingPhone ? (
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleSavePhone} 
                                className="p-1 h-auto hover:bg-green-600/10"
                                disabled={isLoading} // FIX 6: Desabilita o botão enquanto estiver salvando
                              >
                                {/* FIX 7: Usa isLoading para o loader do botão de salvar */}
                                {isLoading ? <Loader2 className="h-4 w-4 text-green-600 animate-spin" /> : <Save className="h-4 w-4 text-green-600" />}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={toggleEditingPhone} 
                                className="p-1 h-auto hover:bg-red-600/10"
                                disabled={isLoading} // Desabilita o cancelar durante o salvamento
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleEditingPhone}
                              className="p-1 h-auto hover:bg-muted-foreground/10"
                            >
                              <Pencil className="h-4 w-4 text-primary" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <Separator />

               {/* Password Section */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-md font-semibold ">Alterar Senha</h3>
                          <Button variant="outline" size="sm" onClick={togglePasswordFields} className=" border-primary/40 bg-primary/15 text-grey hover:bg-primary/80 hover:shadow-primary/20">
                            {showPasswordFields ? "Cancelar" : "Alterar Senha"}
                          </Button>
                        </div>

                        {showPasswordFields && (
                          <div className="space-y-3 p-4 border rounded-lg bg-background">
                            {/* Old Password */}
                            <div className="relative">
                              <Label htmlFor="currentPassword">Senha Atual</Label>
                              <Input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                value={passwordData.currentPassword || ""}
                                onChange={handlePasswordChange} 
                                required
                                disabled={isSavingPassword}  
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-[1.4rem] h-8 w-8  text-muted-foreground"
                                onClick={() => setShowCurrentPassword((prev) => !prev)}
                                disabled={isSavingPassword}
                              >
                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>

                            {/* New Password */}
                            <div className="relative">
                              <Label htmlFor="newPassword">Nova Senha</Label>
                              <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange} 
                                required
                                disabled={isSavingPassword}  
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-[1.4rem] h-8 w-8 text-muted-foreground"
                                onClick={() => setShowNewPassword((prev) => !prev)}
                                disabled={isSavingPassword}
                              >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>

                            {/* Confirm New Password */}
                            <div className="relative">
                              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange} 
                                required
                                disabled={isSavingPassword}  
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-[1.4rem] h-8 w-8 text-muted-foreground"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                disabled={isSavingPassword}
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4  b " /> : <Eye className="h-4 w-4"  />}
                              </Button>
                            </div>
                            
                            {/* Mensagem de erro de Confirmação */}
                            {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                                <p className="text-sm font-medium text-destructive mt-1">As senhas não coincidem.</p>
                            )}

                            <Button 
                              onClick={handleChangePassword} // Handler do hook
                              className="w-full mt-4 border-primary/40 bg-primary/15 text-grey hover:bg-primary/80 hover:shadow-primary/20"
                              disabled={isPasswordChangeDisabled}
                            >
                              {isSavingPassword ? ( // Usa o loading state
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Alterando...
                                  </>
                              ) : (
                                  "Confirmar Alteração"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Address Field */}
                      <div>
                        <Label htmlFor="address" className="text-sm font-medium text-muted-foreground">
                          Endereço
                        </Label>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
                          <p className="text-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                            {formatAddressDisplay()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Usuario;
