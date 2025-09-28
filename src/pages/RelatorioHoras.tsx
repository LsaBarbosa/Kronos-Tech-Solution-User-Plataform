import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Clock, Users, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface SimpleReportData {
  employeeName: string;
  companyName: string;
  totalHoursWorked: string;
  totalBalance: string;
  days: {
    startDate: string;
    endDate: string;
    totalHours: string;
    balance: string;
  }[];
}

interface DetailedReportData {
  startWork: string;
  endWork: string;
  startHour: string;
  endHour: string;
  hoursWork: string;
  balance: string;
  statusRecord: string;
  employeeData: {
    employeeName: string;
    companyName: string;
  };
}

const statusOptions = [
  { value: "CREATED", label: "Criado" },
  { value: "PENDING", label: "Pendente" },
  { value: "UPDATED", label: "Atualizado" },
  { value: "UPDATE_REJECTED", label: "Atualização Rejeitada" },
  { value: "DAY_OFF", label: "Folga" },
  { value: "ABSENCE", label: "Ausência" },
  { value: "PENDING_APPROVAL", label: "Aguardando Aprovação" },
  { value: "DOCTOR_APPOINTMENT", label: "Consulta Médica" },
];

const mockUsers = [
  { value: "user1", label: "João Silva" },
  { value: "user2", label: "Maria Santos" },
  { value: "user3", label: "Pedro Costa" },
  { value: "user4", label: "Ana Oliveira" },
];

const mockSimpleData: SimpleReportData = {
  employeeName: "João Silva",
  companyName: "Tech Solutions Ltda",
  totalHoursWorked: "176:00",
  totalBalance: "-8:00",
  days: [
    { startDate: "2024-01-01", endDate: "2024-01-01", totalHours: "8:00", balance: "0:00" },
    { startDate: "2024-01-02", endDate: "2024-01-02", totalHours: "7:30", balance: "-0:30" },
    { startDate: "2024-01-03", endDate: "2024-01-03", totalHours: "8:30", balance: "+0:30" },
    { startDate: "2024-01-04", endDate: "2024-01-04", totalHours: "6:00", balance: "-2:00" },
  ]
};

const mockDetailedData: DetailedReportData[] = [
  {
    startWork: "2024-01-01",
    endWork: "2024-01-01",
    startHour: "08:00",
    endHour: "17:00",
    hoursWork: "8:00",
    balance: "0:00",
    statusRecord: "CREATED",
    employeeData: {
      employeeName: "João Silva",
      companyName: "Tech Solutions Ltda"
    }
  },
  {
    startWork: "2024-01-02",
    endWork: "2024-01-02",
    startHour: "08:30",
    endHour: "17:00",
    hoursWork: "7:30",
    balance: "-0:30",
    statusRecord: "PENDING",
    employeeData: {
      employeeName: "João Silva",
      companyName: "Tech Solutions Ltda"
    }
  },
  {
    startWork: "2024-01-03",
    endWork: "2024-01-03",
    startHour: "08:00",
    endHour: "17:30",
    hoursWork: "8:30",
    balance: "+0:30",
    statusRecord: "UPDATED",
    employeeData: {
      employeeName: "João Silva",
      companyName: "Tech Solutions Ltda"
    }
  }
];

