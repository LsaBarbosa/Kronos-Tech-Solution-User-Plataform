import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, ShieldAlert, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getDataProcessingCatalog } from "@/service/lgpd.service";
import { DataProcessingPurpose } from "@/types/legal";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";

const DataProcessingCatalogCard = () => {
  const [catalog, setCatalog] = useState<DataProcessingPurpose[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDataProcessingCatalog();
      setCatalog(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = getServiceErrorMessage(
        err,
        "Erro ao carregar o catálogo de processamento de dados. Tente novamente."
      );
      setError(errorMessage);
      setCatalog([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 animate-spin" />
            Carregando catálogo...
          </CardTitle>
          <CardDescription>Aguarde enquanto buscamos os dados de processamento</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <div className="flex-1">
          <AlertDescription className="font-medium">
            Não foi possível carregar o catálogo
          </AlertDescription>
          <AlertDescription className="text-sm mt-1 text-destructive/90">
            {error}
          </AlertDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadCatalog}
          className="ml-auto"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Tentar novamente
        </Button>
      </Alert>
    );
  }

  if (!Array.isArray(catalog) || catalog.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catálogo vazio</CardTitle>
          <CardDescription>
            Nenhuma categoria de processamento de dados configurada
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Nenhum item de processamento de dados disponível no momento.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Por favor, contate o administrador se este for um erro.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeCatalog = catalog.filter((item) => item.active);
  const sensitiveItems = catalog.filter((item) => item.sensitive);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Categorias Ativas
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                  {activeCatalog.length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Dados Sensíveis
                </p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">
                  {sensitiveItems.length}
                </p>
              </div>
              <ShieldAlert className="h-8 w-8 text-orange-600 dark:text-orange-400 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Total de Itens
                </p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                  {catalog.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como Usamos Seus Dados</CardTitle>
          <CardDescription>
            Descrição completa de todas as categorias de dados que processamos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Abaixo você encontra todas as categorias de dados pessoais que coletamos, processamos e armazenamos.
              Cada categoria está associada a uma base legal específica conforme a Lei Geral de Proteção de Dados (LGPD).
            </p>
            <p className="mt-4">
              <strong>Base Legal:</strong> Indica a justificativa legal para o processamento dos seus dados pessoais.
            </p>
            <p>
              <strong>Política de Retenção:</strong> Define por quanto tempo seus dados são mantidos no nosso sistema.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Processing Items */}
      <div className="space-y-3">
        {catalog.map((item) => {
          if (!item?.code) return null;

          return (
            <Card
              key={item.code}
              className={`transition-all ${
                !item.active
                  ? "opacity-60 bg-muted"
                  : item.sensitive
                    ? "border-orange-200 dark:border-orange-800"
                    : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Code & Description */}
                  <div className="md:col-span-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {item.code?.replace(/_/g, " ") || "Item"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.purpose || "Sem descrição"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {item.active && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs font-medium">
                              <CheckCircle2 className="h-3 w-3" />
                              Ativo
                            </span>
                          )}
                          {item.sensitive && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 rounded text-xs font-medium">
                              <ShieldAlert className="h-3 w-3" />
                              Sensível
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category & Legal Basis */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Categoria
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {item.dataCategory?.replace(/_/g, " ") || "Sem categoria"}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-3">
                      Base Legal
                    </p>
                    <p className="text-sm font-medium mt-1 text-primary">
                      {item.legalBasis?.replace(/_/g, " ") || "Sem base"}
                    </p>
                  </div>

                  {/* Retention Policy */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Política de Retenção
                    </p>
                    <p className="text-sm font-medium mt-1 font-mono">
                      {item.retentionPolicyCode?.replace(/_/g, " ") || "Sem política"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer Note */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Este catálogo é atualizado regularmente. Para mais informações sobre privacidade e direitos LGPD,
          entre em contato com o nosso Encarregado de Proteção de Dados (DPO).
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DataProcessingCatalogCard;
