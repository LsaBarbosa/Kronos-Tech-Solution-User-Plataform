import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";

interface TimeRecord {
  timeRecordId: number;
  startWork: string;
  startHour: string;
  endWork: string;
  endHour: string;
  hoursWork: string;
  balance: string;
  statusRecord: "CREATED" | "ABSENCE" | "DOCTOR_APPOINTMENT" | "PENDING" | "UPDATED" | "UPDATE_REJECTED" | "DAY_OFF" | "PENDING_APPROVAL";
  edited: boolean;
  active: boolean;
}

interface Employee {
  employeeId: string;
  fullName: string;
  maskedCpf: string;
  jobPosition: string;
  email: string;
  salary: number;
  phone: string;
  address: {
    street: string;
    number: string;
    postalCode: string;
    city: string;
    state: string;
  };
  companyName: string;
}

const statusOptions = [
  { value: "CREATED", label: "Criado" },
  { value: "ABSENCE", label: "Ausência" },
  { value: "DOCTOR_APPOINTMENT", label: "Consulta Médica" },
  { value: "PENDING", label: "Pendente" },
  { value: "UPDATED", label: "Atualizado" },
  { value: "UPDATE_REJECTED", label: "Atualização Rejeitada" },
  { value: "DAY_OFF", label: "Folga" },
  { value: "PENDING_APPROVAL", label: "Aguardando Aprovação" },
];

