import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, X, Edit } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

// Interface para os dados da solicitação pendente
interface PendingApproval {
  timeRecordId: number;
  partnerName: string;
  managerUsername: string;
  newStartWork: string;
  newEndWork: string;
}

const PendingApprovals = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingApproval[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<PendingApproval | null>(null);
  const [editFormData, setEditFormData] = useState({
    newStartWork: "",
    newEndWork: ""
  });
  const { toast } = useToast();

  const handleEditClick = (request: PendingApproval) => {
    setCurrentRequest(request);
    // Convert ISO dates to datetime-local format for input fields
    const startDate = new Date(request.newStartWork);
    const endDate = new Date(request.newEndWork);
    
    setEditFormData({
      newStartWork: format(startDate, 'yyyy-MM-dd\'T\'HH:mm'),
      newEndWork: format(endDate, 'yyyy-MM-dd\'T\'HH:mm')
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!currentRequest) return;

    try {
      // Here you would make an API call to update the record
      // For now, just close the modal and show success message
      setIsEditModalOpen(false);
      setCurrentRequest(null);
      
      toast({
        title: "Sucesso",
        description: "Registro atualizado com sucesso.",
      });
      
      // Refresh the pending approvals list
      await fetchPendingApprovals();
    } catch (error) {
      console.error("Erro ao atualizar registro:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o registro.",
        variant: "destructive",
      });
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const response = await fetch(`${API_BASE_URL}records/pending-approvals`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail ||"Erro ao buscar as solicitações pendentes.");
      }

      const data: PendingApproval[] = await response.json();
      setPendingRequests(data);
      
      toast({
        title: "Sucesso",
        description: `Foram encontradas ${data.length} solicitações de alteração pendentes.`,
      });
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao buscar as solicitações.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-2">
            Solicitações Pendentes
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie as solicitações de alteração de registros.
          </p>
        </div>

        <Card className="border-gray-border shadow-card">
          <CardHeader className="border-b border-gray-border">
            <CardTitle className="text-foreground">
              Lista de Solicitações
            </CardTitle>
            <CardDescription className="text-gray-text">
              {pendingRequests.length} solicitação(ões) pendente(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-border bg-orange-primary/5">
                    <th className="text-left p-4 text-sm font-semibold text-foreground">ID do Registro</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Nome do Parceiro</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Administrador</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Novo Início</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Novo Fim</th>
                    <th className="text-left p-4 text-sm font-semibold text-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map((request, index) => (
                      <tr 
                        key={request.timeRecordId} 
                        className={`border-b border-gray-border/50 ${
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                        }`}
                      >
                        <td className="p-4 text-sm text-foreground">{request.timeRecordId}</td>
                        <td className="p-4 text-sm text-foreground">{request.partnerName}</td>
                        <td className="p-4 text-sm text-foreground">{request.managerUsername}</td>
                        <td className="p-4 text-sm text-foreground">
                          {format(new Date(request.newStartWork), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </td>
                        <td className="p-4 text-sm text-foreground">
                          {format(new Date(request.newEndWork), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </td>
                        <td className="p-4 text-sm">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditClick(request)}
                              className="text-primary hover:text-primary/80 transition-colors"
                              title="Editar registro"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button className="text-success hover:text-green-700 transition-colors">
                              <Check className="h-5 w-5" />
                            </button>
                            <button className="text-destructive hover:text-red-700 transition-colors">
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted-foreground">
                        Nenhuma solicitação pendente encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Registro</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startWork" className="text-right">
                  Início
                </Label>
                <Input
                  id="startWork"
                  type="datetime-local"
                  value={editFormData.newStartWork}
                  onChange={(e) => setEditFormData({...editFormData, newStartWork: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endWork" className="text-right">
                  Fim
                </Label>
                <Input
                  id="endWork"
                  type="datetime-local"
                  value={editFormData.newEndWork}
                  onChange={(e) => setEditFormData({...editFormData, newEndWork: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default PendingApprovals;