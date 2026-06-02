import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_PATHS } from "@/config/app-routes";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertCircle, ArrowLeft, LayoutDashboard } from "lucide-react";
import { getPublicPrivacyPolicy, type PublicPrivacyPolicyResponse } from "@/service/public-privacy.service";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";

export default function PrivacyPolicy() {
  const { status, checkSession } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<PublicPrivacyPolicyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showAuthenticatedActions = status === "authenticated";

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await getPublicPrivacyPolicy();
        setData(response);
        setError(null);
      } catch (err) {
        const errorMsg = getServiceErrorMessage(err, "Erro ao carregar política de privacidade");
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (status === "checking") {
      void checkSession();
    }
  }, [checkSession, status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="h-5 w-5" />
              Erro ao Carregar
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-red-700">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{data.title}</h1>
            <p className="text-muted-foreground">
              Versão {data.version} • Vigente desde {new Date(data.effectiveDate).toLocaleDateString("pt-BR")}
            </p>
          </div>

          {showAuthenticatedActions && (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => navigate(APP_PATHS.privacidade)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Privacidade e Dados
              </Button>

              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => navigate(APP_PATHS.dashboard)}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Ir para o Dashboard
              </Button>
            </div>
          )}
        </div>

        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardContent className="pt-6 text-sm text-foreground">
            Esta política descreve como o Kronos coleta, utiliza, armazena e protege seus dados pessoais,
            em conformidade com a Lei Geral de Proteção de Dados (LGPD). Leia atentamente.
          </CardContent>
        </Card>

        <div className="space-y-4">
          {data.sections.map((section, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {section.content}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-green-50 border-green-200 shadow-sm">
          <CardContent className="pt-6 text-sm text-foreground space-y-3">
            <p>
              <strong>Seus direitos LGPD:</strong> Você pode acessar, corrigir, deletar, exportar seus dados,
              ou se opor ao tratamento em determinados casos.
            </p>
            <p>
              Para exercer direitos ou fazer solicitações LGPD, use a plataforma ou entre em contato
              pelo encarregado de proteção de dados.
            </p>
            <p className="text-xs text-muted-foreground">
              Última atualização: {new Date(data.effectiveDate).toLocaleDateString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
