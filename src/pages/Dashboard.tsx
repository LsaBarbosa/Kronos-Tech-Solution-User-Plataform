import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Clock from "@/components/Clock";
import EmployeeBadge from "@/components/EmployeeBadge";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";
import { Bell, MessageSquareWarning } from "lucide-react"; // Ícone para a notificação
import { useNavigate } from "react-router-dom";

interface UserProfile {
  fullName: string;
  jobPosition: string;
  email: string;
  salary: number;
  phone: string;
  companyName: string;
}

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [unreadWarnings, setUnreadWarnings] = useState<any[]>([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token de autenticação não encontrado.");
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}employee/own-profile`, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        throw new Error("Falha ao buscar os dados do perfil do usuário.");
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
  }, [toast]);

  const fetchPendingApprovals = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}records/pending-approvals`, {
        method: "GET",
        headers: headers,
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
  }, []);

  const fetchUnreadWarnings = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}messages`, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        console.error("Falha ao buscar novos avisos.");
        return;
      }

      const data = await response.json();
      setUnreadWarnings(data); // Armazena o array de avisos
    } catch (error: any) {
      console.error("Erro ao buscar novos avisos:", error);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchPendingApprovals();
    fetchUnreadWarnings();
  }, [fetchProfile, fetchPendingApprovals, fetchUnreadWarnings]);

  const handleReminderClick = () => {
    navigate("/apuracao-horas");
  };
  const handleWarningClick = () => {
    navigate("/avisos");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background:
              "linear-gradient(-45deg, hsl(var(--black-primary)), hsl(var(--primary)), hsl(var(--black-primary)), hsl(var(--primary)))",
            backgroundSize: "400% 400%",
            animation: "gradient-flow 15s ease-in-out infinite",
          }}
        />

        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/4 w-16 h-16 md:w-32 md:h-32 opacity-3"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary) / 0.1), transparent)",
              borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
              animation: "float-shapes 20s ease-in-out infinite",
            }}
          />
          <div
            className="absolute top-3/4 right-1/4 w-24 h-24 md:w-48 md:h-48 opacity-2"
            style={{
              background:
                "linear-gradient(45deg, hsl(var(--black-primary) / 0.05), transparent)",
              borderRadius: "70% 30% 30% 70% / 70% 70% 30% 30%",
              animation: "float-shapes 25s ease-in-out infinite reverse",
            }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-12 h-12 md:w-24 md:h-24 opacity-4"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--primary) / 0.08), transparent)",
              borderRadius: "50%",
              animation: "float-shapes 18s ease-in-out infinite 5s",
            }}
          />
        </div>
      </div>

      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-16 px-4 md:px-6 flex items-center justify-center min-h-[calc(100vh-4rem)] relative z-10">
        <div className="max-w-md w-full space-y-6 md:space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent px-2">
              Bem-vindo ao seu painel
            </h1>

            {/* Contagem de Aprovações Pendentes */}
            {pendingApprovalsCount > 0 && (
              <div
                className="flex justify-center mt-6 cursor-pointer"
                onClick={handleReminderClick} // 4. Adicione o evento de clique
                title="Ir para Apuração de Horas" // Dica para o usuário
              >
                <div className="bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-2 flex items-center space-x-2 animate-pulse hover:bg-primary/20 transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="font-semibold">{pendingApprovalsCount}</span>
                  <span>
                    {pendingApprovalsCount === 1
                      ? "aprovação pendente"
                      : "aprovações pendentes"}
                  </span>
                </div>
              </div>
            )}
            {unreadWarnings.length > 0 && (
              <div
                className="flex justify-center mt-4 cursor-pointer"
                onClick={handleWarningClick}
                title="Ir para Avisos"
              >
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full px-4 py-2 flex items-center space-x-2 animate-pulse hover:bg-yellow-500/20 transition-colors">
                  <MessageSquareWarning className="h-5 w-5" />
                  <span className="font-semibold">{unreadWarnings.length}</span>
                  <span>
                    {unreadWarnings.length === 1
                      ? "novo aviso"
                      : "novos avisos"}
                  </span>
                </div>
              </div>
            )}

            {/* Clock centralizado embaixo do crachá */}
            <div className="flex justify-center mt-6">
              <Clock />
            </div>
            {/* Employee Badge centralizado */}
            <div className="flex justify-center mt-6">
              <EmployeeBadge
                userData={userData}
                isLoading={isLoading}
                onUpdateSuccess={fetchProfile}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;