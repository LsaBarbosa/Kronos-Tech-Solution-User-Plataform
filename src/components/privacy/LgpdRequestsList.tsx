import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listLgpdRequests, type LgpdRequestResponse, type LgpdRequestStatus } from "@/service/lgpd.service";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import { LGPD_REQUEST_TYPE_LABELS, type LgpdRequestType } from "./LgpdRequestForm";

interface LgpdRequestsListProps {
  refreshKey: number;
}

const getStatusBadgeColor = (status: LgpdRequestStatus) => {
  const statusColors: Record<LgpdRequestStatus, string> = {
    OPEN: "bg-blue-100 text-blue-800",
    IN_ANALYSIS: "bg-yellow-100 text-yellow-800",
    WAITING_CONTROLLER: "bg-yellow-100 text-yellow-800",
    WAITING_LEGAL_REVIEW: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    PARTIALLY_COMPLETED: "bg-orange-100 text-orange-800",
  };
  return statusColors[status] || "bg-gray-100 text-gray-800";
};

const getStatusLabel = (status: LgpdRequestStatus): string => {
  const statusLabels: Record<LgpdRequestStatus, string> = {
    OPEN: "Aberto",
    IN_ANALYSIS: "Em análise",
    WAITING_CONTROLLER: "Aguardando controlador",
    WAITING_LEGAL_REVIEW: "Aguardando revisão legal",
    COMPLETED: "Concluído",
    REJECTED: "Rejeitado",
    PARTIALLY_COMPLETED: "Parcialmente concluído",
  };
  return statusLabels[status] || status;
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const LgpdRequestsList = ({ refreshKey }: LgpdRequestsListProps) => {
  const [requests, setRequests] = useState<LgpdRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await listLgpdRequests();
        setRequests(data);
      } catch (err) {
        setError(
          getServiceErrorMessage(err, "Erro ao carregar solicitações LGPD.")
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [refreshKey]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Solicitações LGPD</CardTitle>
          <CardDescription>
            Acompanhe o status de suas solicitações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-muted animate-pulse rounded-md"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle>Minhas Solicitações LGPD</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Solicitações LGPD</CardTitle>
          <CardDescription>
            Acompanhe o status de suas solicitações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhuma solicitação encontrada. Você pode criar uma nova no formulário acima.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minhas Solicitações LGPD</CardTitle>
        <CardDescription>
          Acompanhe o status de suas solicitações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.requestId}
              className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium">
                      {LGPD_REQUEST_TYPE_LABELS[request.requestType as LgpdRequestType]}
                    </h3>
                    <Badge className={getStatusBadgeColor(request.status)}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {request.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">Data de Abertura</p>
                  <p>{formatDate(request.openedAt)}</p>
                </div>
                {request.closedAt && (
                  <div>
                    <p className="font-medium text-foreground">Data de Fechamento</p>
                    <p>{formatDate(request.closedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LgpdRequestsList;
