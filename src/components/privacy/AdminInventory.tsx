import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ChevronRight, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_PATHS } from "@/config/app-routes";
import {
  listActiveInventories,
  type DataProcessingInventoryResponse,
  type PaginatedInventoryResponse,
} from "@/service/inventory.service";

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

export const AdminInventory = () => {
  const navigate = useNavigate();
  const [inventories, setInventories] = useState<DataProcessingInventoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInventories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: PaginatedInventoryResponse = await listActiveInventories(currentPage, pageSize);
      setInventories(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar inventário");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, [currentPage]);

  const filteredInventories = inventories.filter(
    (inv) =>
      inv.processCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.processName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Erro ao Carregar</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={() => fetchInventories()}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Inventário de Tratamento de Dados</h1>
          <p className="text-muted-foreground">Gerencie os processos de tratamento de dados pessoais</p>
        </div>
        <Button
          onClick={() => navigate(APP_PATHS.lgpdAdminInventoryForm)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Processo
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Input
          placeholder="Buscar por código ou nome do processo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredInventories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum processo encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    Dados Sensíveis
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    Transferência Internacional
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Criado em
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventories.map((inventory) => (
                  <tr
                    key={inventory.inventoryId}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-foreground">
                      {inventory.processCode}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {inventory.processName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {inventory.dataCategory}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          inventory.sensitiveData
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {inventory.sensitiveData ? "Sim" : "Não"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          inventory.internationalTransfer
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {inventory.internationalTransfer ? "Sim" : "Não"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(inventory.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(
                            APP_PATHS.lgpdAdminInventoryEdit.replace(":processCode", inventory.processCode)
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
