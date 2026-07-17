import { useNavigate } from "react-router-dom";
import { APP_PATHS } from "@/config/app-routes";
import { useCollaboratorsCommandCenter } from "../hooks/useCollaboratorsCommandCenter";
import { useCollaboratorsResponsiveMode } from "../hooks/useCollaboratorsResponsiveMode";
import CollaboratorDesktopView from "./CollaboratorDesktopView";
import CollaboratorMobileView from "./CollaboratorMobileView";
import { CreateAccessModal } from "./CreateAccessModal";

export const CollaboratorCommandCenter = () => {
  const viewModel = useCollaboratorsCommandCenter();
  const { isDesktop } = useCollaboratorsResponsiveMode();
  const navigate = useNavigate();

  const goToCreateCollaborator = () => navigate(APP_PATHS.criarColaborador);
  const goToDashboard = () => navigate(APP_PATHS.dashboard);

  return (
    <>
      {isDesktop ? (
        <CollaboratorDesktopView
          viewModel={viewModel}
          onCreateCollaborator={goToCreateCollaborator}
          onGoHome={goToDashboard}
        />
      ) : (
        <CollaboratorMobileView
          viewModel={viewModel}
          onCreateCollaborator={goToCreateCollaborator}
          onGoHome={goToDashboard}
        />
      )}

      {viewModel.createAccessTarget && (
        <CreateAccessModal
          open={!!viewModel.createAccessTarget}
          employeeId={viewModel.createAccessTarget.employeeId}
          employeeName={viewModel.createAccessTarget.fullName}
          onClose={viewModel.clearCreateAccess}
          onSuccess={() => {
            viewModel.clearCreateAccess();
            void viewModel.refresh();
          }}
        />
      )}
    </>
  );
};

export default CollaboratorCommandCenter;
