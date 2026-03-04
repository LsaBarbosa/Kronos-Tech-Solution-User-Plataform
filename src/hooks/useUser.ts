// src/hooks/useUser.ts

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserAccountData, UserData, ChangePasswordData, cleanNumberString } from "@/types/user"; // Assumindo cleanNumberString está em types/user
import { 
    fetchAccountData, 
    fetchUserData, 
    updateEmail, 
    updatePhone, 
    changePassword 
} from "@/service/user.Service";

/**
 * Interface para o retorno do hook useUser.
 * Expõe todos os dados, estados de UI e funções de manipulação.
 */
interface UseUserReturn {
  // Estados de Dados
  userAccountData: UserAccountData | null;
  userData: UserData | null;
  // Estados de UI
  isLoading: boolean;
  isEditingEmail: boolean;
  isEditingPhone: boolean;
  showPasswordFields: boolean;
  isSavingPassword: boolean; // NOVO: Loading do salvamento de senha
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
}

export const useUser = (): UseUserReturn => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { clearSession } = useAuth();

  // --- ESTADOS PRINCIPAIS ---
  const [userAccountData, setUserAccountData] = useState<UserAccountData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- ESTADOS DE EDIÇÃO E FORMULÁRIOS ---
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  
  // NOVO: Estado para gerenciar o loading da alteração de senha
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Campos de edição e senha
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

  // --- FUNÇÕES DE CARREGAMENTO ---

  const loadUserData = useCallback(async (accountData: UserAccountData) => {
    try {
      // Busca dados detalhados do funcionário usando o employeeId
      const employeeResponse = await fetchUserData(accountData.employeeId);
      
      // Inicializa os campos de edição com os dados atuais
      setNewEmail(employeeResponse.email || "");
      setNewPhone(employeeResponse.phone || "");

      // Combina e define os dados do usuário
      setUserData({ ...employeeResponse, role: accountData.role });

      toast({
        title: "Dados carregados com sucesso",
        description: "Informações do usuário atualizadas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: `Não foi possível carregar as informações detalhadas.`,
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadAccountData = useCallback(async () => {
    try {
      const accountData = await fetchAccountData();
      setUserAccountData(accountData);
      await loadUserData(accountData); // Carrega dados detalhados após a conta
    } catch (error) {
      toast({
        title: "Erro de Autenticação",
        description: `Sessão expirada ou falha ao buscar dados. Redirecionando para login.`,
        variant: "destructive",
      });
      if (isSessionError(error)) {
        handleSessionFailure();
        return;
      }

      handleSessionFailure();
    }
  }, [loadUserData, toast, isSessionError, handleSessionFailure]);

  // EFEITO: Carrega dados na montagem
  useEffect(() => {
    loadAccountData();
  }, [loadAccountData]);

  // --- HANDLERS DE UI ---

  const toggleEditingEmail = useCallback(() => {
    setIsEditingEmail((prev) => {
      // Ao cancelar, reseta para o valor original
      if (prev && userData) {
        setNewEmail(userData.email || "");
      }
      return !prev;
    });
  }, [userData]);

  const toggleEditingPhone = useCallback(() => {
    setIsEditingPhone((prev) => {
      // Ao cancelar, reseta para o valor original
      if (prev && userData) {
        setNewPhone(userData.phone || "");
      }
      return !prev;
    });
  }, [userData]);
  
  const togglePasswordFields = useCallback(() => {
      setShowPasswordFields(prev => !prev);
      // Limpa o formulário ao fechar
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }, []);


  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(e.target.value);
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Permite apenas números e limita a 11 dígitos (DD + 9xxxx-xxxx)
    const sanitizedValue = e.target.value.replace(/\D/g, '').slice(0, 11);
    setNewPhone(sanitizedValue);
  }, []);

const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    // 💡 IMPORTANTE: Usa o ID como chave (que deve ser 'confirmNewPassword')
    setPasswordData(prev => ({ ...prev, [id]: value })); 
  };
  // --- HANDLERS DE SALVAMENTO (API) ---

  const handleSaveEmail = useCallback(async () => {
    if (!newEmail.trim() || !userAccountData) {
      toast({ title: "Erro", description: "O e-mail não pode ser vazio.", variant: "destructive" });
      return;
    }
    
    // Simples validação de formato de e-mail (opcional, pode ser mais robusta)
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      toast({ title: "Erro", description: "O e-mail inserido não é válido.", variant: "destructive" });
      return;
    }

    setIsLoading(true); // Usa o loading geral para edições de contato
    try {
      await updateEmail(userAccountData.employeeId, newEmail);
      
      // Atualiza o estado local com o novo email formatado
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
          variant: "destructive" 
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

    setIsLoading(true); // Usa o loading geral para edições de contato
    try {
      await updatePhone(userAccountData.employeeId, newPhone);
      
      // Atualiza o estado local com o novo telefone
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
          variant: "destructive" 
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

    setIsSavingPassword(true);// INÍCIO DO LOADING ESPECÍFICO DE SENHA

    try {
      await changePassword(passwordData); // Chama o Serviço de API
      
      // Limpa os campos de senha após o sucesso
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
      setIsSavingPassword(false); // <--- FIM DO LOADING
    }
  }, [passwordData, toast, isSessionError, handleSessionFailure]);

  return {
    userAccountData,
    userData,
    isLoading,
    isEditingEmail,
    isEditingPhone,
    showPasswordFields,
    isSavingPassword, // NOVO: Exportado
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
