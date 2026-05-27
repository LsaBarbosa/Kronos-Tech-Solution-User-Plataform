import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { getPublicProcessingCatalog, type PublicProcessingCatalogResponse } from "@/service/public-privacy.service";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";

export default function PrivacyProcessingCatalog() {
  const [data, setData] = useState<PublicProcessingCatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await getPublicProcessingCatalog();
        setData(response);
        setError(null);
      } catch (err) {
        const errorMsg = getServiceErrorMessage(err, "Erro ao carregar catálogo de tratamento de dados");
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
          <h1 className="text-3xl font-bold">Catálogo de Tratamento de Dados</h1>
          <p className="text-muted-foreground">
            Versão {data.version} • Vigente desde {new Date(data.effectiveDate).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <p className="text-sm text-muted-foreground border-l-4 border-blue-500 pl-4">
          Este catálogo apresenta as atividades de tratamento de dados pessoais realizadas pela plataforma Kronos,
          em conformidade com a Lei Geral de Proteção de Dados (LGPD).
        </p>

        <div className="space-y-4">
          {data.activities.map((activity) => (
            <Card key={activity.code} className="overflow-hidden">
              <CardHeader className="bg-blue-50 pb-3">
                <CardTitle className="text-lg">{activity.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">{activity.code}</p>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-sm">{activity.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Categorias de Dados</h4>
                    <ul className="space-y-1">
                      {activity.dataCategories.map((cat, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{cat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Finalidades</h4>
                    <ul className="space-y-1">
                      {activity.purposes.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Bases Legais</h4>
                    <ul className="space-y-1">
                      {activity.legalBases.map((base, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{base}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Seus Direitos</h4>
                    <ul className="space-y-1">
                      {activity.dataSubjectRights.map((right, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{right}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Retenção de Dados</h4>
                  <p className="text-sm text-gray-600">{activity.retentionPolicy}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6 text-sm text-gray-700 space-y-3">
            <p>
              <strong>Dúvidas sobre seus dados?</strong> Você tem direitos garantidos pela LGPD, incluindo acesso,
              correção, exclusão e portabilidade dos seus dados.
            </p>
            <p>
              Entre em contato através da plataforma ou consulte a{" "}
              <a href="/privacy/policy" className="text-blue-600 hover:underline font-semibold">
                Política de Privacidade
              </a>{" "}
              para mais informações.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
