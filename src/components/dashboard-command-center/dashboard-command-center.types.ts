import type { WarningMessage } from "@/types/dashboard";
import type { UserData } from "@/types/user";

export interface DashboardCommandCenterData {
  userData: (UserData & { role: string }) | null;
  isLoading: boolean;
  profileUnavailable: boolean;

  roleLabel: string;
  isCto: boolean;
  isManager: boolean;
  isPartner: boolean;

  pendingApprovalsCount: number;
  pendingVacationCount: number;
  pendingTimeOffCount: number;
  totalPendingCount: number;
  countsAreLoading: boolean;
  hasApprovalPermission: boolean;

  newWarnings: WarningMessage[];

  showSalary: boolean;
  toggleSalary: () => void;
  handleWarningClick: () => Promise<void>;
}

export interface DashboardCommandCenterActions {
  goToRelatorio: () => void;
  goToPerfil: () => void;
  goToAvisos: () => void;
  goToCriarAviso: () => void;
  goToEmpresa: () => void;
  goToApuracaoHoras: () => void;
  goToFerias: () => void;
  goToAprovacoesAbono: () => void;
  goToMeusDocumentos: () => void;
  goToDocumentos: () => void;
  goToEnviarDocumentoColaborador: () => void;
  goToSolicitarFerias: () => void;
  goToSolicitarAbono: () => void;
  goToEspelhoPonto: () => void;
  goToDashboard: () => void;
  goToAdministracao: () => void;
}
