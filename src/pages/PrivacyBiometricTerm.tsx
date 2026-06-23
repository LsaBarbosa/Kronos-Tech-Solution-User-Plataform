import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { APP_PATHS } from "@/config/app-routes";
import { getPublicBiometricTerm, type PublicBiometricTermResponse } from "@/service/public-privacy.service";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";

export default function PrivacyBiometricTerm() {
  const [data, setData] = useState<PublicBiometricTermResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await getPublicBiometricTerm();
        setData(response);
        setError(null);
      } catch (err) {
        const errorMsg = getServiceErrorMessage(err, "Erro ao carregar termo de biometria");
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
        <Link
          to={APP_PATHS.root}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#111827] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para página principal
        </Link>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <p className="text-muted-foreground">
            Versão {data.version} • Vigente desde {new Date(data.effectiveDate).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardContent className="pt-6 text-sm text-foreground">
            Este termo explica como a plataforma Kronos usa biometria facial para autenticação e controle de ponto,
            e os seus direitos sobre esse tratamento de dados sensíveis.
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-base text-amber-900 flex items-center gap-2">
              ⚠️ Informações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-amber-900 space-y-2">
            <p>• O uso de biometria facial é <strong>opcional</strong> e requer seu consentimento explícito.</p>
            <p>• Você pode revogar consentimento a qualquer momento sem perder acesso à plataforma (usando método alternativo).</p>
            <p>• A recusa ou revogação não prejudica direitos existentes.</p>
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

        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardContent className="pt-6 text-sm text-foreground space-y-3">
            <p>
              <strong>Perguntas sobre biometria?</strong> Você pode:
            </p>
            <ul className="space-y-2 ml-4">
              <li>• Solicitar acesso aos dados biométricos que mantemos</li>
              <li>• Solicitar exclusão dos dados biométricos</li>
              <li>• Revogar consentimento a qualquer momento</li>
              <li>• Exercer qualquer direito LGPD</li>
            </ul>
            <p className="mt-3">
              Entre em contato pela plataforma ou com o encarregado de proteção de dados.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
