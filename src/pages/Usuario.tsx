// src/pages/Usuario.tsx

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Lock, Eye, EyeOff, Save, X, Pencil, Briefcase, Phone, MapPin, AtSign, CircleUserRound, Loader2, CircleCheck, CircleX, Home, DollarSign, User2Icon, IdCard, SquareUser, Shield, Clock } from "lucide-react";
// 💡 Componentes de UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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

      <main className="pt-16 px-4 py-5 sm:px-6 sm:py-8 lg:px-8 space-y-6 sm:space-y-8 relative z-10 bg-[#F8FAFC] dark:bg-[#0F172A]">
          <div className="max-w-6xl mx-auto w-full space-y-8">

            {/* Hero Section */}
            <section className="overflow-hidden rounded-2xl border border-[#C4B5FD]/60 bg-[linear-gradient(135deg,#7C3AED_0%,#3B82F6_58%,#67E8F9_100%)] p-5 text-white shadow-[0_24px_70px_-34px_rgba(59,130,246,0.65)] sm:p-7" role="banner">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-sm font-medium text-white">
                    <CircleUserRound className="h-4 w-4" /> Perfil do Usuário
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">Meu Perfil</h1>
                  <p className="text-white/90 text-sm sm:text-base max-w-2xl">Gerencie suas informações pessoais, dados de contato e segurança da sua conta</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs sm:text-sm text-white/90">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" /> Status da Conta: {userAccountData?.active ? 'Ativa' : 'Inativa'}
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex flex-shrink-0">
                  <Shield className="h-20 w-20 sm:h-24 sm:w-24 text-white/20" />
                </div>
              </div>
            </section>

            {/* Loading State */}
            {isLoading && (
              <Card className="shadow-card border-primary/20">
                <CardContent className="py-12 flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground text-sm">Carregando perfil...</p>
                </CardContent>
              </Card>
            )}

            {!isLoading && (
              <div className="grid gap-6 lg:grid-cols-3">

                {/* Column 1: Personal Data */}
                <Card className="lg:col-span-2 overflow-hidden shadow-sm border-[#E5E7EB] dark:border-[#404854] bg-gradient-to-br from-[#F8FAFC] to-white dark:from-slate-800/50 dark:to-slate-900/30 hover:shadow-md transition-shadow">
                  <CardHeader className="border-b border-[#E5E7EB] dark:border-[#404854] pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CircleUserRound className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Dados Pessoais</CardTitle>
                        <CardDescription>Informações básicas do seu perfil</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <div className="space-y-4">
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Full Name */}
                        <div className="sm:col-span-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome Completo</Label>
                          <div className="mt-2 p-3 bg-white/50 dark:bg-slate-700/30 rounded-lg flex items-center gap-3 border border-[#E5E7EB] dark:border-[#404854]">
                            <User2Icon className="h-4 w-4 text-primary flex-shrink-0" />
                            <p className="text-foreground font-medium">{userData?.fullName}</p>
                          </div>
                        </div>

                        {/* CPF */}
                        <div>
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CPF</Label>
                          <div className="mt-2 p-3 bg-white/50 dark:bg-slate-700/30 rounded-lg flex items-center gap-3 border border-[#E5E7EB] dark:border-[#404854]">
                            <IdCard className="h-4 w-4 text-primary flex-shrink-0" />
                            <p className="text-foreground text-sm">{userData?.maskedCpf}</p>
                          </div>
                        </div>

                        {/* Job Position */}
                        <div>
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cargo</Label>
                          <div className="mt-2 p-3 bg-white/50 dark:bg-slate-700/30 rounded-lg flex items-center gap-3 border border-[#E5E7EB] dark:border-[#404854]">
                            <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                            <p className="text-foreground text-sm">{userData?.jobPosition}</p>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4 dark:bg-slate-700/30" />

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Salary */}
                        <div>
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Remuneração</Label>
                          <div className="mt-2 p-3 bg-white/50 dark:bg-slate-700/30 rounded-lg flex items-center gap-3 border border-[#E5E7EB] dark:border-[#404854]">
                            <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                            <p className="text-foreground text-sm">{userData?.salary}</p>
                          </div>
                        </div>

                        {/* Work Location */}
                        <div>
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Local de Trabalho</Label>
                          <div className="mt-2 p-3 bg-white/50 dark:bg-slate-700/30 rounded-lg flex items-center gap-3 border border-[#E5E7EB] dark:border-[#404854]">
                            <Home className="h-4 w-4 text-primary flex-shrink-0" />
                            <p className="text-foreground text-sm">
                              {userData?.homeOffice === true ? 'Remoto' : userData?.homeOffice === false ? 'Escritório' : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4 dark:bg-slate-700/30" />

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Role */}
                        <div>
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo de Usuário</Label>
                          <div className="mt-2 p-3 bg-white/50 dark:bg-slate-700/30 rounded-lg flex items-center gap-3 border border-[#E5E7EB] dark:border-[#404854]">
                            <SquareUser className="h-4 w-4 text-primary flex-shrink-0" />
                            <p className="text-foreground text-sm font-medium">{getRoleDisplayName(userAccountData?.role || 'PARTNER')}</p>
                          </div>
                        </div>

                        {/* Account Status */}
                        <div>
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status da Conta</Label>
                          <div className="mt-2 p-3 bg-white/50 dark:bg-slate-700/30 rounded-lg flex items-center gap-3 border border-[#E5E7EB] dark:border-[#404854]">
                            {userAccountData?.active ? (
                              <>
                                <CircleCheck className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <p className="text-foreground text-sm">Ativa</p>
                              </>
                            ) : (
                              <>
                                <CircleX className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                <p className="text-foreground text-sm">Inativa</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Column 2: Address */}
                <Card className="overflow-hidden shadow-sm border-[#E5E7EB] dark:border-[#404854] bg-gradient-to-br from-[#F8FAFC] to-white dark:from-slate-800/50 dark:to-slate-900/30 hover:shadow-md transition-shadow">
                  <CardHeader className="border-b border-[#E5E7EB] dark:border-[#404854] pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Endereço</CardTitle>
                        <CardDescription>Informações de localização</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <div className="p-4 bg-white/50 dark:bg-slate-700/30 rounded-lg border border-[#E5E7EB] dark:border-[#404854]">
                      <p className="text-foreground text-sm leading-relaxed">
                        <span className="block font-medium mb-1">{userData?.address.street}, {userData?.address.number}</span>
                        <span className="block">{userData?.address.city} - {userData?.address.state}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Column 3: Contact & Security */}
                <Card className="lg:col-span-3 overflow-hidden shadow-sm border-[#E5E7EB] dark:border-[#404854] bg-gradient-to-br from-[#F8FAFC] to-white dark:from-slate-800/50 dark:to-slate-900/30 hover:shadow-md transition-shadow">
                  <CardHeader className="border-b border-[#E5E7EB] dark:border-[#404854] pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Contato e Segurança</CardTitle>
                        <CardDescription>Gerenciar e-mail, telefone e senha</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* Email Field */}
                      <div>
                        <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                          E-mail
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary z-10" />
                            <Input
                              id="email"
                              type="email"
                              value={newEmail}
                              onChange={handleEmailChange}
                              disabled={!isEditingEmail || isLoading}
                              className={`pl-10 pr-10 border-[#E5E7EB] dark:border-[#404854] ${isEditingEmail ? "bg-white dark:bg-slate-700/50 border-primary dark:border-primary" : "bg-white/50 dark:bg-slate-700/30 border-[#E5E7EB] dark:border-[#404854]"}`}
                            />
                          </div>
                          {isEditingEmail ? (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSaveEmail}
                                className="p-1 h-auto hover:bg-green-600/10 dark:hover:bg-green-600/20"
                                disabled={isLoading}
                              >
                                {isLoading ? <Loader2 className="h-4 w-4 text-green-600 dark:text-green-400 animate-spin" /> : <Save className="h-4 w-4 text-green-600 dark:text-green-400" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleEditingEmail}
                                className="p-1 h-auto hover:bg-red-600/10 dark:hover:bg-red-600/20"
                                disabled={isLoading}
                              >
                                <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={toggleEditingEmail}
                              className="border-[#E5E7EB] dark:border-[#404854] text-foreground hover:bg-[#F8FAFC] dark:hover:bg-slate-700/50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Phone Field */}
                      <div>
                        <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                          Telefone
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary z-10" />
                            <Input
                              id="phone"
                              type="tel"
                              value={formatPhoneDisplay(newPhone)}
                              onChange={handlePhoneChange}
                              disabled={!isEditingPhone || isLoading}
                              className={`pl-10 pr-10 border-[#E5E7EB] dark:border-[#404854] ${isEditingPhone ? "bg-white dark:bg-slate-700/50 border-primary dark:border-primary" : "bg-white/50 dark:bg-slate-700/30 border-[#E5E7EB] dark:border-[#404854]"}`}
                            />
                          </div>
                          {isEditingPhone ? (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSavePhone}
                                className="p-1 h-auto hover:bg-green-600/10 dark:hover:bg-green-600/20"
                                disabled={isLoading}
                              >
                                {isLoading ? <Loader2 className="h-4 w-4 text-green-600 dark:text-green-400 animate-spin" /> : <Save className="h-4 w-4 text-green-600 dark:text-green-400" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleEditingPhone}
                                className="p-1 h-auto hover:bg-red-600/10 dark:hover:bg-red-600/20"
                                disabled={isLoading}
                              >
                                <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={toggleEditingPhone}
                              className="border-[#E5E7EB] dark:border-[#404854] text-foreground hover:bg-[#F8FAFC] dark:hover:bg-slate-700/50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <Separator className="my-6 dark:bg-slate-700/30" />

                      {/* Password Section */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-base font-semibold">Alterar Senha</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={togglePasswordFields}
                            className="border-[#E5E7EB] dark:border-[#404854] text-foreground hover:bg-[#F8FAFC] dark:hover:bg-slate-700/50"
                          >
                            {showPasswordFields ? "Cancelar" : "Alterar Senha"}
                          </Button>
                        </div>

                        {showPasswordFields && (
                          <div className="space-y-4 p-4 border border-[#E5E7EB] dark:border-[#404854] rounded-lg bg-white/50 dark:bg-slate-700/20">
                            {/* Old Password */}
                            <div className="relative">
                              <Label htmlFor="currentPassword" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Senha Atual</Label>
                              <Input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                value={passwordData.currentPassword || ""}
                                onChange={handlePasswordChange}
                                required
                                disabled={isSavingPassword}
                                className="pl-10 border-[#E5E7EB] dark:border-[#404854]"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-[2.3rem] h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowCurrentPassword((prev) => !prev)}
                                disabled={isSavingPassword}
                              >
                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>

                            {/* New Password */}
                            <div className="relative">
                              <Label htmlFor="newPassword" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Nova Senha</Label>
                              <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                                disabled={isSavingPassword}
                                className="pl-10 border-[#E5E7EB] dark:border-[#404854]"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-[2.3rem] h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowNewPassword((prev) => !prev)}
                                disabled={isSavingPassword}
                              >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>

                            {/* Confirm New Password */}
                            <div className="relative">
                              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Confirmar Nova Senha</Label>
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                disabled={isSavingPassword}
                                className="pl-10 border-[#E5E7EB] dark:border-[#404854]"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-[2.3rem] h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                disabled={isSavingPassword}
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>

                            {/* Password Mismatch Error */}
                            {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                              <p className="text-xs font-medium text-red-600 dark:text-red-400">As senhas não coincidem.</p>
                            )}

                            <Button
                              onClick={handleChangePassword}
                              className="w-full mt-2 bg-primary hover:bg-primary/90 text-white"
                              disabled={isPasswordChangeDisabled || isSavingPassword}
                            >
                              {isSavingPassword ? (
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
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Usuario;
