import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { User, Lock, Eye, EyeOff, Save, X, Pencil, Briefcase, Phone, MapPin, AtSign, CircleUserRound, CircleCheck, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/config/api";

interface UserAccountData {
  userId: string;
  username: string;
  role: string;
  active: boolean;
  employeeId: string;
}

interface UserData {
  fullName: string;
  email: string;
  jobPosition: string;
  phone: string;
  lastLogin?: string;
  maskedCpf: string;
  address: {
    street: string;
    number: string;
    postalCode: string;
    city: string;
    state: string;
  };
}

const Usuario = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userAccountData, setUserAccountData] = useState<UserAccountData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({
    match: "",
    strength: "",
  });

  const { toast } = useToast();

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      };

      const [employeeResponse, userResponse] = await Promise.all([
        fetch(`${API_BASE_URL}employee/own-profile`, { method: "GET", headers }),
        fetch(`${API_BASE_URL}users/own-profile`, { method: "GET", headers }),
      ]);

      if (!employeeResponse.ok) {
        throw new Error("Falha ao buscar os dados do perfil do funcionário.");
      }
      if (!userResponse.ok) {
        throw new Error("Falha ao buscar os dados da conta de usuário.");
      }

      const employeeData = await employeeResponse.json();
      const userAccount = await userResponse.json();

      setUserData(employeeData);
      setUserAccountData(userAccount);

      toast({
        title: "Dados carregados com sucesso",
        description: "Informações do usuário atualizadas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar os dados",
        description: `Não foi possível carregar as informações. Tente novamente mais tarde.`,
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const validatePasswords = () => {
    const errors = { match: "", strength: "" };
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.match = "As senhas não coincidem";
    }
    if (passwordForm.newPassword.length < 6) {
      errors.strength = "A senha deve ter pelo menos 6 caracteres";
    }
    setPasswordErrors(errors);
    return !errors.match && !errors.strength;
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (passwordErrors.match || passwordErrors.strength) {
      setPasswordErrors({ match: "", strength: "" });
    }
  };

  const handleSavePassword = async () => {
    if (!validatePasswords()) {
      return;
    }
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token de autenticação não encontrado.");

      const response = await fetch(`${API_BASE_URL}users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao alterar a senha.");
      }

      toast({
        title: "Senha alterada com sucesso",
        description: "Sua senha foi atualizada.",
      });

      // Limpar formulário e ocultar
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleSaveEmail = async () => {
    if (!userData?.email.trim()) {
      toast({
        title: "Erro",
        description: "O e-mail não pode ser vazio.",
        variant: "destructive",
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token de autenticação não encontrado.");

      const response = await fetch(`${API_BASE_URL}employee/update-own-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: userData.email }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao atualizar o e-mail.');
      }

      toast({
        title: "E-mail atualizado",
        description: "Seu e-mail foi salvo com sucesso!",
      });
      setIsEditingEmail(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o e-mail. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSavePhone = async () => {
    const cleanedPhone = userData?.phone.replace(/\D/g, '');
    if (!cleanedPhone || cleanedPhone.length !== 11) {
      toast({
        title: "Erro",
        description: "O telefone deve conter exatamente 11 dígitos.",
        variant: "destructive",
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token de autenticação não encontrado.");

      const response = await fetch(`${API_BASE_URL}employee/update-own-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: cleanedPhone }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao atualizar o telefone.');
      }

      toast({
        title: "Telefone atualizado",
        description: "Seu telefone foi salvo com sucesso!",
      });
      setIsEditingPhone(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o telefone. Tente novamente.",
        variant: "destructive",
      });
    }
  };


  const formatPhone = (phone: string) => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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

      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-16 px-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
                         <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">

              Configurações do Usuário</h1>
            <p className="text-lg text-muted-foreground">
              Gerencie suas informações pessoais e configurações de segurança
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Informações da Conta e Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CircleUserRound className="h-5 w-5 text-primary" />
                  Informações da Conta e Segurança
                </CardTitle>
                <CardDescription>
                  Seus dados de acesso, permissões e configurações de segurança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    
                    <div>
                      <Label htmlFor="username" className="text-sm font-medium text-muted-foreground">
                        Nome de Usuário
                      </Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg">
                        <p className="font-mono text-lg font-semibold text-foreground">
                          {userAccountData?.username}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="role" className="text-sm font-medium text-muted-foreground">
                        Função
                      </Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg">
                        <p className="text-foreground">
                          {userAccountData?.role === 'MANAGER' ? 'Administrador' : userAccountData?.role === 'PARTNER' ? 'Colaborador' : userAccountData?.role}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="status" className="text-sm font-medium text-muted-foreground">
                        Status da Conta
                      </Label>
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
                <Separator className="my-6" />
                <div className="text-center space-y-4">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    Mantenha sua conta segura alterando sua senha regularmente
                  </p>
                  <Button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2 text-lg font-medium"
                    size="lg"
                  >
                    <Lock className="h-5 w-5 mr-2" />
                    {showPasswordForm ? "Cancelar" : "Alterar Senha"}
                  </Button>
                </div>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  showPasswordForm ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <Separator className="my-6" />
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                          className="pr-10"
                          placeholder="Digite sua senha atual"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('current')}
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                          className="pr-10"
                          placeholder="Digite sua nova senha"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('new')}
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {passwordErrors.strength && (
                        <p className="text-sm text-destructive mt-1">{passwordErrors.strength}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                          className="pr-10"
                          placeholder="Confirme sua nova senha"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('confirm')}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {passwordErrors.match && (
                        <p className="text-sm text-destructive mt-1">{passwordErrors.match}</p>
                      )}
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleSavePassword}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Nova Senha
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordForm({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                          setPasswordErrors({ match: "", strength: "" });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Funcionário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informações do Funcionário
                </CardTitle>
                <CardDescription>
                  Seus dados pessoais e informações de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-medium text-muted-foreground">
                        Nome Completo
                      </Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg">
                        <p className="text-foreground">
                          {userData?.fullName}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="jobPosition" className="text-sm font-medium text-muted-foreground">
                        Cargo
                      </Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg">
                        <p className="text-foreground">
                          {userData?.jobPosition}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="maskedCpf" className="text-sm font-medium text-muted-foreground">
                        CPF
                      </Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg">
                        <p className="text-foreground">
                          {userData?.maskedCpf}
                        </p>
                      </div>
                    </div>

                    {/* Email Field with Edit Functionality */}
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                        E-mail
                      </Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg flex items-center justify-between">
                        {isEditingEmail ? (
                          <Input
                            id="email"
                            type="email"
                            value={userData?.email || ''}
                            onChange={(e) => setUserData({ ...userData!, email: e.target.value })}
                            className="bg-transparent border-none p-0 focus-visible:ring-0 text-foreground"
                          />
                        ) : (
                          <p className="text-foreground flex items-center gap-2">
                            <AtSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {userData?.email}
                          </p>
                        )}
                        {isEditingEmail ? (
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSaveEmail}
                              className="p-1 h-auto hover:bg-muted-foreground/10"
                            >
                              <Save className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingEmail(false)}
                              className="p-1 h-auto hover:bg-muted-foreground/10"
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingEmail(true)}
                            className="p-1 h-auto hover:bg-muted-foreground/10"
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Phone Field with Edit Functionality */}
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">
                        Telefone
                      </Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg flex items-center justify-between">
                        {isEditingPhone ? (
                          <Input
                            id="phone"
                            type="tel"
                            value={userData?.phone || ''}
                            onChange={(e) => {
                                const sanitizedValue = e.target.value.replace(/\D/g, '').slice(0, 11);
                                setUserData({ ...userData!, phone: sanitizedValue });
                            }}
                            className="bg-transparent border-none p-0 focus-visible:ring-0 text-foreground"
                            maxLength={11}
                          />
                        ) : (
                          <p className="text-foreground flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            {formatPhone(userData?.phone || '')}
                          </p>
                        )}
                        {isEditingPhone ? (
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSavePhone}
                              className="p-1 h-auto hover:bg-muted-foreground/10"
                            >
                              <Save className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingPhone(false)}
                              className="p-1 h-auto hover:bg-muted-foreground/10"
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingPhone(true)}
                            className="p-1 h-auto hover:bg-muted-foreground/10"
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </div>

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
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Perfil Seguro</h3>
                <p className="text-sm text-muted-foreground">
                  Suas informações estão protegidas e criptografadas
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Senha Forte</h3>
                <p className="text-sm text-muted-foreground">
                  Use senhas complexas para maior segurança
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Save className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Backup Automático</h3>
                <p className="text-sm text-muted-foreground">
                  Seus dados são salvos automaticamente
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Usuario;