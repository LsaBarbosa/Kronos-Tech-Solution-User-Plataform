import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatureGrid } from "@/components/landing/LandingFeatureGrid";
import { LandingTimeManagement } from "@/components/landing/LandingTimeManagement";
import { LandingPeopleDocuments } from "@/components/landing/LandingPeopleDocuments";
import { LandingLegalFiscal } from "@/components/landing/LandingLegalFiscal";
import { LandingLgpdSecurity } from "@/components/landing/LandingLgpdSecurity";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function CommercialLanding() {
  return (
    <div className="min-h-screen">
      <LandingHeader darkBg />
      <main>
        <LandingHero />
        <LandingFeatureGrid />
        <LandingTimeManagement />
        <LandingPeopleDocuments />
        <LandingLegalFiscal />
        <LandingLgpdSecurity />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
