// src/pages/Usuario.tsx

import { useState, useCallback } from "react"; 
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
// 💡 Ícones que indicam funcionalidade e estado
import { User, Lock, Eye, EyeOff, Save, X, Pencil, Briefcase, Phone, MapPin, AtSign, CircleUserRound, Loader2, CircleCheck, CircleX } from "lucide-react";
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
  
  // Variáveis auxiliares para a apresentação
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
  
  // Validação local para desabilitar o botão de senha
  const isPasswordChangeDisabled = (
    !passwordData.newPassword || 
    passwordData.newPassword !== passwordData.confirmPassword || 
    !passwordData.currentPassword
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={handleToggleSidebar} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 pt-20">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-foreground">Meu Perfil</h1>
            
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* CARD DE DADOS PESSOAIS */}
              <Card className="shadow-lg border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
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
                        <div className="mt-1 p-3 bg-muted rounded-lg">
                          <p className="text-foreground font-semibold">{userData?.fullName}</p>
                        </div>
                      </div>

                      {/* CPF Field */}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">CPF</Label>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
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
                          <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <p className="text-foreground">{userData?.jobPosition}</p>
                        </div>
                      </div>

                      {/* Role Field */}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Tipo de Usuário</Label>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
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
                      
                      {/* Último Login */}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Último Login</Label>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
                          <p className="text-foreground text-sm">
                            {formatDateString(userData?.lastLogin)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CARD DE CONTATO E SEGURANÇA */}
              <Card className="shadow-lg border-l-4 border-l-secondary">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Lock className="h-5 w-5 text-secondary" /> Contato e Segurança
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
                            <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                            <Input
                              id="email"
                              type="email"
                              value={newEmail}
                              onChange={handleEmailChange} // 💡 Handler do hook
                              disabled={!isEditingEmail}
                              className={`pl-10 pr-10 ${isEditingEmail ? "bg-card border-primary" : "bg-muted border-transparent"}`}
                            />
                          </div>
                          {isEditingEmail ? (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={handleSaveEmail} className="p-1 h-auto hover:bg-green-600/10">
                                {/* 💡 Usa o estado de isEditingEmail para o loader (substituindo o loading state local) */}
                                {isUpdatingContact ? <Loader2 className="h-4 w-4 text-green-600 animate-spin" /> : <Save className="h-4 w-4 text-green-600" />} 
                              </Button>
                              <Button variant="ghost" size="sm" onClick={toggleEditingEmail} className="p-1 h-auto hover:bg-red-600/10">
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
                              <Pencil className="h-4 w-4 text-muted-foreground" />
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
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                            <Input
                              id="phone"
                              type="tel"
                              value={newPhone}
                              onChange={handlePhoneChange} // 💡 Handler do hook
                              disabled={!isEditingPhone}
                              className={`pl-10 pr-10 ${isEditingPhone ? "bg-card border-primary" : "bg-muted border-transparent"}`}
                            />
                          </div>
                          {isEditingPhone ? (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={handleSavePhone} className="p-1 h-auto hover:bg-green-600/10">
                                {/* 💡 Usa o estado de isEditingPhone para o loader (substituindo o loading state local) */}
                                {isUpdatingContact ? <Loader2 className="h-4 w-4 text-green-600 animate-spin" /> : <Save className="h-4 w-4 text-green-600" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={toggleEditingPhone} className="p-1 h-auto hover:bg-red-600/10">
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
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <Separator />

               {/* Password Section */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-md font-semibold text-foreground">Alterar Senha</h3>
                          <Button variant="outline" size="sm" onClick={togglePasswordFields}>
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
                                className="absolute right-0 top-[1.4rem] h-8 w-8 text-muted-foreground"
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
                                // FIX 2: AQUI ESTAVA O ERRO! Lendo 'confirmPassword'
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
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                            
                            {/* Mensagem de erro de Confirmação */}
                            {/* FIX 3: AQUI ESTAVA O ERRO! Comparando 'confirmPassword' */}
                            {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                                <p className="text-sm font-medium text-destructive mt-1">As senhas não coincidem.</p>
                            )}

                            <Button 
                              onClick={handleChangePassword} // Handler do hook
                              className="w-full mt-4"
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
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {/* Assumindo que userData.address.street/number/city/state existem */}
                            {userData?.address.street}, {userData?.address.number} - {userData?.address.city}/{userData?.address.state}
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