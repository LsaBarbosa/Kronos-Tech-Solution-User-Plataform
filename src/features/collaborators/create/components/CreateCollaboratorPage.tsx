import { useState } from "react";

import { Form } from "@/components/ui/form";
import Header from "@/components/Header";
import { useCreateCollaborator } from "@/hooks/useCreateCollaborator";
import { FaqContextualBlock } from "@/components/faq/FaqContextualBlock";
import { FAQ_SCREEN_KEYS } from "@/constants/faqScreenKeys";

import { useCreateCollaboratorResponsiveMode } from "../hooks/useCreateCollaboratorResponsiveMode";
import CreateCollaboratorDesktop from "./CreateCollaboratorDesktop";
import CreateCollaboratorMobile from "./CreateCollaboratorMobile";

const CreateCollaboratorPage = () => {
  const vm = useCreateCollaborator();
  const { isDesktop } = useCreateCollaboratorResponsiveMode();
  const [mobileStep, setMobileStep] = useState(0);

  const handlePrimaryAction = async () => {
    if (mobileStep === 0) {
      setMobileStep(1);
      return;
    }

    await vm.submitEmployee();
  };

  return (
    <Form {...vm.form}>
      <Header />
      <div className="pt-16">
        {isDesktop ? (
          <CreateCollaboratorDesktop vm={vm} />
        ) : (
          <CreateCollaboratorMobile
            vm={vm}
            activeStep={mobileStep}
            onStepChange={setMobileStep}
            onPrimaryAction={handlePrimaryAction}
          />
        )}
      </div>
      <FaqContextualBlock screenKey={FAQ_SCREEN_KEYS.EMPLOYEES} className="mt-6 px-4" />
    </Form>
  );
};

export default CreateCollaboratorPage;
