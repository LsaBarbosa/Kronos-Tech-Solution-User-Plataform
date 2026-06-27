import PageShell from "@/components/PageShell";
import { DesktopCreateMessageView } from "@/components/messages/DesktopCreateMessageView";
import { MobileCreateMessageWizard } from "@/components/messages/MobileCreateMessageWizard";
import { useCreateAvisoForm } from "@/hooks/useCreateAvisoForm";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const CriarAviso = () => {
  const form = useCreateAvisoForm();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <PageShell mainClassName="pt-24 sm:pt-32 px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8 relative z-10 overflow-x-hidden bg-[#D9E2EB]">
      <div className="mx-auto w-full max-w-7xl">
        {isDesktop ? <DesktopCreateMessageView form={form} /> : <MobileCreateMessageWizard form={form} />}
      </div>
    </PageShell>
  );
};

export default CriarAviso;
