import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { getPublicPrivacyPolicy, type PublicPrivacyPolicyResponse } from "@/service/public-privacy.service";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";

export default function PrivacyPolicy() {
  const [data, setData] = useState<PublicPrivacyPolicyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <p className="text-muted-foreground">
            Versão {data.version} • Vigente desde {new Date(data.effectiveDate).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6 text-sm text-gray-700">
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
              <CardContent className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {section.content}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 text-sm text-gray-700 space-y-3">
            <p>
              <strong>Seus direitos LGPD:</strong> Você pode acessar, corrigir, deletar, exportar seus dados,
              ou se opor ao tratamento em determinados casos.
            </p>
            <p>
              Para exercer direitos ou fazer solicitações LGPD, use a plataforma ou entre em contato
              pelo encarregado de proteção de dados.
            </p>
            <p className="text-xs text-gray-600">
              Última atualização: {new Date(data.effectiveDate).toLocaleDateString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
