import { ChevronLeft, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { DesktopCreateMessageView } from "@/components/messages/DesktopCreateMessageView";
import { MobileCreateMessageWizard } from "@/components/messages/MobileCreateMessageWizard";
import { useCreateAvisoForm } from "@/hooks/useCreateAvisoForm";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { APP_PATHS } from "@/config/app-routes";

const CriarAviso = () => {
  const form = useCreateAvisoForm();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <PageShell mainClassName="pt-24 sm:pt-32 px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8 relative z-10 overflow-x-hidden bg-[#D9E2EB]">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <PageHero
          badge="Comunicados internos"
          title="Criar Aviso"
          description="Redija e publique comunicados direcionados a colaboradores ou para toda a plataforma."
          icon={<Megaphone className="h-10 w-10 text-white/80" />}
          primaryAction={
            <Button asChild variant="outline" className="h-11 w-full rounded-2xl border-white/20 bg-white/10 px-4 text-white hover:bg-white/15 hover:text-white">
              <Link to={APP_PATHS.avisos}>
                <ChevronLeft className="h-4 w-4" />
                Voltar aos avisos
              </Link>
            </Button>
          }
        />
        {isDesktop ? <DesktopCreateMessageView form={form} /> : <MobileCreateMessageWizard form={form} />}
      </div>
    </PageShell>
  );
};

export default CriarAviso;
