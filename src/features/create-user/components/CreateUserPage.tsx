import { useCreateUserUnified } from "../hooks/useCreateUserUnified";
import { useCreateUserResponsiveMode } from "../hooks/useCreateUserResponsiveMode";
import { CreateUserDesktop } from "./CreateUserDesktop";
import { CreateUserMobile } from "./CreateUserMobile";

export const CreateUserPage = () => {
  const vm = useCreateUserUnified();
  const { isDesktop } = useCreateUserResponsiveMode();

  if (isDesktop) {
    return <CreateUserDesktop vm={vm} />;
  }

  return <CreateUserMobile vm={vm} />;
};
