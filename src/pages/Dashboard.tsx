import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Clock from "@/components/Clock";
import EmployeeBadge from "@/components/EmployeeBadge";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";
import { Bell, MessageSquareWarning } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

// Interface atualizada para receber o novo campo da API
interface UserProfile {
  fullName: string;
  jobPosition: string;
  email: string;
  salary: number;
  phone: string;
  companyName: string;
  lastSeenMessageTimestamp?: string; // Este campo virá do backend
}

// Interface para garantir que os avisos tenham a propriedade 'createdAt'
interface Warning {
  messageId: string;
  createdAt: string;
  // adicione outros campos se necessário
  [key: string]: any;
}

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Estado para guardar TODOS os avisos da empresa
  const [allCompanyWarnings, setAllCompanyWarnings] = useState<Warning[]>([]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token de autenticação não encontrado.");
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}employee/own-profile`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("Falha ao buscar os dados do perfil.");
      }
      const data = await response.json();
      setUserData(data);
    } catch (error: any) {
      console.error("Erro ao buscar o perfil:", error);
      toast({
        title: "Erro de Conexão",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, getAuthHeaders]);

  const fetchPendingApprovals = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}records/pending-approvals`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        console.error("Falha ao buscar aprovações pendentes.");
        return;
      }
      const data = await response.json();
      setPendingApprovalsCount(data.length);
    } catch (error: any) {
      console.error("Erro ao buscar aprovações pendentes:", error);
    }
  }, [getAuthHeaders]);

  // Busca todos os avisos da empresa
  const fetchWarnings = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}messages`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        console.error("Falha ao buscar os avisos.");
        return;
      }
      const data = await response.json();
      setAllCompanyWarnings(data);
    } catch (error: any) {
      console.error("Erro ao buscar os avisos:", error);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchProfile();
    fetchPendingApprovals();
    fetchWarnings();
  }, [fetchProfile, fetchPendingApprovals, fetchWarnings]);

  // Hook que calcula quais avisos são "novos"
  const newWarnings = useMemo(() => {
    if (!userData || !allCompanyWarnings.length) {
      return [];
    }
    // Se o usuário nunca visualizou, todos os avisos são novos
    if (!userData.lastSeenMessageTimestamp) {
      return allCompanyWarnings;
    }

    const lastSeenDate = new Date(userData.lastSeenMessageTimestamp);

    // Filtra apenas os avisos criados DEPOIS da última visualização
    return allCompanyWarnings.filter(warning => {
      const warningDate = new Date(warning.createdAt);
      return warningDate > lastSeenDate;
    });
  }, [allCompanyWarnings, userData]);

  const handleReminderClick = () => {
    navigate("/apuracao-horas");
  };

  // Função que chama a nova API do backend ao clicar na notificação
 const handleWarningClick = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}employee/mark-messages-seen`, {
        method: "POST",
        headers,
      });

      // Se a chamada para marcar como visto falhar, exibe um erro e não continua.
      if (!response.ok) {
        throw new Error("Falha ao marcar avisos como vistos.");
      }
      
      // --- CORREÇÃO PRINCIPAL AQUI ---
      // Após o sucesso, chamamos a função `fetchProfile()` novamente.
      // Isso garante que o `userData` seja atualizado com os dados mais recentes do banco,
      // incluindo o novo `lastSeenMessageTimestamp`.
      await fetchProfile();

    } catch (error: any) {
      toast({
        title: "Erro ao marcar como visto",
        description: error.message || "Não foi possível atualizar o status dos avisos.",
        variant: "destructive",
      });
    } finally {
      // Navega para a página de avisos independentemente do resultado
      navigate("/avisos");
    }
  };
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* ... Código do background animado ... */}
      
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-16 px-4 md:px-6 flex items-center justify-center min-h-[calc(100vh-4rem)] relative z-10">
        <div className="max-w-md w-full space-y-6 md:space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent px-2">
              Bem-vindo ao seu painel
            </h1>

            {/* Notificação de Aprovações Pendentes */}
            {pendingApprovalsCount > 0 && (
              <div
                className="flex justify-center mt-6 cursor-pointer"
                onClick={handleReminderClick}
                title="Ir para Apuração de Horas"
              >
                <div className="bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-2 flex items-center space-x-2 animate-pulse hover:bg-primary/20 transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="font-semibold">{pendingApprovalsCount}</span>
                  <span>{pendingApprovalsCount === 1 ? "aprovação pendente" : "aprovações pendentes"}</span>
                </div>
              </div>
            )}
            
            {/* Notificação de Novos Avisos (lógica atualizada) */}
            {newWarnings.length > 0 && (
              <div
                className="flex justify-center mt-4 cursor-pointer"
                onClick={handleWarningClick}
                title="Ir para Avisos"
              >
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full px-4 py-2 flex items-center space-x-2 animate-pulse hover:bg-yellow-500/20 transition-colors">
                  <MessageSquareWarning className="h-5 w-5" />
                  <span className="font-semibold">{newWarnings.length}</span>
                  <span>{newWarnings.length === 1 ? "novo aviso" : "novos avisos"}</span>
                </div>
              </div>
            )}

            <div className="flex justify-center mt-6">
              <Clock />
            </div>
            <div className="flex justify-center mt-6">
              <Card className="border-l-4 border-l-primary shadow-card">
              <EmployeeBadge
                userData={userData}
                isLoading={isLoading}
                onUpdateSuccess={fetchProfile}
              />
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;