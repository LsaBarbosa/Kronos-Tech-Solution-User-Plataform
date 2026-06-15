import LoginDesktop from "./LoginDesktop";
import LoginMobile from "./LoginMobile";
import { useLoginResponsiveMode } from "./useLoginResponsiveMode";

const LoginGateway = () => {
  const { isDesktop } = useLoginResponsiveMode();
  return isDesktop ? <LoginDesktop /> : <LoginMobile />;
};

export default LoginGateway;
