import { useCallback, useEffect, useState } from "react";
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
import { LGPD_REQUEST_TYPE_LABELS, LGPD_REQUEST_TYPES } from "@/constants/lgpd.constants";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import {
  listAdminRequests,
  type LgpdRequestAdminListResponse,
  type LgpdRequestStatus,
  type LgpdRequestType,
} from "@/service/lgpd.service";

const ALL_SELECT_VALUE = "__ALL__";

interface FilterState {
  type?: LgpdRequestType;
  status?: LgpdRequestStatus;
  companyId?: string;
}

const formatDate = (dateString?: string | null): string => {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getTypeLabel = (type?: string | null): string => {
  if (!type) {
    return "—";
  }

  return LGPD_REQUEST_TYPE_LABELS[type as LgpdRequestType] ?? type;
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

  const statusOptions: LgpdRequestStatus[] = [
    "OPEN",
    "IN_ANALYSIS",
    "WAITING_CONTROLLER",
    "WAITING_LEGAL_REVIEW",
    "APPROVED_FOR_EXPORT",
    "WAITING_DATA_SUBJECT",
    "COMPLETED",
    "REJECTED",
    "PARTIALLY_COMPLETED",
    "CANCELLED",
  ];

  const fetchRequests = useCallback(async () => {
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
      setRequests(Array.isArray(data.content) ? data.content : []);
      setTotalPages(typeof data.totalPages === "number" ? data.totalPages : 0);
    } catch (err) {
      setRequests([]);
      setTotalPages(0);
      setError(getServiceErrorMessage(err, "Erro ao carregar solicitações LGPD."));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleTypeChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      type: value === ALL_SELECT_VALUE ? undefined : (value as LgpdRequestType),
    }));
    setCurrentPage(0);
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === ALL_SELECT_VALUE ? undefined : (value as LgpdRequestStatus),
    }));
    setCurrentPage(0);
  };

  const getStatusColor = (status?: string | null) => {
    if (!status) {
      return "bg-gray-100 text-gray-800";
    }

    const colors: Record<string, string> = {
      OPEN: "bg-blue-100 text-blue-800",
      IN_ANALYSIS: "bg-yellow-100 text-yellow-800",
      WAITING_CONTROLLER: "bg-orange-100 text-orange-800",
      WAITING_LEGAL_REVIEW: "bg-purple-100 text-purple-800",
      APPROVED_FOR_EXPORT: "bg-emerald-100 text-emerald-800",
      WAITING_DATA_SUBJECT: "bg-indigo-100 text-indigo-800",
      COMPLETED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      PARTIALLY_COMPLETED: "bg-amber-100 text-amber-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status?: string | null) => {
    if (!status) {
      return "—";
    }

    const labels: Record<string, string> = {
      OPEN: "Aberto",
      IN_ANALYSIS: "Em Análise",
      WAITING_CONTROLLER: "Aguardando Controlador",
      WAITING_LEGAL_REVIEW: "Aguardando Revisão Legal",
      APPROVED_FOR_EXPORT: "Aprovado para Exportação",
      WAITING_DATA_SUBJECT: "Aguardando Sujeito de Dados",
      COMPLETED: "Concluído",
      REJECTED: "Rejeitado",
      PARTIALLY_COMPLETED: "Parcialmente Concluído",
      CANCELLED: "Cancelado",
    };
    return labels[status] || status;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar solicitações</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={() => fetchRequests()}>Tentar novamente</Button>
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
            value={filters.type ?? ALL_SELECT_VALUE}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Solicitação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SELECT_VALUE}>Todas as Solicitações</SelectItem>
              {LGPD_REQUEST_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {getTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status ?? ALL_SELECT_VALUE}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SELECT_VALUE}>Todos os Status</SelectItem>
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
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request, index) => (
                  <tr
                    key={request.requestId ?? index}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {request.employeeFullName || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {request.companyName || "—"}
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
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {request.assignedToName || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Ver detalhes da solicitação ${request.requestId}`}
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
