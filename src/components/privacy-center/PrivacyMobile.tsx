import { useCallback, useState, type ReactNode } from "react";
import { ChevronLeft, Mail, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DPOContactCard from "@/components/privacy/DPOContactCard";
import PrivacyPolicyCard from "@/components/privacy/PrivacyPolicyCard";
import DataProcessingCatalogCard from "@/components/privacy/DataProcessingCatalogCard";
import RevocationInfoCard from "@/components/privacy/RevocationInfoCard";
import PrivacyHero from "./PrivacyHero";
import PrivacyMetricStrip from "./PrivacyMetricStrip";
import PrivacyMobileActionList from "./PrivacyMobileActionList";
import PrivacyRecentRequests from "./PrivacyRecentRequests";
import PrivacyStickyActionBar from "./PrivacyStickyActionBar";

interface PrivacyMobileProps {
  userName?: string;
  totalRights: number;
  totalRequests: number;
  isLoadingRequests: boolean;
  refreshKey: number;
  isExporting: boolean;
  onExport: () => void;
  onRequestSuccess: () => void;
  onBack: () => void;
  exportManifestSlot?: ReactNode;
  nextActionLabel: string;
}

const REQUEST_ITEM_ID = "nova-solicitacao-lgpd";

const PrivacyMobile = ({
  userName,
  totalRights,
  totalRequests,
  isLoadingRequests,
  refreshKey,
  isExporting,
  onExport,
  onRequestSuccess,
  onBack,
  exportManifestSlot,
  nextActionLabel,
}: PrivacyMobileProps) => {
  const [openItem, setOpenItem] = useState<string>("biometric");

  const handleScrollToRequest = useCallback(() => {
    setOpenItem("request");
    requestAnimationFrame(() => {
      const target = document.getElementById(REQUEST_ITEM_ID);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-36">
      <div className="flex">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="h-10 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
        >
          <ChevronLeft className="h-4 w-4" />
          Início
        </Button>
      </div>

      <PrivacyHero variant="mobile" userName={userName} />

      <PrivacyMetricStrip
        variant="mobile"
        totalRights={totalRights}
        totalRequests={totalRequests}
        isLoadingRequests={isLoadingRequests}
      />

      <PrivacyMobileActionList
        isExporting={isExporting}
        onExport={onExport}
        onRequestSuccess={onRequestSuccess}
        exportManifestSlot={exportManifestSlot}
        openValue={openItem}
        onOpenValueChange={setOpenItem}
        requestItemId={REQUEST_ITEM_ID}
      />

      <PrivacyRecentRequests refreshKey={refreshKey} />

      <Card className="overflow-hidden border-[#0D9488]/40 bg-[#F0FDFA] shadow-sm">
        <CardContent className="space-y-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#CCFBF1] text-[#0F766E]"
            >
              <Mail className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0F766E]">
                DPO e política
              </p>
              <p className="text-sm font-semibold text-[#0F172A]">Transparência e contato</p>
            </div>
          </div>
          <DPOContactCard />
          <PrivacyPolicyCard />
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="space-y-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEE2E2] text-[#B91C1C]"
            >
              <ShieldAlert className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">
                Governança
              </p>
              <p className="text-sm font-semibold text-[#0F172A]">Catálogo e revogação</p>
            </div>
          </div>
          <DataProcessingCatalogCard />
          <RevocationInfoCard />
        </CardContent>
      </Card>

      <PrivacyStickyActionBar
        nextActionLabel={nextActionLabel}
        isExporting={isExporting}
        onExport={onExport}
        onNewRequest={handleScrollToRequest}
      />
    </div>
  );
};

export default PrivacyMobile;
