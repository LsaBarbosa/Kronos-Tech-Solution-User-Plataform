import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserAccountData, UserData, ChangePasswordData, cleanNumberString } from "@/types/user";
import { fetchCurrentUserData, updateEmail, updatePhone, changePassword } from "@/service/user.Service";

interface UseUserReturn {
  userAccountData: UserAccountData | null;
  userData: UserData | null;
  isLoading: boolean;
  isEditingEmail: boolean;
  isEditingPhone: boolean;
  showPasswordFields: boolean;
  isSavingPassword: boolean;
  newEmail: string;
  newPhone: string;
  passwordData: ChangePasswordData;
  toggleEditingEmail: () => void;
  toggleEditingPhone: () => void;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveEmail: () => Promise<void>;
  handleSavePhone: () => Promise<void>;
  handleChangePassword: () => Promise<void>;
  togglePasswordFields: () => void;
}

export const useUser = (): UseUserReturn => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { clearSession } = useAuth();

  const [userAccountData, setUserAccountData] = useState<UserAccountData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    newPassword: "",
    confirmPassword: "",
    currentPassword: "",
  });

  const isSessionError = useCallback((error: unknown) => {
    if (!(error instanceof Error)) return false;
    return error.message.includes("Status 401") || error.message.includes("Status 403");
  }, []);

  const handleSessionFailure = useCallback(() => {
    clearSession();
    navigate("/login");
  }, [clearSession, navigate]);

  const loadUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { account, profile } = await fetchCurrentUserData();

      setUserAccountData(account);
      setUserData(profile);
      setNewEmail(profile.email);
      setNewPhone(profile.phone);

      toast({
        title: "Dados carregados com sucesso",
        description: "Informações do usuário atualizadas.",
      });
    } catch (error) {
      toast({
        title: "Erro de Autenticação",
        description: "Sessão expirada ou falha ao buscar dados. Redirecionando para login.",
        variant: "destructive",
      });

      if (isSessionError(error)) {
        handleSessionFailure();
        return;
      }

      handleSessionFailure();
    } finally {
      setIsLoading(false);
    }
  }, [toast, isSessionError, handleSessionFailure]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const toggleEditingEmail = useCallback(() => {
    setIsEditingEmail((prev) => {
      if (prev && userData) {
        setNewEmail(userData.email);
      }
      return !prev;
    });
  }, [userData]);

  const toggleEditingPhone = useCallback(() => {
    setIsEditingPhone((prev) => {
      if (prev && userData) {
        setNewPhone(userData.phone);
      }
      return !prev;
    });
  }, [userData]);

  const togglePasswordFields = useCallback(() => {
    setShowPasswordFields((prev) => !prev);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(e.target.value);
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/\D/g, "").slice(0, 11);
    setNewPhone(sanitizedValue);
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveEmail = useCallback(async () => {
    if (!newEmail.trim() || !userAccountData) {
      toast({ title: "Erro", description: "O e-mail não pode ser vazio.", variant: "destructive" });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      toast({ title: "Erro", description: "O e-mail inserido não é válido.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await updateEmail(userAccountData.employeeId, newEmail);
      setUserData((prev) => (prev ? { ...prev, email: newEmail } : null));
      setIsEditingEmail(false);
      toast({ title: "Sucesso", description: "E-mail atualizado.", variant: "default" });
    } catch (error: any) {
      if (isSessionError(error)) {
        handleSessionFailure();
        return;
      }

      toast({
        title: "Erro ao salvar e-mail",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [newEmail, userAccountData, toast, isSessionError, handleSessionFailure]);

  const handleSavePhone = useCallback(async () => {
    if (!newPhone.trim() || !userAccountData) {
      toast({ title: "Erro", description: "O telefone não pode ser vazio.", variant: "destructive" });
      return;
    }

    const cleanedPhone = cleanNumberString(newPhone);
    if (cleanedPhone.length !== 11) {
      toast({ title: "Erro", description: "O telefone deve conter 11 dígitos (DD + 9xxxx-xxxx).", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await updatePhone(userAccountData.employeeId, newPhone);
      setUserData((prev) => (prev ? { ...prev, phone: newPhone } : null));
      setIsEditingPhone(false);
      toast({ title: "Sucesso", description: "Telefone atualizado.", variant: "default" });
    } catch (error: any) {
      if (isSessionError(error)) {
        handleSessionFailure();
        return;
      }

      toast({
        title: "Erro ao salvar telefone",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [newPhone, userAccountData, toast, isSessionError, handleSessionFailure]);

  const handleChangePassword = useCallback(async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({ title: "Erro", description: "Preencha todos os campos de senha.", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Erro", description: "As novas senhas não coincidem.", variant: "destructive" });
      return;
    }

    setIsSavingPassword(true);

    try {
      await changePassword(passwordData);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordFields(false);
      toast({ title: "Sucesso", description: "Senha alterada com sucesso.", variant: "default" });
    } catch (error: any) {
      if (isSessionError(error)) {
        handleSessionFailure();
        return;
      }

      toast({ title: "Erro ao alterar senha", description: error.message, variant: "destructive" });
    } finally {
      setIsSavingPassword(false);
    }
  }, [passwordData, toast, isSessionError, handleSessionFailure]);

  return {
    userAccountData,
    userData,
    isLoading,
    isEditingEmail,
    isEditingPhone,
    showPasswordFields,
    isSavingPassword,
    newEmail,
    newPhone,
    passwordData,
    toggleEditingEmail,
    toggleEditingPhone,
    handleEmailChange,
    handlePhoneChange,
    handlePasswordChange,
    handleSaveEmail,
    handleSavePhone,
    handleChangePassword,
    togglePasswordFields,
  };
};
