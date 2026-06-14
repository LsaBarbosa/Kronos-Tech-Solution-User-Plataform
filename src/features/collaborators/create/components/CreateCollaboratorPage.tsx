import { useState } from "react";

import { Form } from "@/components/ui/form";
import { useCreateCollaborator } from "@/hooks/useCreateCollaborator";

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

    if (mobileStep === 1) {
      const success = await vm.submitEmployee();
      if (success) {
        setMobileStep(2);
      }
      return;
    }

    const success = await vm.submitUser();
    if (success) {
      setMobileStep(0);
    }
  };

  return (
    <Form {...vm.form}>
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
    </Form>
  );
};

export default CreateCollaboratorPage;
