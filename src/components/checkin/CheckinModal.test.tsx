import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { CheckinModal } from "./CheckinModal";

vi.mock("@/hooks/useCheckin", () => ({
  useCheckin: () => ({
    closeCheckin: vi.fn(),
    state: {
      isModalOpen: true,
      status: "idle",
      error: null,
      result: null,
    },
  }),
}));

vi.mock("@/components/BiometricConsentGuard", () => ({
  BiometricConsentGuard: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("./CheckinLocationStep", () => ({
  CheckinLocationStep: () => <div>Etapa de localização</div>,
}));

vi.mock("./CheckinCameraStep", () => ({
  CheckinCameraStep: () => <div>Etapa de câmera</div>,
}));

vi.mock("./CheckinConfirmationStep", () => ({
  CheckinConfirmationStep: () => <div>Etapa de confirmação</div>,
}));

vi.mock("./CheckinResult", () => ({
  CheckinResult: () => <div>Resultado</div>,
}));

vi.mock("./CheckinErrorAlert", () => ({
  CheckinErrorAlert: () => <div>Erro</div>,
}));

describe("CheckinModal", () => {
  it("aplica limites responsivos para não ultrapassar a viewport", () => {
    render(<CheckinModal />);

    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("max-h-[calc(100vh-1.5rem)]");
    expect(dialog.className).toContain("w-[calc(100vw-1rem)]");
    expect(dialog.className).toContain("sm:max-h-[calc(100vh-3rem)]");
    expect(dialog.className).toContain("sm:max-w-[520px]");
  });
});
