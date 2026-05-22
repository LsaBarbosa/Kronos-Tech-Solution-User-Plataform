import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_PATHS } from "@/config/app-routes";
import {
  listAdminRequests,
  type LgpdRequestAdminListResponse,
  type LgpdRequestStatus,
  type LgpdRequestType,
  type PaginatedResponse,
} from "@/service/lgpd.service";
interface FilterState {
  type?: LgpdRequestType;
  status?: LgpdRequestStatus;
  companyId?: string;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export const AdminLgpdRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LgpdRequestAdminListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<FilterState>({});
  const [searchTerm, setSearchTerm] = useState("");

  const requestTypes: LgpdRequestType[] = [
    "CONFIRM_PROCESSING",
    "ACCESS",
    "CORRECTION",
    "ANONYMIZATION",
    "BLOCKING",
    "DELETION",
    "PORTABILITY",
    "CONSENT_REVOCATION",
    "SHARING_INFORMATION",
  ];

  const statusOptions: LgpdRequestStatus[] = [
    "OPEN",
    "IN_ANALYSIS",
    "WAITING_CONTROLLER",
    "WAITING_LEGAL_REVIEW",
    "COMPLETED",
    "REJECTED",
    "PARTIALLY_COMPLETED",
  ];

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listAdminRequests(
        currentPage,
        pageSize,
        filters.type,
        filters.status,
        filters.companyId
      );
      setRequests(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar solicitações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setCurrentPage(0);
  };

  const getStatusColor = (status: LgpdRequestStatus) => {
    const colors: Record<LgpdRequestStatus, string> = {
      OPEN: "bg-blue-100 text-blue-800",
      IN_ANALYSIS: "bg-yellow-100 text-yellow-800",
      WAITING_CONTROLLER: "bg-orange-100 text-orange-800",
      WAITING_LEGAL_REVIEW: "bg-purple-100 text-purple-800",
      COMPLETED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      PARTIALLY_COMPLETED: "bg-amber-100 text-amber-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: LgpdRequestStatus) => {
    const labels: Record<LgpdRequestStatus, string> = {
      OPEN: "Aberto",
      IN_ANALYSIS: "Em Análise",
      WAITING_CONTROLLER: "Aguardando Controlador",
      WAITING_LEGAL_REVIEW: "Aguardando Revisão Legal",
      COMPLETED: "Concluído",
      REJECTED: "Rejeitado",
      PARTIALLY_COMPLETED: "Parcialmente Concluído",
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: LgpdRequestType) => {
    const labels: Record<LgpdRequestType, string> = {
      CONFIRM_PROCESSING: "Confirmação de Processamento",
      ACCESS: "Acesso aos Dados",
      CORRECTION: "Correção de Dados",
      ANONYMIZATION: "Anonimização",
      BLOCKING: "Bloqueio",
      DELETION: "Exclusão",
      PORTABILITY: "Portabilidade",
      CONSENT_REVOCATION: "Revogação de Consentimento",
      SHARING_INFORMATION: "Compartilhamento de Informação",
    };
    return labels[type] || type;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erro ao Carregar</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={() => fetchRequests()}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Solicitações LGPD</h1>
        <p className="text-muted-foreground">Gerencie as solicitações de conformidade LGPD</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar por nome do funcionário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-2"
          />
          <Select
            value={filters.type || ""}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Solicitação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as Solicitações</SelectItem>
              {requestTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {getTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status || ""}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os Status</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {getStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Funcionário
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Criada em
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Atribuído a
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr
                    key={request.requestId}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {request.employeeFullName}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {request.companyName}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {getTypeLabel(request.type)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(new Date(request.createdAt))}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {request.assignedToName || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(
                            APP_PATHS.lgpdAdminRequestDetails.replace(":requestId", request.requestId)
                          )
                        }
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {currentPage + 1} de {totalPages}
          </p>
          <div className="space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
