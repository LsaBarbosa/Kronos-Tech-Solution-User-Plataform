import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, ShieldAlert, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getDataProcessingCatalog } from "@/service/lgpd.service";
import type { DataProcessingPurpose, LegalBasis } from "@/types/legal";
import { legalBasisLabels } from "@/types/legal";
import { getServiceErrorMessage, ServiceError } from "@/service/helpers/service-error.helper";

const DataProcessingCatalogCard = () => {
  const [catalog, setCatalog] = useState<DataProcessingPurpose[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<string | null>(null);

  const getLegalBasisLabel = (basis: string | undefined) => {
    if (!basis) return "Sem base legal";
    return legalBasisLabels[basis as LegalBasis] || basis;
  };

  const loadCatalog = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setErrorKind(null);
      const data = await getDataProcessingCatalog();
      setCatalog(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = getServiceErrorMessage(
        err,
        "Erro ao carregar o catálogo de processamento de dados. Tente novamente."
      );
      setError(errorMessage);
      setCatalog([]);

      // Capture error kind for UI differentiation
      if (err instanceof ServiceError) {
        // Differentiate between 401 (auth error) and 403 (permission denied)
        if (err.status === 401) {
          setErrorKind("auth");
        } else if (err.status === 403) {
          setErrorKind("forbidden");
        } else {
          setErrorKind(err.kind);
        }
      } else {
        setErrorKind("unknown");
      }
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
    let title = "Não foi possível carregar o catálogo";
    let description = error;

    // Customize message based on error kind
    if (errorKind === "auth") {
      title = "Sessão expirada";
      description = "Por favor, faça login novamente para visualizar o catálogo de processamento de dados.";
    } else if (errorKind === "notFound") {
      title = "Catálogo não encontrado";
      description = "O catálogo de processamento de dados não está disponível no momento.";
    } else if (errorKind === "http") {
      title = "Erro ao carregar catálogo";
      description = "Ocorreu um erro temporário. Tente novamente em alguns instantes.";
    }

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <div className="flex-1">
          <AlertDescription className="font-medium">
            {title}
          </AlertDescription>
          <AlertDescription className="text-sm mt-1 text-destructive/90">
            {description}
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
              <CheckCircle2 className="h-8 w-8 text-primary opacity-60" />
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

        <Card className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 border-border">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Total de Itens
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {catalog.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary opacity-60" />
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
                    : "border-border"
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
                      {getLegalBasisLabel(item.legalBasis)}
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

      {/* Evidential Data Note */}
      <Alert variant="default" className="border-primary/20 bg-blue-50 dark:bg-blue-950">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          <p className="font-medium mb-1">Sobre registros de consentimento:</p>
          <p className="text-sm">
            Os registros dos seus consentimentos podem ser preservados para fins de conformidade jurídica e validação de direitos.
            Isso ocorre mesmo quando você revoga um consentimento, conforme permitido por lei.
          </p>
        </AlertDescription>
      </Alert>

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
