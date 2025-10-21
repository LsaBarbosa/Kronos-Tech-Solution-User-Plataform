// src/pages/Usuario.tsx

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { User, Lock, Eye, EyeOff, Save, X, Pencil, Briefcase, Phone, MapPin, AtSign, CircleUserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useUser } from "@/hooks/useUser"; // 💡 Importação do hook de Lógica

const Usuario = () => {
  // Estado de UI local, mantido no componente
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // 💡 Lógica de Abrir/Fechar a Sidebar - Função de 'open close'
  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev); 
  
  // 💡 Hook de Lógica de Negócios e Dados (Desacoplamento)
  const {
    userAccountData,
    userData,
    isLoading,
    isEditingEmail,
    isEditingPhone,
    showPasswordFields,
    newEmail,
    newPhone,
    passwordData,
    toggleEditingEmail,
    toggleEditingPhone,
    handleEmailChange,
    handlePhoneChange,
    handlePasswordChange,
    handleSaveEmail,
    handleSavePhone,
    handleChangePassword,
    togglePasswordFields,
  } = useUser();

  // Componente de Skeleton para reutilização
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

  return (
    <div className="flex h-screen bg-background">
      {/* 💡 CORREÇÃO: Sidebar usa 'toggleSidebar' */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} /> 
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 💡 CORREÇÃO: Header usa 'toggleSidebar' */}
        <Header toggleSidebar={handleToggleSidebar} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 pt-20"> {/* pt-20 para compensar o Header fixo */}
          <h1 className="text-3xl font-bold mb-6 text-foreground">Meu Perfil</h1>
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* CARD DE DADOS PESSOAIS */}
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <CircleUserRound className="h-5 w-5" /> Dados Pessoais
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
                        <p className="text-foreground">{userData?.fullName}</p>
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
                          {userAccountData?.role === "ADM" ? "Administrador" : userAccountData?.role || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CARD DE INFORMAÇÕES DE CONTATO E SEGURANÇA */}
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Lock className="h-5 w-5" /> Contato e Segurança
                </CardTitle>
                <CardDescription>Informações de acesso e contato</CardDescription>
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
                            onChange={handleEmailChange}
                            disabled={!isEditingEmail}
                            className={`pl-10 pr-10 ${isEditingEmail ? "bg-card border-primary" : "bg-muted border-transparent"}`}
                          />
                        </div>
                        {isEditingEmail ? (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={handleSaveEmail} className="p-1 h-auto hover:bg-green-600/10">
                              <Save className="h-4 w-4 text-green-600" />
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
                            onChange={handlePhoneChange}
                            disabled={!isEditingPhone}
                            className={`pl-10 pr-10 ${isEditingPhone ? "bg-card border-primary" : "bg-muted border-transparent"}`}
                          />
                        </div>
                        {isEditingPhone ? (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={handleSavePhone} className="p-1 h-auto hover:bg-green-600/10">
                              <Save className="h-4 w-4 text-green-600" />
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
                            <Label htmlFor="oldPassword">Senha Atual</Label>
                            <Input
                              id="oldPassword"
                              type={showOldPassword ? "text" : "password"}
                              value={passwordData.oldPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-[1.4rem] h-8 w-8 text-muted-foreground"
                              onClick={() => setShowOldPassword((prev) => !prev)}
                            >
                              {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-[1.4rem] h-8 w-8 text-muted-foreground"
                              onClick={() => setShowNewPassword((prev) => !prev)}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>

                          {/* Confirm New Password */}
                          <div className="relative">
                            <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
                            <Input
                              id="confirmNewPassword"
                              type={showConfirmNewPassword ? "text" : "password"}
                              value={passwordData.confirmNewPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-[1.4rem] h-8 w-8 text-muted-foreground"
                              onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                            >
                              {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>

                          <Button 
                            onClick={handleChangePassword} 
                            className="w-full mt-4"
                            disabled={!passwordData.newPassword || passwordData.newPassword !== passwordData.confirmNewPassword}
                          >
                            Confirmar Alteração
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
                          {userData?.address.street}, {userData?.address.number} - {userData?.address.city}/{userData?.address.state}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Usuario;