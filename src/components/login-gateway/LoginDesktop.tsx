import LoginForm from "@/components/LoginForm";
import LoginBrandPanel from "./LoginBrandPanel";
import LoginSessionAlert from "./LoginSessionAlert";

const LoginDesktop = () => {
  return (
    <div className="grid min-h-screen grid-cols-[minmax(0,1fr)_minmax(0,1fr)] bg-[#F8FAFC]">
      <LoginBrandPanel />

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-4">
          <LoginSessionAlert />
          <LoginForm />
          <p className="text-center text-[11px] text-[#94A3B8]">
            Ao continuar, você concorda com a política de privacidade e termos de uso.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginDesktop;
