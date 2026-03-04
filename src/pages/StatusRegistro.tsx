import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
// 🚀 ADICIONADO Loader2 para o spinner
import { Info, Save, ZapOff, Loader2 } from "lucide-react"; 
import { API_BASE_URL } from "@/config/api";

// 💡 NOVO: Componente de Filtros Modular
import { RelatorioFiltros } from "@/pages/RelatorioFiltros"; 
// 💡 NOVO: Componente de Resultados Modular (Reutilizando a lógica do Relatório Detalhado)
import { ResultadosRelatorioDetalhado } from "@/components/ResultadosRelatorioDetalhado"; 

// 💡 NOVO: Importando utilitários centralizados
import { 
    decodeToken, 
    statusOptions, 
    getStatusColor, 
    getTranslatedStatus,
    DetailedReportItem,
    Employee
} from "@/utils/report-utils"; 

// O nome do componente foi mantido como StatusRegistro.
const StatusRegistro = () => {
    const token = localStorage.getItem("token");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // 💡 ESTADOS DO FILTRO - Compartilhados com RelatorioFiltros
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [referenceTime, setReferenceTime] = useState("08:00");
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [employeeActive, setEmployeeActive] = useState("active");
    const [isActive, setIsActive] = useState(true);
    const [status, setStatus] = useState<string[]>(["CREATED"]); 
    const [reportType, setReportType] = useState<"detailed" | "simple">("detailed"); 
    
    // ESTADOS DE DADOS
    const [reportData, setReportData] = useState<DetailedReportItem[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isPartner, setIsPartner] = useState(false);
    
    // 🚀 NOVOS ESTADOS DE LOADING
    const [isLoading, setIsLoading] = useState(false); // Para o botão Buscar
    const [isSavingStatus, setIsSavingStatus] = useState(false); // Para o botão Salvar Status
    const [isTogglingActivate, setIsTogglingActivate] = useState(false); // Para o botão Inativar/Ativar

    const { toast } = useToast();

    // ESTADOS DO MODAL DE EDIÇÃO DE STATUS (Ação Principal da Página)
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null); // Armazena o registro completo
    const [statusUpdate, setStatusUpdate] = useState<{
        timeRecordId: string;
        employeeId: string;
        statusRecord: string;
    }>({
        timeRecordId: "",
        employeeId: "",
        statusRecord: "",
    });

       const statusRegistroTips = (
    <>
   <h1 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary"/> Instruções
                  </h1>
        <br />
        <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary  "></div>
              <span  className=" animate-pulse"> Alteração de Status</span>
        </h4>
        <ul className="list-disc list-inside text-xs space-y-2 text-muted-foreground ml-2">
            <li>
                Para corrigir o status de um dia, selecione as datas, o funcionário e o status atual no filtro.
            </li>
        <li>
                Após buscar os registros, clique na linha para abrir o modal de edição.
            </li>
            <li>
                O botão Salvar Status no modal será habilitado apenas quando um novo valor for selecionado.
            </li>
            <li>
                Esta tela permite alterar o registro para: FALTA, FOLGA, ABONO.
            </li>
        </ul>
    </>
);

   
    // 1. Busca de Funcionários (Mantida e reutilizada)
    const fetchEmployees = useCallback(async () => {
        try {
                        if (!token) return;

            const decoded = decodeToken(token);
            const userRole = decoded?.role;
            const userId = decoded?.employeeId;
            const userName = decoded?.fullName;

            if (userRole === "PARTNER") {
                setIsPartner(true);
                setEmployees([{ employeeId: userId, fullName: userName }]);
                setSelectedEmployee(userId);
                return;
            } else {
                setIsPartner(false);
            }

            const activeStatus = employeeActive === "active";
            const url = `${API_BASE_URL}employee?active=${activeStatus}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setEmployees(data.employees || []);
                // 💡 CORREÇÃO: Lógica de verificação de funcionário selecionado
                if (!employees.some(emp => emp.employeeId === selectedEmployee) && data.employees.length > 0) {
                    setSelectedEmployee(data.employees[0].employeeId); 
                } else if (!selectedEmployee && data.employees.length > 0) {
                    setSelectedEmployee(data.employees[0].employeeId);
                } else if (!selectedEmployee) {
                    setSelectedEmployee("");
                }
            }
        } catch (error) {
            console.error("Erro ao buscar funcionários:", error);
        }
    }, [employeeActive, selectedEmployee, employees]);

    // 2. Busca de Registros (Lógica de Search Original)
    const handleSearch = async () => {
        if (status.length === 0) {
            toast({
                title: "Erro",
                description: "Selecione pelo menos um status para gerar o relatório.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true); // 🚀 ATIVA O LOADING NO INÍCIO DA BUSCA

        try {
                        if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            // A conversão de data é feita aqui. O RelatorioFiltros lida com a seleção.
            const formattedDates = selectedDates.map(date => {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}-${month}-${year}`; // Formato DD-MM-YYYY
            });

            const requestBody = {
                reference: referenceTime,
                active: isActive,
                // 🚀 CORREÇÃO: Envia a lista de status usando a chave 'statuses' (plural)
                statuses: status, 
                dates: formattedDates,
            };

            const apiUrl = new URL(`${API_BASE_URL}records/report`, window.location.origin);
            if (selectedEmployee) {
                apiUrl.searchParams.append("employeeId", selectedEmployee);
            }

            const response = await fetch(apiUrl.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Erro ao buscar o relatório. Tente novamente mais tarde.");
            }

            const data = await response.json();

            if (data.length === 0) {
                setReportData([]);
                toast({
                    title: "Aviso",
                    description: "Não há registro para as datas selecionadas",
                    variant: "default",
                });
                return;
            }

            setReportData(data);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // 🚀 SCROLL PARA O TOPO APÓS SUCESSO

        } catch (error: any) {
            console.error("Erro na busca:", error);
            toast({
                title: "Erro",
                description: error.message || "Ocorreu um erro ao buscar o relatório.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false); // 🚀 DESATIVA O LOADING NO FINAL
        }
    };

    // 3. Handlers do Modal
    const handleEditRecord = (record: DetailedReportItem) => {
        // Captura os IDs e o status atual para o modal de edição de status
        const recordId = String(record.timeRecordId); // Garante que é string
        const empId = selectedEmployee; // Usa o funcionário do filtro

        setSelectedRecord(record); // Guarda o registro completo

        setStatusUpdate({
            timeRecordId: recordId,
            employeeId: empId,
            statusRecord: record.statusRecord,
        });

        setEditModalOpen(true);
    };

    // 4. Função para atualizar apenas o status do registro (Mantida)
    const handleUpdateStatus = async () => {
        const { timeRecordId, employeeId, statusRecord } = statusUpdate;

        if (!statusRecord) {
            toast({ title: "Erro", description: "Selecione um status para atualizar.", variant: "destructive" });
            return;
        }
        if (!timeRecordId || !employeeId) {
            toast({ title: "Erro", description: "Dados de registro incompletos. Verifique se um funcionário foi selecionado no filtro.", variant: "destructive" });
            return;
        }
        
        setIsSavingStatus(true); // 🚀 ATIVA O LOADING DO BOTÃO SALVAR
        
        try {
                        if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            const endpoint = `${API_BASE_URL}records/update/status/${employeeId}/${timeRecordId}`;

            const response = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ statusRecord: statusRecord }),
            });


            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Erro ao atualizar o status do registro.");
            }

            toast({
                title: "Sucesso",
                description: `Status do registro alterado para ${statusOptions.find(s => s.value === statusRecord)?.label || statusRecord}.`,
            });

            setEditModalOpen(false);
            setStatusUpdate({ timeRecordId: "", employeeId: "", statusRecord: "" });

            // Recarrega os dados para mostrar o status atualizado e ROLA PARA O TOPO
            await handleSearch();

        } catch (error: any) {
            console.error("Erro ao atualizar status:", error);
            toast({
                title: "Erro",
                description: error.message || "Ocorreu um erro ao salvar o status.",
                variant: "destructive",
            });
        } finally {
            setIsSavingStatus(false); // 🚀 DESATIVA O LOADING DO BOTÃO SALVAR
        }
    }


    // 5. Função para alternar o status de ativação do registro (Inativar/Ativar)
    const handleToggleActivateRecord = async () => {
        const { timeRecordId, employeeId } = statusUpdate; // Reutiliza os IDs do estado do modal
        const currentAction = selectedRecord?.active ? "Inativar" : "Ativar";

        if (!timeRecordId || !employeeId) {
            toast({ 
                title: "Erro", 
                description: "Dados de registro incompletos para inativação/ativação. Verifique se um funcionário foi selecionado.", 
                variant: "destructive" 
            });
            return;
        }
        
        setIsTogglingActivate(true); // 🚀 ATIVA O LOADING DO BOTÃO TOGGLE

        try {
                        if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            // Endpoint conforme informação do backend: PATCH records/toggle-activate/{employeeId}/{timeRecordId}
            const endpoint = `${API_BASE_URL}records/toggle-activate/${employeeId}/${timeRecordId}`;

            const response = await fetch(endpoint, {
                method: "PUT", 
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Erro ao ${currentAction.toLowerCase()} o registro de ponto.`);
            }

            toast({
                title: "Sucesso",
                description: `Registro de ponto ${currentAction.toLowerCase()} com sucesso.`,
            });

            setEditModalOpen(false);
            
            // Recarrega os dados para mostrar o status atualizado e ROLA PARA O TOPO
            await handleSearch();

        } catch (error: any) {
            console.error(`Erro ao ${currentAction.toLowerCase()} registro:`, error);
            toast({
                title: "Erro",
                description: error.message || `Ocorreu um erro ao ${currentAction.toLowerCase()} o registro.`,
                variant: "destructive",
            });
        } finally {
            setIsTogglingActivate(false); // 🚀 DESATIVA O LOADING DO BOTÃO TOGGLE
        }
    }


    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);
    
    // Funções de Download Mockadas (CSV/PDF) - Não são a função principal desta tela
    const handleDownloadPDF = () => toast({ title: "Funcionalidade de Download", description: "Download de PDF em Status de Registro não é suportado.", variant: "default" });
    const handleDownloadCSV = () => toast({ title: "Funcionalidade de Download", description: "Download de CSV em Status de Registro não é suportado.", variant: "default" });
    
    // A função de mudar o tipo de relatório deve ser nula ou desabilitada
    const setFixedReportType = (type: "detailed" | "simple") => {
        if (type !== "detailed") {
             toast({ title: "Aviso", description: "Esta página só suporta o modo 'Detalhado'.", variant: "default" });
        }
        setReportType("detailed");
    };


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
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                            Alterar Status do Registro
                        </h1>
                        <p className="text-muted-foreground">
                            Pesquise os registros e atualize o status de um dia específico.
                        </p>
                    </div>
                    
                    {/* 💡 INTEGRAÇÃO: Utiliza o componente de resultados modular (TOPO) */}
                    {reportData.length > 0 && (
                        <ResultadosRelatorioDetalhado
                            reportData={reportData}
                            statusFilter={status}
                            referenceTime={referenceTime}
                            selectedDates={selectedDates}
                            onEditRecord={handleEditRecord} // Passa a função de abrir o modal
                            onDownloadPDF={function (): void {
                                throw new Error("Function not implemented.");
                            } } onDownloadCSV={function (): void {
                                throw new Error("Function not implemented.");
                            } }                        />
                    )}
                    
                    {/* 💡 INTEGRAÇÃO: Utiliza o componente de filtros modular (BAIXO) */}
                    <RelatorioFiltros
                        selectedDates={selectedDates}
                        setSelectedDates={setSelectedDates}
                        
                        selectedEmployee={selectedEmployee}
                        setSelectedEmployee={setSelectedEmployee}
                        employeeActive={employeeActive}
                        setEmployeeActive={setEmployeeActive}
                        isActive={isActive}
                        setIsActive={setIsActive}
                        status={status}
                        setStatus={setStatus} 
                        employees={employees}
                        isPartner={isPartner}
                        onSearch={handleSearch}
                        customTips={statusRegistroTips}
                        isLoading={isLoading} // 🚀 PASSANDO O ESTADO DE LOADING
                    />

                    
                    {/* MODAL DE EDIÇÃO DE STATUS (Originalmente mantido) */}
                    <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                       <DialogContent className="w-full max-w-fit max-h-[90vh] overflow-y-auto">
        <DialogHeader>
            <DialogTitle>Alterar Status do Registro</DialogTitle>
            <DialogDescription>
                Atualize o status do registro de ponto selecionado.
            </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
            <Label className="text-base font-semibold text-foreground flex flex-col gap-2">
                Status Atual:
                <Badge
                    // Usa a função de cor do seu utilitário
                    className={`${getStatusColor(statusUpdate.statusRecord)} text-base`}
                >
                    {statusOptions.find(s => s.value === statusUpdate.statusRecord)?.label || statusUpdate.statusRecord}
                </Badge>
            </Label>

            <div className="space-y-2">
                <Label htmlFor="new-status">Novo Status</Label>
                <Select
                    value={statusUpdate.statusRecord}
                    onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, statusRecord: value }))}
                >
                    <SelectTrigger id="new-status" className="h-10 focus:border-primary">
                        <SelectValue placeholder="Selecione um novo status" />
                    </SelectTrigger>
                    <SelectContent>
                    {statusOptions
                            // Filtra apenas para Folga, Falta e Abono, conforme sua regra
                            .filter(opt => ["DAY_OFF", "ABSENCE", "TIME_OFF"].includes(opt.value))
                            .map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">O registro será atualizado com o status selecionado.</p>
            </div>
        </div>

        {/* 💡 AJUSTE DO RODAPÉ APLICADO:
            - flex-col sm:flex-row: Empilha no celular e fica lado a lado em telas maiores.
            - justify-between: Separa os dois grupos de botões.
        */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4">
            {/* Botão de Inativar/Ativar Registro (lado esquerdo) */}
            <Button
                type="button"
                variant="destructive"
                onClick={handleToggleActivateRecord}
                disabled={!statusUpdate.timeRecordId || !statusUpdate.employeeId || isTogglingActivate} // 🚀 Desabilita se estiver carregando
                className="w-full sm:w-auto" 
            >
                {isTogglingActivate ? ( // 🚀 MOSTRA SPINNER
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                    <ZapOff className="h-4 w-4 mr-2" />
                )}
                
                {isTogglingActivate ? "Aguarde..." : selectedRecord?.active ? "Inativar Registro" : "Ativar Registro"}
            </Button>
            
            {/* Botões de Cancelar/Salvar Status (lado direito) */}
            <div className="flex space-x-2 w-full sm:w-auto justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditModalOpen(false)}
                >
                    Cancelar
                </Button>
                <Button
                    type="button"
                    onClick={handleUpdateStatus}
                    className="bg-primary hover:bg-primary/90"
                    disabled={!statusUpdate.timeRecordId || !statusUpdate.employeeId || !statusUpdate.statusRecord || isSavingStatus} // 🚀 Desabilita se estiver carregando
                >
                    {isSavingStatus ? ( // 🚀 MOSTRA SPINNER
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    
                    {isSavingStatus ? "Salvando..." : "Salvar Status"}
                </Button>
            </div>
        </div>
    </DialogContent>
</Dialog>
                    {/* FIM MODAL DE EDIÇÃO DE STATUS */}
                </main>
            </div>
        </div>
    );
};
export default StatusRegistro;