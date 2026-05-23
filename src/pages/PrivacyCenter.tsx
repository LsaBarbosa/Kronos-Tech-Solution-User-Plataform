import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Lock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import BiometricConsentCard from "@/components/privacy/BiometricConsentCard";
import LgpdRequestForm from "@/components/privacy/LgpdRequestForm";
import LgpdRequestsList from "@/components/privacy/LgpdRequestsList";
import ConsentHistoryCard from "@/components/privacy/ConsentHistoryCard";
import RevocationInfoCard from "@/components/privacy/RevocationInfoCard";
import DPOContactCard from "@/components/privacy/DPOContactCard";
import PrivacyPolicyCard from "@/components/privacy/PrivacyPolicyCard";
import { exportEmployeeData } from "@/service/lgpd.service";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import { useAuth } from "@/context/AuthContext";

const PrivacyCenter = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();

  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const handleExportData = async () => {
    if (!user?.profile?.employeeId) {
      toast.error("ID do colaborador não disponível.");
      return;
    }

    setIsExporting(true);

    try {
      const blob = await exportEmployeeData(user.profile.employeeId);

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `meus-dados-${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      toast.error(
        getServiceErrorMessage(error, "Erro ao exportar dados. Tente novamente.")
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: 'linear-gradient(-45deg, hsl(var(--black-primary)), hsl(var(--primary)), hsl(var(--black-primary)), hsl(var(--primary)))',
            backgroundSize: '400% 400%',
            animation: 'gradient-flow 15s ease-in-out infinite'
          }}
        />
      </div>

      <Header isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <main className="relative z-10 pt-20 lg:pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">Privacidade e Dados</h1>
            </div>
            <p className="text-muted-foreground">
              Gerenciar seus dados pessoais de acordo com a LGPD
            </p>
          </div>

          <div className="space-y-8">
            {/* Biometric Consent Section */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-1">Consentimento Biométrico</h2>
                <p className="text-sm text-muted-foreground">
                  Controle o seu consentimento para registro de dados biométricos
                </p>
              </div>
              <BiometricConsentCard />
            </section>

            <Separator />

            {/* Data Export Section */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-1">Exportar Meus Dados</h2>
                <p className="text-sm text-muted-foreground">
                  Baixe uma cópia de todos os seus dados pessoais em formato JSON
                </p>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? "Exportando..." : "Exportar Meus Dados"}
                  </Button>
                </CardContent>
              </Card>
            </section>

            <Separator />

            {/* LGPD Requests Section */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-1">Solicitações LGPD</h2>
                <p className="text-sm text-muted-foreground">
                  Envie e acompanhe suas solicitações de direitos sob a LGPD
                </p>
              </div>

              <div className="grid gap-6">
                <LgpdRequestForm onSuccess={() => setRefreshKey((k) => k + 1)} />
                <LgpdRequestsList refreshKey={refreshKey} />
              </div>
            </section>

            <Separator />

            {/* Consent History Section */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-1">Histórico de Termos Aceitos</h2>
                <p className="text-sm text-muted-foreground">
                  Visualize um histórico completo de todos os consentimentos que você forneceu
                </p>
              </div>
              <ConsentHistoryCard />
            </section>

            <Separator />

            {/* Revocation Information Section */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-1">Revogação de Consentimentos</h2>
                <p className="text-sm text-muted-foreground">
                  Entenda como funciona e quais são as consequências da revogação
                </p>
              </div>
              <RevocationInfoCard />
            </section>

            <Separator />

            {/* Privacy Policy Section */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-1">Política de Privacidade</h2>
                <p className="text-sm text-muted-foreground">
                  Leia nossa política completa de privacidade e proteção de dados pessoais
                </p>
              </div>
              <PrivacyPolicyCard />
            </section>

            <Separator />

            {/* DPO Contact Section */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-1">Contato do Encarregado de Dados</h2>
                <p className="text-sm text-muted-foreground">
                  Fale diretamente com nosso Data Protection Officer sobre privacidade
                </p>
              </div>
              <DPOContactCard />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyCenter;
