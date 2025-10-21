// src/hooks/useUser.ts

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast"; // Reutiliza seu hook de toast
import { UserAccountData, UserData, ChangePasswordData } from "@/types/user";
import { fetchAccountData, fetchUserData, updateEmail, updatePhone, changePassword } from "@/service/userService";

interface UseUserReturn {
  // Estados de Dados
  userAccountData: UserAccountData | null;
  userData: UserData | null;
  // Estados de UI
  isLoading: boolean;
  isEditingEmail: boolean;
  isEditingPhone: boolean;
  showPasswordFields: boolean;
  // Campos Editáveis
  newEmail: string;
  newPhone: string;
  passwordData: ChangePasswordData;
  // Handlers e Funções
  toggleEditingEmail: () => void;
  toggleEditingPhone: () => void;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveEmail: () => Promise<void>;
  handleSavePhone: () => Promise<void>;
  handleChangePassword: () => Promise<void>;
  togglePasswordFields: () => void;
  refetchUserData: () => void;
}

export const useUser = (): UseUserReturn => {
  const { toast } = useToast();
  const [userAccountData, setUserAccountData] = useState<UserAccountData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Campos de edição e senha
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    newPassword: "",
    confirmNewPassword: "",
  });

  // --- Funções de Busca ---

  const loadUserData = useCallback(async (accountData: UserAccountData) => {
    try {
      const data = await fetchUserData(accountData.employeeId);
      setUserData(data);
      setNewEmail(data.email);
      setNewPhone(data.phone);
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      toast({
        title: "Erro",
        description: (error as Error).message || "Não foi possível carregar os dados detalhados.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadAccountData = useCallback(async () => {
    setIsLoading(true);
    try {
      const account = await fetchAccountData();
      setUserAccountData(account);
      await loadUserData(account);
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
      toast({
        title: "Erro de Autenticação",
        description: (error as Error).message || "Não foi possível carregar os dados da sua conta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, loadUserData]);

  useEffect(() => {
    loadAccountData();
  }, [loadAccountData]);

  // --- Handlers de UI e Edição ---

  const toggleEditingEmail = () => {
    if (isEditingEmail && userData) {
        setNewEmail(userData.email); // Reverte ao valor original ao cancelar
    }
    setIsEditingEmail((prev) => !prev);
  };
  
  const toggleEditingPhone = () => {
    if (isEditingPhone && userData) {
        setNewPhone(userData.phone); // Reverte ao valor original ao cancelar
    }
    setIsEditingPhone((prev) => !prev);
  };

  const togglePasswordFields = () => {
    setShowPasswordFields((prev) => !prev);
    // Limpa os campos ao fechar para segurança
    setPasswordData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewEmail(e.target.value);
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewPhone(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({ ...prev, [id]: value }));
  };

  // --- Handlers de Persistência (Chamadas de Serviço) ---

  const handleSaveEmail = useCallback(async () => {
    if (!userAccountData?.employeeId) return;
    try {
      await updateEmail(userAccountData.employeeId, newEmail);
      setUserData(prev => prev ? { ...prev, email: newEmail } : null);
      setIsEditingEmail(false);
      toast({ title: "Sucesso", description: "E-mail salvo com sucesso.", variant: "default" });
    } catch (error) {
      toast({ title: "Erro ao salvar", description: (error as Error).message, variant: "destructive" });
    }
  }, [userAccountData, newEmail, toast]);

  const handleSavePhone = useCallback(async () => {
    if (!userAccountData?.employeeId) return;
    try {
      await updatePhone(userAccountData.employeeId, newPhone);
      setUserData(prev => prev ? { ...prev, phone: newPhone } : null);
      setIsEditingPhone(false);
      toast({ title: "Sucesso", description: "Telefone salvo com sucesso.", variant: "default" });
    } catch (error) {
      toast({ title: "Erro ao salvar", description: (error as Error).message, variant: "destructive" });
    }
  }, [userAccountData, newPhone, toast]);

  const handleChangePassword = useCallback(async () => {
    try {
      await changePassword(passwordData);
      // Limpa os campos de senha após o sucesso
      setPasswordData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
      setShowPasswordFields(false);
      toast({ title: "Sucesso", description: "Senha alterada com sucesso.", variant: "default" });
    } catch (error) {
      toast({ title: "Erro ao alterar senha", description: (error as Error).message, variant: "destructive" });
    }
  }, [passwordData, toast]);

  const refetchUserData = () => {
    if (userAccountData) {
        loadUserData(userAccountData);
    } else {
        loadAccountData();
    }
  }


  return {
    userAccountData,
    userData,
    isLoading,
    isEditingEmail,
    isEditingPhone,
    showPasswordFields,
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
    refetchUserData,
  };
};