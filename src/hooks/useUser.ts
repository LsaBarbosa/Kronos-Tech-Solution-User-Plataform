// src/hooks/useUser.ts

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { UserAccountData, UserData, ChangePasswordData, cleanNumberString } from "@/types/user";
import { fetchAccountData, fetchUserData, updateEmail, updatePhone, changePassword } from "@/service/user.Service";

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
  const navigate = useNavigate();
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
    oldPassword: "", // Adicionado para consistência
  });

  // --- Funções de Busca ---

  const loadUserData = useCallback(async (accountData: UserAccountData) => {
    try {
      const data = await fetchUserData(accountData.employeeId);
      setUserData(data);
      setNewEmail(data.email);
      setNewPhone(data.phone);
    } catch (error: any) {
      console.error("Erro ao buscar dados do usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar os dados detalhados.",
        variant: "destructive",
      });
      // Se houver erro de token, o fetchAccountData já deve ter cuidado disso,
      // mas mantemos o erro de dados aqui.
    }
  }, [toast]);

  const loadAccountData = useCallback(async () => {
    setIsLoading(true);
    try {
      const account = await fetchAccountData(); // 💡 Chama o Serviço
      setUserAccountData(account);
      // Se tivermos os dados da conta, buscamos os detalhes do perfil
      if (account.employeeId) {
          await loadUserData(account);
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados iniciais:", error);
      toast({
        title: "Erro de Autenticação",
        description: error.message || "Não foi possível carregar os dados da sua conta.",
        variant: "destructive",
      });
       // Redireciona para o login em caso de falha grave de autenticação
       if (error.message.includes("Token")) navigate("/login");
    } finally {
      setIsLoading(false);
    }
  }, [toast, loadUserData, navigate]);

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
  
  // Limpeza de telefone no input (apenas para números)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = e.target.value; // Manter a máscara no input
      setNewPhone(maskedValue);
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({ ...prev, [id]: value }));
  };

  // --- Handlers de Persistência (Chamadas de Serviço) ---

  const handleSaveEmail = useCallback(async () => {
    if (!userAccountData?.employeeId || !newEmail) return;
    
    // Simples validação de formato
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
        toast({ title: "Erro de Validação", description: "O formato do e-mail é inválido.", variant: "destructive" });
        return;
    }

    try {
      await updateEmail(userAccountData.employeeId, newEmail); // 💡 Chama o Serviço
      
      // Atualiza o estado localmente
      setUserData(prev => prev ? { ...prev, email: newEmail } : null);
      setIsEditingEmail(false);
      toast({ title: "Sucesso", description: "E-mail salvo com sucesso.", variant: "default" });
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  }, [userAccountData, newEmail, toast]);

  const handleSavePhone = useCallback(async () => {
    if (!userAccountData?.employeeId || !newPhone) return;
    
    const cleanPhone = cleanNumberString(newPhone);
    if (cleanPhone.length < 10) {
        toast({ title: "Erro de Validação", description: "O número de telefone está incompleto.", variant: "destructive" });
        return;
    }

    try {
      await updatePhone(userAccountData.employeeId, cleanPhone); // 💡 Chama o Serviço
      
      // Atualiza o estado localmente (manter a string formatada se preferir, ou a API deve retornar a formatada)
      setUserData(prev => prev ? { ...prev, phone: newPhone } : null); 
      setIsEditingPhone(false);
      toast({ title: "Sucesso", description: "Telefone salvo com sucesso.", variant: "default" });
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  }, [userAccountData, newPhone, toast]);

  const handleChangePassword = useCallback(async () => {
    // Validação local de campos obrigatórios e confirmação
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
        toast({ title: "Erro", description: "Preencha todos os campos de senha.", variant: "destructive" });
        return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        toast({ title: "Erro", description: "As novas senhas não coincidem.", variant: "destructive" });
        return;
    }

    try {
      await changePassword(passwordData); // 💡 Chama o Serviço
      
      // Limpa os campos de senha após o sucesso
      setPasswordData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
      setShowPasswordFields(false);
      toast({ title: "Sucesso", description: "Senha alterada com sucesso.", variant: "default" });
    } catch (error: any) {
      toast({ title: "Erro ao alterar senha", description: error.message, variant: "destructive" });
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
