import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginWithFace } from "@/service/auth.service";
import { registerCheckin } from "@/service/records.service";
import { submitCheckinFace, type CheckinTerminalRequest } from "./checkin-terminal.service";

vi.mock("@/service/auth.service", () => ({
  loginWithFace: vi.fn(),
}));

vi.mock("@/service/records.service", () => ({
  registerCheckin: vi.fn(),
}));

const mockLoginWithFace = vi.mocked(loginWithFace);
const mockRegisterCheckin = vi.mocked(registerCheckin);

describe("checkin-terminal.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("faz login facial e reaproveita a mesma foto para o registro de ponto", async () => {
    const payload: CheckinTerminalRequest = {
      faceImageBase64: "face-payload",
      latitude: -23.55,
      longitude: -46.63,
      accuracy: 18,
      livenessPassed: true,
    };

    mockLoginWithFace.mockResolvedValueOnce();
    mockRegisterCheckin.mockResolvedValueOnce({
      actionType: "CHECKIN",
      message: "Entrada registrada.",
      raw: { actionType: "CHECKIN", message: "Entrada registrada." },
    });

    await expect(submitCheckinFace(payload)).resolves.toMatchObject({
      loginMessage: "Identificação facial realizada com sucesso.",
      recordMessage: "Entrada registrada.",
      actionType: "CHECKIN",
      autoLogoutAfterSeconds: 10,
    });

    expect(mockLoginWithFace).toHaveBeenCalledTimes(1);
    expect(mockLoginWithFace).toHaveBeenCalledWith({
      faceImageBase64: "face-payload",
      livenessPassed: true,
    });
    expect(mockRegisterCheckin).toHaveBeenCalledTimes(1);
    expect(mockRegisterCheckin).toHaveBeenCalledWith({
      faceImageBase64: "face-payload",
      latitude: -23.55,
      longitude: -46.63,
    });
  });
});
