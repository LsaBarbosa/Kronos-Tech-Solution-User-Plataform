import type { ComponentType } from "react";
import {
  Users,
  ClipboardList,
  FileText,
  Calendar,
  FolderOpen,
  Clock,
} from "lucide-react";
import { APP_PATHS } from "@/config/app-routes";

interface DashboardIconProps {
  className?: string;
}

export interface DashboardCardConfig {
  icon: ComponentType<DashboardIconProps>;
  title: string;
  value: string;
  description: string;
  tone: "purple" | "blue" | "cyan" | "success" | "warning" | "danger";
  route: string;
  ariaLabel: string;
}

type Role = "MANAGER" | "PARTNER" | string;

type CardSlot = DashboardCardConfig | "keep-default" | null;

export interface DashboardCardsLayout {
  card1: CardSlot;
  card2: CardSlot;
  card3: CardSlot;
  card4: CardSlot;
}

export const getDashboardCardsLayoutByRole = (role: Role): DashboardCardsLayout => {
  switch (role) {
    case "MANAGER":
      return {
        card1: {
          icon: Users,
          title: "Colaboradores",
          value: "Equipe",
          description: "Gerencie colaboradores da empresa",
          tone: "blue",
          route: APP_PATHS.listaColaboradores,
          ariaLabel: "Acessar lista de colaboradores",
        },
        card2: "keep-default",
        card3: {
          icon: ClipboardList,
          title: "Registros",
          value: "Status",
          description: "Consulte o status dos registros de ponto",
          tone: "cyan",
          route: APP_PATHS.statusDoRegistro,
          ariaLabel: "Consultar status dos registros",
        },
        card4: {
          icon: FileText,
          title: "Documentos",
          value: "Enviar",
          description: "Envie documentos para colaboradores",
          tone: "purple",
          route: APP_PATHS.enviarDocumentoColaborador,
          ariaLabel: "Enviar documentos para colaboradores",
        },
      };

    case "PARTNER":
      return {
        card1: {
          icon: Calendar,
          title: "Abono",
          value: "Solicitar",
          description: "Solicite abono ou correção de jornada",
          tone: "purple",
          route: APP_PATHS.solicitarAbono,
          ariaLabel: "Solicitar abono ou correção de jornada",
        },
        card2: {
          icon: FolderOpen,
          title: "Documentos",
          value: "Meus arquivos",
          description: "Consulte seus documentos enviados",
          tone: "blue",
          route: APP_PATHS.documentos,
          ariaLabel: "Consultar seus documentos",
        },
        card3: "keep-default",
        card4: {
          icon: Clock,
          title: "Espelho de ponto",
          value: "Consultar",
          description: "Acesse seu espelho de ponto",
          tone: "blue",
          route: APP_PATHS.espelhoPonto,
          ariaLabel: "Acessar seu espelho de ponto",
        },
      };

    default:
      return {
        card1: null,
        card2: null,
        card3: null,
        card4: null,
      };
  }
};
