import CollaboratorCommandCenter from "@/features/collaborators";
import { FaqContextualBlock } from "@/components/faq/FaqContextualBlock";
import { FAQ_SCREEN_KEYS } from "@/constants/faqScreenKeys";

export default function ListaColaboradores() {
  return (
    <>
      <CollaboratorCommandCenter />
      <div className="mobile-container pb-8">
        <FaqContextualBlock screenKey={FAQ_SCREEN_KEYS.EMPLOYEES} className="mt-6" />
      </div>
    </>
  );
}
