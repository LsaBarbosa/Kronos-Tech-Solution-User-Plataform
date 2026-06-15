import { BookOpen, Mail, ScrollText, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import DataProcessingCatalogCard from "@/components/privacy/DataProcessingCatalogCard";
import RevocationInfoCard from "@/components/privacy/RevocationInfoCard";
import PrivacyPolicyCard from "@/components/privacy/PrivacyPolicyCard";
import DPOContactCard from "@/components/privacy/DPOContactCard";
import { cn } from "@/lib/utils";

interface PrivacyGovernancePanelProps {
  className?: string;
}

const sections = [
  {
    key: "catalog",
    label: "Catálogo de tratamento",
    description: "Finalidade, base legal, retenção e sensibilidade dos dados tratados.",
    icon: BookOpen,
    tone: "from-[#7C3AED] to-[#A855F7]",
    render: () => <DataProcessingCatalogCard />,
  },
  {
    key: "revocation",
    label: "Revogação de consentimentos",
    description: "Entenda como funciona e quais as consequências de revogar consentimentos.",
    icon: ShieldAlert,
    tone: "from-[#DC2626] to-[#F97316]",
    render: () => <RevocationInfoCard />,
  },
  {
    key: "policy",
    label: "Política de privacidade",
    description: "Política completa de privacidade e proteção de dados pessoais.",
    icon: ScrollText,
    tone: "from-[#1E3A8A] to-[#2563EB]",
    render: () => <PrivacyPolicyCard />,
  },
  {
    key: "dpo",
    label: "Contato DPO",
    description: "Fale com o Data Protection Officer sobre privacidade e direitos LGPD.",
    icon: Mail,
    tone: "from-[#0D9488] to-[#22D3EE]",
    render: () => <DPOContactCard />,
  },
];

const PrivacyGovernancePanel = ({ className }: PrivacyGovernancePanelProps) => {
  return (
    <Card className={cn("border-border/70 shadow-sm", className)}>
      <div className="border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Governança e transparência
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">
          Catálogo, política, revogação e DPO
        </h2>
      </div>
      <div className="space-y-4 px-5 py-5">
        {sections.map(({ key, label, description, icon: Icon, tone, render }) => (
          <div key={key} className="rounded-2xl border border-border/60 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-start gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                  tone
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">
                  {label}
                </p>
                <p className="text-xs leading-5 text-[#64748B]">{description}</p>
              </div>
            </div>
            {render()}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PrivacyGovernancePanel;
