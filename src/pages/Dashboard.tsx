import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Clock from "@/components/Clock";
import EmployeeBadge from "@/components/EmployeeBadge";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/config/api";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyName, setCompanyName] = useState(""); // Novo estado para o nome da empresa
  const { toast } = useToast();

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

  // useEffect para buscar o nome da empresa quando o componente montar
  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        const headers = getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}employee/own-profile`, {
          method: "GET",
          headers: headers,
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar o nome da empresa.");
        }

        const data = await response.json();
        setCompanyName(data.companyName); // Atualiza o estado com o nome da empresa da API
      } catch (error) {
        console.error(error);
        toast({
          title: "Erro de Conexão",
          description: error.message,
          variant: "destructive",
        });
        // Opcional: manter um valor padrão ou mensagem de erro
        setCompanyName("Nome da Empresa não encontrado");
      }
    };

    fetchCompanyName();
  }, []); // O array de dependências vazio garante que o useEffect rode apenas uma vez


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
            {/* Clock centralizado embaixo do crachá */}
            <div className="flex justify-center mt-6">
              <Clock />
            </div>
            {/* Employee Badge centralizado */}
            <div className="flex justify-center mt-6">
              <EmployeeBadge />
            </div>


          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;