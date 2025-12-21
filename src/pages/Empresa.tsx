import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus, Search, User, Edit } from "lucide-react"; // 💡 Importamos o ícone Edit
import { useNavigate } from "react-router-dom";

const Empresa = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);
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

            {/* 🎯 ALTERAÇÃO AQUI: Grid de 2 colunas no md e 4 colunas no lg */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

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

              {/* CARD 2: ADICIONAR COLABORADOR */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/criar-administrador")}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-indigo-600" />
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

              {/* 🆕 CARD 4: ATUALIZAR EMPRESA */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/empresa/atualizar")}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Edit className="h-8 w-8 text-orange-500" /> {/* Ícone para Edição */}
                    <div>
                      <CardTitle>Atualizar Empresa</CardTitle>
                      <CardDescription>
                        Edite dados e status de empresas existentes
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Atualizar Dados
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Empresa;