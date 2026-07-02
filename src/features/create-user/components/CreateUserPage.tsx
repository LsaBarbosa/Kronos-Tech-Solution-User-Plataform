import PageShell from "@/components/PageShell";
import { useCreateUserUnified } from "../hooks/useCreateUserUnified";
import { useCreateUserResponsiveMode } from "../hooks/useCreateUserResponsiveMode";
import { CreateUserDesktop } from "./CreateUserDesktop";
import { CreateUserMobile } from "./CreateUserMobile";

export const CreateUserPage = () => {
  const vm = useCreateUserUnified();
  const { isDesktop } = useCreateUserResponsiveMode();

  return (
    <PageShell mainClassName="pt-20 sm:pt-24 pb-12">
      {isDesktop ? <CreateUserDesktop vm={vm} /> : <CreateUserMobile vm={vm} />}
    </PageShell>
  );
};
