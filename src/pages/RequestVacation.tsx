import { VacationRequestShell } from "@/features/vacation-request/components/VacationRequestShell";
import { FaqContextualBlock } from "@/components/faq/FaqContextualBlock";
import { FAQ_SCREEN_KEYS } from "@/constants/faqScreenKeys";

export default function RequestVacation() {
  return (
    <>
      <VacationRequestShell />
      <div className="mobile-container pb-8">
        <FaqContextualBlock screenKey={FAQ_SCREEN_KEYS.VACATION} className="mt-6" />
      </div>
    </>
  );
}