const RelatorioHoras = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [reportType, setReportType] = useState<"simple" | "detailed">("simple");
  const [reference, setReference] = useState("");
  const [status, setStatus] = useState("all");
  const [isActive, setIsActive] = useState(true);
  const [reportData, setReportData] = useState<SimpleReportData | DetailedReportData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (reportType === "simple") {
        setReportData(mockSimpleData);
      } else {
        setReportData(mockDetailedData);
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDownload = () => {
    // Simulate download
    console.log("Downloading report...");
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "CREATED":
        return "default";
      case "PENDING":
      case "PENDING_APPROVAL":
        return "secondary";
      case "UPDATE_REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const isNegativeBalance = (balance: string): boolean => {
    return balance.startsWith("-");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 page-title">
            Relatório de Horas
          </h1>
          <p className="text-muted-foreground">
            Gere relatórios detalhados ou simplificados das horas trabalhadas
          </p>
        </div>

        {/* Filters Section */}
        <Card className="mb-8 card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-primary" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* User Selection */}
              <div className="space-y-2">
                <Label htmlFor="user-select" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-primary" />
                  Usuário
                </Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger id="user-select">
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map((user) => (
                      <SelectItem key={user.value} value={user.value}>
                        {user.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Report Type */}
              <div className="space-y-2">
                <Label htmlFor="report-type" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-primary" />
                  Tipo de Relatório
                </Label>
                <Select value={reportType} onValueChange={(value) => setReportType(value as "simple" | "detailed")}>
                  <SelectTrigger id="report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simples</SelectItem>
                    <SelectItem value="detailed">Detalhado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reference Time */}
              <div className="space-y-2">
                <Label htmlFor="reference" className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-primary" />
                  Carga horária diária
                </Label>
                <Input
                  id="reference"
                  type="time"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-select">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status-select">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active/Inactive Toggle */}
              <div className="space-y-2">
                <Label htmlFor="active-toggle" className="flex items-center gap-2">
                  Status do Registro
                </Label>
                <div className="flex items-center space-x-3">
                  <span className={cn("text-sm", !isActive && "text-muted-foreground")}>
                    Inativo
                  </span>
                  <Switch
                    id="active-toggle"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <span className={cn("text-sm", isActive && "text-foreground font-medium")}>
                    Ativo
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading || !selectedUser}
                  className="w-full"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {isLoading ? "Buscando..." : "Buscar"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDownload}
                  disabled={!reportData}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Results */}
        {reportData && (
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>
                Resultado - Relatório {reportType === "simple" ? "Simples" : "Detalhado"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportType === "simple" && Array.isArray(reportData) === false ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Funcionário</div>
                        <div className="text-lg font-semibold">{(reportData as SimpleReportData).employeeName}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Empresa</div>
                        <div className="text-lg font-semibold">{(reportData as SimpleReportData).companyName}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Total Trabalhado</div>
                        <div className="text-lg font-semibold text-orange-primary">{(reportData as SimpleReportData).totalHoursWorked}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Saldo Total</div>
                        <div className={cn(
                          "text-lg font-semibold",
                          isNegativeBalance((reportData as SimpleReportData).totalBalance) 
                            ? "text-red-500" 
                            : "text-green-500"
                        )}>
                          {(reportData as SimpleReportData).totalBalance}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Days List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Detalhes por Dia</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data Início</TableHead>
                            <TableHead>Data Fim</TableHead>
                            <TableHead>Horas Totais</TableHead>
                            <TableHead>Saldo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(reportData as SimpleReportData).days.map((day, index) => (
                            <TableRow key={index}>
                              <TableCell>{day.startDate}</TableCell>
                              <TableCell>{day.endDate}</TableCell>
                              <TableCell>{day.totalHours}</TableCell>
                              <TableCell>
                                <span className={cn(
                                  "font-medium",
                                  isNegativeBalance(day.balance) ? "text-red-500" : "text-green-500"
                                )}>
                                  {day.balance}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              ) : (
                /* Detailed Report */
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Relatório Detalhado</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data Início</TableHead>
                          <TableHead>Data Fim</TableHead>
                          <TableHead>Hora Início</TableHead>
                          <TableHead>Hora Fim</TableHead>
                          <TableHead>Horas Trabalhadas</TableHead>
                          <TableHead>Saldo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Funcionário</TableHead>
                          <TableHead>Empresa</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(reportData as DetailedReportData[]).map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>{record.startWork}</TableCell>
                            <TableCell>{record.endWork}</TableCell>
                            <TableCell>{record.startHour}</TableCell>
                            <TableCell>{record.endHour}</TableCell>
                            <TableCell>{record.hoursWork}</TableCell>
                            <TableCell>
                              <span className={cn(
                                "font-medium",
                                isNegativeBalance(record.balance) ? "text-red-500" : "text-green-500"
                              )}>
                                {record.balance}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(record.statusRecord)}>
                                {statusOptions.find(s => s.value === record.statusRecord)?.label || record.statusRecord}
                              </Badge>
                            </TableCell>
                            <TableCell>{record.employeeData.employeeName}</TableCell>
                            <TableCell>{record.employeeData.companyName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default RelatorioHoras;