import UserProfileShell from "@/features/user-profile/components/UserProfileShell";
import { FaqContextualBlock } from "@/components/faq/FaqContextualBlock";
import { FAQ_SCREEN_KEYS } from "@/constants/faqScreenKeys";

const Usuario = () => (
  <>
    <UserProfileShell />
    <div className="mobile-container pb-8">
      <FaqContextualBlock screenKey={FAQ_SCREEN_KEYS.USERS} className="mt-6" />
    </div>
  </>
);

export default Usuario;
