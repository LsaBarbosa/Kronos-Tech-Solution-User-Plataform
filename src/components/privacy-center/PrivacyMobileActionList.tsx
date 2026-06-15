import type { ReactNode } from "react";
import { Download, Fingerprint, FilePlus2, History } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BiometricConsentCard from "@/components/privacy/BiometricConsentCard";
import ConsentHistoryCard from "@/components/privacy/ConsentHistoryCard";
import LgpdRequestForm from "@/components/privacy/LgpdRequestForm";
import type { LucideIcon } from "lucide-react";

interface PrivacyMobileActionListProps {
  isExporting: boolean;
  onExport: () => void;
  onRequestSuccess: () => void;
  exportManifestSlot?: ReactNode;
}

interface Action {
  key: string;
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  tone: string;
  body: ReactNode;
}

const PrivacyMobileActionList = ({
  isExporting,
  onExport,
  onRequestSuccess,
  exportManifestSlot,
}: PrivacyMobileActionListProps) => {
  const actions: Action[] = [
    {
      key: "biometric",
      icon: Fingerprint,
      label: "Consentimento",
      title: "Consentimento biométrico",
      description: "Aceite ou revogue o uso da sua biometria.",
      tone: "from-[#0D9488] to-[#22D3EE]",
      body: <BiometricConsentCard />,
    },
    {
      key: "export",
      icon: Download,
      label: "Portabilidade",
      title: "Exportar meus dados",
      description: "Baixe um JSON com os seus dados pessoais.",
      tone: "from-[#1E3A8A] to-[#2563EB]",
      body: (
        <div className="space-y-3">
          <Button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="h-11 w-full gap-1 bg-[#1E3A8A] text-white hover:bg-[#1E40AF]"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Preparando JSON..." : "Exportar JSON"}
          </Button>
          <p className="text-[11px] leading-5 text-[#64748B]">
            A exportação exige confirmação para evitar downloads acidentais.
          </p>
          {exportManifestSlot ? <div>{exportManifestSlot}</div> : null}
        </div>
      ),
    },
    {
      key: "request",
      icon: FilePlus2,
      label: "Direitos LGPD",
      title: "Solicitação LGPD",
      description: "Abra um pedido formal de direito do titular.",
      tone: "from-[#7C3AED] to-[#A855F7]",
      body: <LgpdRequestForm onSuccess={onRequestSuccess} />,
    },
    {
      key: "history",
      icon: History,
      label: "Histórico",
      title: "Histórico de termos",
      description: "Consentimentos concedidos ou revogados.",
      tone: "from-[#F59E0B] to-[#FB923C]",
      body: <ConsentHistoryCard />,
    },
  ];

  return (
    <Accordion type="single" collapsible defaultValue="biometric" className="space-y-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Card key={action.key} className="overflow-hidden border-border/70 shadow-sm">
            <AccordionItem value={action.key} className="border-none">
              <AccordionTrigger
                className="items-center gap-3 px-4 py-3 hover:no-underline"
                aria-label={action.title}
              >
                <div className="flex flex-1 items-center gap-3 text-left">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                      action.tone
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">
                      {action.label}
                    </p>
                    <p className="text-sm font-semibold text-[#0F172A]">{action.title}</p>
                    <p className="text-xs text-[#64748B]">{action.description}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t border-border/60 bg-[#F8FAFC] px-4 py-4">
                {action.body}
              </AccordionContent>
            </AccordionItem>
          </Card>
        );
      })}
    </Accordion>
  );
};

export default PrivacyMobileActionList;
