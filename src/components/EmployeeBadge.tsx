import { useState, useEffect } from "react";
import { User, Phone, Mail, Briefcase, DollarSign, Edit, Check, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config/api";

interface UserProfile {
  fullName: string;
  jobPosition: string;
  email: string;
  salary: number;
  phone: string;
  companyName: string;
}

const CACHE_KEY = "userProfileCache";
const CACHE_TTL = 5 * 60 * 1000;

const EmployeeBadge = () => {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState({
    contact: false,
    email: false,
  });
  const [isSalaryVisible, setIsSalaryVisible] = useState(false);
  const [tempData, setTempData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [companyName, setCompanyName] = useState("");

  // Função para buscar e salvar no cache
  const fetchAndCacheProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const response = await fetch(`${API_BASE_URL}employee/own-profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao buscar os dados do perfil do usuário.");
      }

      const data = await response.json();
      const dataWithTimestamp = { data, timestamp: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(dataWithTimestamp));
      
      return data;
    } catch (error) {
      console.error("Erro ao buscar e armazenar o perfil:", error);
      throw error;
    }
  };

  // 🚨 ATENÇÃO: A LÓGICA AGORA ESTÁ INTEIRAMENTE NESTE useEffect 🚨
  useEffect(() => {
    const loadProfile = async () => {
      let cachedData = null;
      const cachedItem = localStorage.getItem(CACHE_KEY);
      const now = Date.now();

      // 1. Tenta carregar do cache
      if (cachedItem) {
        const { data, timestamp } = JSON.parse(cachedItem);
        // Verifica se o cache ainda é válido
        if (now - timestamp < CACHE_TTL) {
          console.log("Perfil carregado do cache.");
          setUserData(data);
          setTempData({
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
          });
          setCompanyName(data.companyName);
          setIsLoading(false);
          return; // 🛑 SAÍDA IMEDIATA. NÃO FAZ A CHAMADA À API.
        }
      }

      // 2. Se chegou aqui, o cache é inválido ou não existe.
      console.log("Cache expirado ou não encontrado. Buscando da API...");
      setIsLoading(true);
      try {
        const newData = await fetchAndCacheProfile();
        setUserData(newData);
        setTempData({
          fullName: newData.fullName,
          email: newData.email,
          phone: newData.phone,
        });
        setCompanyName(newData.companyName);
      } catch (error) {
        toast.error("Erro ao carregar o perfil do usuário.");
        setCompanyName("Nome da Empresa não encontrado");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleUpdateProfile = async (field: keyof Omit<UserProfile, 'fullName' | 'jobPosition' | 'salary' | 'companyName'>) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const payload = { [field]: tempData[field] };
      
      const response = await fetch(`${API_BASE_URL}employee/update-own-profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Falha ao atualizar o perfil.");
      }

      toast.success(`Dados do perfil atualizados com sucesso.`);
      
      // Força a atualização do cache após uma alteração bem-sucedida
      const updatedData = await fetchAndCacheProfile();
      setUserData(updatedData);
      setTempData({
        fullName: updatedData.fullName,
        email: updatedData.email,
        phone: updatedData.phone,
      });
      setCompanyName(updatedData.companyName);

    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao atualizar o perfil.");
      setTempData({
        fullName: userData?.fullName || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
      });
    } finally {
      setIsUpdating(false);
      setIsEditing({ contact: false, email: false });
    }
  };

  const toggleEdit = (field: keyof typeof isEditing) => {
    setIsEditing((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleCancelEdit = (field: keyof typeof isEditing) => {
    setTempData((prev) => ({
      ...prev,
      [field === "contact" ? "phone" : "email"]: userData?.[field === "contact" ? "phone" : "email"] || "",
    }));
    toggleEdit(field);
  };
  
  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(salary);
  };

  const formatPhone = (phone: string) => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const getMaskedSalary = () => {
    return "R$ ••••••";
  };

  return (
    <div className="w-64">
      <Card className="bg-gradient-to-b from-card to-card/95 shadow-lg border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="text-center bg-primary/10 -mx-6 -mt-6 pt-4 pb-2 rounded-t-lg border-b border-primary/20">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
              {isLoading ? <Skeleton className="w-32 h-4 mx-auto" /> : companyName}
            </h3>
          </div>
          
          <div className="flex justify-center mt-2">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-primary/30 shadow-md">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full border-2 border-card flex items-center justify-center">
                <User className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pb-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-foreground">
              {isLoading ? <Skeleton className="w-40 h-5 mx-auto" /> : userData?.fullName}
            </h2>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full inline-block">
              {isLoading ? <Skeleton className="w-32 h-4" /> : userData?.jobPosition}
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
            <Phone className="mt-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              {isEditing.contact ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempData.phone}
                    onChange={(e) => setTempData({ ...tempData, phone: e.target.value })}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-green-600 hover:text-green-700"
                    onClick={() => handleUpdateProfile("phone")}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive/80"
                    onClick={() => handleCancelEdit("contact")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {isLoading ? <Skeleton className="w-24 h-4" /> : formatPhone(tempData.phone)}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-primary hover:text-primary/80"
                    onClick={() => toggleEdit("contact")}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
            <Mail className="mt-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              {isEditing.email ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempData.email}
                    onChange={(e) => setTempData({ ...tempData, email: e.target.value })}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-green-600 hover:text-green-700"
                    onClick={() => handleUpdateProfile("email")}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive/80"
                    onClick={() => handleCancelEdit("email")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground break-all">
                    {isLoading ? <Skeleton className="w-32 h-4" /> : tempData.email}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-primary hover:text-primary/80"
                    onClick={() => toggleEdit("email")}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-muted-foreground">
                {isLoading ? <Skeleton className="w-24 h-4" /> : (isSalaryVisible ? formatSalary(userData?.salary || 0) : getMaskedSalary())}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-primary hover:text-primary/80"
                onClick={() => setIsSalaryVisible(!isSalaryVisible)}
              >
                {isSalaryVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeBadge;