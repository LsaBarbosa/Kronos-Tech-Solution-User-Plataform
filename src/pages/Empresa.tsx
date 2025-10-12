import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus, Search, User } from "lucide-react"; // 💡 Importamos o ícone User
import { useNavigate } from "react-router-dom";

const Empresa = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="pt-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto py-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">Gestão de Empresas</h1>
            <p className="text-muted-foreground">
              Gerencie as empresas e colaboradores do sistema
            </p>
          </div>

          {/* 🎯 Mudamos para grid de 3 colunas para acomodar o novo card */}
          <div className="grid md:grid-cols-3 gap-6"> 
            
            {/* CARD 1: CRIAR EMPRESA */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/empresa/criar")}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Plus className="h-8 w-8 text-green-600" />
                  <div>
                    <CardTitle>Criar Empresa</CardTitle>
                    <CardDescription>
                      Cadastre uma nova empresa no sistema
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Empresa
                </Button>
              </CardContent>
            </Card>

            {/* 🆕 CARD 2: ADICIONAR COLABORADOR */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/criar-administrador" )}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 text-indigo-600" /> {/* Ícone e cor para Colaborador */}
                  <div>
                    <CardTitle>Adicionar Colaborador</CardTitle>
                    <CardDescription>
                      Cadastre um novo funcionário ou parceiro
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Novo Colaborador
                </Button>
              </CardContent>
            </Card>
            
            {/* CARD 3: BUSCAR EMPRESA */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/empresa/buscar")}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Search className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle>Buscar Empresa</CardTitle>
                    <CardDescription>
                      Pesquise e visualize empresas cadastradas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Empresas
                </Button>
              </CardContent>
            </Card>
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default Empresa;