const StatusDoRegistro = () => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [referenceTime, setReferenceTime] = useState("08:00");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<TimeRecord | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [activeModalOpen, setActiveModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<string>("CREATED");
  const [isActive, setIsActive] = useState(true);
  const [status, setStatus] = useState("CREATED");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingActive, setIsSavingActive] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);

  const { toast } = useToast();

  const fetchEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const response = await fetch(`${API_BASE_URL}employee`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar a lista de funcionários.");
      }

      const data = await response.json();
      setEmployees(data.employees);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de funcionários.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDates(prev => {
        const exists = prev.some(d => d.getTime() === date.getTime());
        if (exists) {
          return prev.filter(d => d.getTime() !== date.getTime());
        } else {
          return [...prev, date];
        }
      });
    }
  };

  const handleSearch = async () => {
    if (selectedDates.length === 0 || !selectedEmployee || !status || !referenceTime) {
      toast({
        title: "Erro",
        description: "Por favor, selecione pelo menos uma data, um funcionário, um status e uma referência de tempo.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const formattedDates = selectedDates.map(date => format(date, "dd-MM-yyyy"));
      const requestBody = {
        reference: referenceTime,
        active: isActive,
        status: status,
        dates: formattedDates,
      };

      const apiUrl = new URL(`${API_BASE_URL}records/report`, window.location.origin);
      apiUrl.searchParams.append("employeeId", selectedEmployee);

      const response = await fetch(apiUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar os registros. Tente novamente mais tarde.");
      }

      const data: TimeRecord[] = await response.json();
      setRecords(data);
      toast({
        title: "Busca realizada",
        description: `Foram encontrados ${data.length} registros para o período e critérios selecionados.`,
      });
    } catch (error) {
      console.error("Erro na busca:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao buscar os registros.",
        variant: "destructive",
      });
    }
  };

  const openStatusModal = (record: TimeRecord) => {
    setSelectedRecord(record);
    setEditStatus(record.statusRecord);
    setStatusModalOpen(true);
  };

  const openActiveModal = (record: TimeRecord) => {
    setSelectedRecord(record);
    setIsActive(record.active);
    setActiveModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedRecord || !selectedEmployee) {
      toast({
        title: "Erro",
        description: "Nenhum registro ou funcionário selecionado.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingStatus(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const url = `/api/records/update/status/${selectedEmployee}/${selectedRecord.timeRecordId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statusRecord: editStatus }), // Status no corpo da requisição
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar o status.");
      }

      toast({
        title: "Sucesso",
        description: `Status do registro ${selectedRecord.timeRecordId} atualizado para ${editStatus}.`,
      });

      setStatusModalOpen(false);
      setSelectedRecord(null);
      handleSearch();
    } catch (error) {
      console.error("Erro ao salvar status:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o status do registro.",
        variant: "destructive",
      });
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleSaveActive = async () => {
    if (!selectedRecord || !selectedEmployee) {
      toast({
        title: "Erro",
        description: "Nenhum registro ou funcionário selecionado.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingActive(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const url = `/api/records/toggle-activate/${selectedEmployee}/${selectedRecord.timeRecordId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: isActive }), // Estado de ativo no corpo da requisição
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao ativar/inativar o registro.");
      }

      toast({
        title: "Sucesso",
        description: `Registro ${selectedRecord.timeRecordId} foi ${isActive ? "ativado" : "inativado"}.`,
      });

      setActiveModalOpen(false);
      setSelectedRecord(null);
      handleSearch();
    } catch (error) {
      console.error("Erro ao salvar o estado de ativo:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o estado do registro.",
        variant: "destructive",
      });
    } finally {
      setIsSavingActive(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CREATED":
        return <Badge variant="default">Criado</Badge>;
      case "ABSENCE":
        return <Badge variant="destructive">Ausência</Badge>;
      case "DOCTOR_APPOINTMENT":
        return <Badge variant="secondary">Consulta Médica</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pendente</Badge>;
      case "UPDATED":
        return <Badge variant="default">Atualizado</Badge>;
      case "UPDATE_REJECTED":
        return <Badge variant="destructive">Atualização Rejeitada</Badge>;
      case "DAY_OFF":
        return <Badge variant="outline">Folga</Badge>;
      case "PENDING_APPROVAL":
        return <Badge variant="secondary">Aguardando Aprovação</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="container mx-auto p-6 pt-20 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Status do Registro</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtros de Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-1">
                <Label className="text-sm font-medium">Selecionar Datas</Label>
                <div className="mt-2 border rounded-lg p-3">
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(dates) => setSelectedDates(dates || [])}
                    className="rounded-md border-0 p-0"
                    locale={ptBR}
                  />
                </div>
                {selectedDates.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Datas selecionadas:</Label>
                    <div className="flex flex-wrap gap-1">
                      {selectedDates.map((date, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {format(date, "dd/MM/yyyy", { locale: ptBR })}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reference Time and Employee Select */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <Label htmlFor="reference-time" className="text-sm font-medium">
                    Referência (HH:mm)
                  </Label>
                  <Input
                    id="reference-time"
                    type="time"
                    value={referenceTime}
                    onChange={(e) => setReferenceTime(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Funcionário
                  </Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={isLoadingEmployees ? "Carregando..." : "Selecione um funcionário"} />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.employeeId} value={employee.employeeId}>
                          {employee.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* New status and active filters */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Ativo</Label>
                    <Select value={isActive ? "true" : "false"} onValueChange={(value) => setIsActive(value === "true")}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Ativo</SelectItem>
                        <SelectItem value="false">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSearch} className="w-full" size="lg">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {records.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados da Busca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Data Início</TableHead>
                      <TableHead>Hora Início</TableHead>
                      <TableHead>Data Fim</TableHead>
                      <TableHead>Hora Fim</TableHead>
                      <TableHead>Horas Trabalhadas</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Editado</TableHead>
                        <TableHead>Ativo</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow
                        key={record.timeRecordId}
                        className="hover:bg-muted/50"
                      >
                        <TableCell>{record.timeRecordId}</TableCell>
                        <TableCell>
                          {format(new Date(record.startWork), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>{record.startHour}</TableCell>
                        <TableCell>
                          {format(new Date(record.endWork), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>{record.endHour}</TableCell>
                        <TableCell>{record.hoursWork}</TableCell>
                        <TableCell>
                          <span className={record.balance.startsWith("-") ? "text-destructive" : "text-green-600"}>
                            {record.balance}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(record.statusRecord)}</TableCell>
                        <TableCell>
                          {record.edited ? (
                            <Badge variant="outline">Sim</Badge>
                          ) : (
                            <Badge variant="secondary">Não</Badge>
                          )}
                        </TableCell>
                         <TableCell>
                           {record.active ? (
                             <Badge variant="default">Ativo</Badge>
                           ) : (
                             <Badge variant="destructive">Inativo</Badge>
                           )}
                         </TableCell>
                         <TableCell>
                           <div className="flex gap-2">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => openStatusModal(record)}
                             >
                               Status
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => openActiveModal(record)}
                             >
                               Ativo/Inativo
                             </Button>
                           </div>
                         </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Modal */}
        <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Alterar Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {selectedRecord && (
                <>
                  <div>
                    <Label className="text-sm font-medium">ID do Registro</Label>
                    <div className="text-lg font-semibold text-muted-foreground">
                      {selectedRecord.timeRecordId}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Status do Registro</Label>
                    <Select value={editStatus} onValueChange={(value) => setEditStatus(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                         {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveStatus} className="flex-1" disabled={isSavingStatus}>
                      {isSavingStatus ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setStatusModalOpen(false)}
                      className="flex-1"
                      disabled={isSavingStatus}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Active/Inactive Modal */}
        <Dialog open={activeModalOpen} onOpenChange={setActiveModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ativar/Inativar Registro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {selectedRecord && (
                <>
                  <div>
                    <Label className="text-sm font-medium">ID do Registro</Label>
                    <div className="text-lg font-semibold text-muted-foreground">
                      {selectedRecord.timeRecordId}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Estado do Registro</Label>
                    <RadioGroup
                      value={isActive ? "true" : "false"}
                      onValueChange={(value) => setIsActive(value === "true")}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="active" />
                        <Label htmlFor="active">Ativo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="inactive" />
                        <Label htmlFor="inactive">Inativo</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveActive} className="flex-1" disabled={isSavingActive}>
                      {isSavingActive ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveModalOpen(false)}
                      className="flex-1"
                      disabled={isSavingActive}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StatusDoRegistro;