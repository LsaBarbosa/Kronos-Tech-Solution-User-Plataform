import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import {
  composeSessionProfile,
  loadSessionProfile,
} from "./session-profile.service";

describe("session-profile.service", () => {
  it("monta uma sessao composta a partir da conta e do perfil", () => {
    const session = composeSessionProfile(
      {
        userId: "u-1",
        username: "maria",
        role: "MANAGER",
        active: true,
        employeeId: "emp-1",
      },
      {
        employeeId: "emp-1",
        fullName: "Maria Silva",
        maskedCpf: "123.***.***-01",
        jobPosition: "Analista",
        email: "maria@exemplo.com",
        salary: 4000,
        phone: "11999999999",
        address: {
          street: "Rua A",
          number: "10",
          postalCode: "01001000",
          city: "Sao Paulo",
          state: "SP",
        },
        companyName: "Kronos",
        lastSeenMessageTimestamp: null,
        homeOffice: false,
        role: "PARTNER",
      }
    );

    expect(session.role).toBe("MANAGER");
    expect(session.userData.role).toBe("MANAGER");
    expect(session.userData.fullName).toBe("Maria Silva");
    expect(session.accountData.username).toBe("maria");
  });

  it("carrega conta e perfil detalhado do backend", async () => {
    server.use(
      http.get("*/users/own-profile", () =>
        HttpResponse.json({
          userId: "u-1",
          username: "maria",
          role: "PARTNER",
          active: true,
          employeeId: "emp-1",
        })
      ),
      http.get("*/employee/own-profile", () =>
        HttpResponse.json({
          employeeId: "emp-1",
          fullName: "Maria Silva",
          maskedCpf: "123.***.***-01",
          jobPosition: "Analista",
          email: "maria@exemplo.com",
          salary: 4000,
          phone: "11999999999",
          address: {
            street: "Rua A",
            number: "10",
            postalCode: "01001000",
            city: "Sao Paulo",
            state: "SP",
          },
          companyName: "Kronos",
          lastSeenMessageTimestamp: null,
          homeOffice: false,
        })
      )
    );

    await expect(loadSessionProfile()).resolves.toMatchObject({
      role: "PARTNER",
      accountData: {
        username: "maria",
      },
      profileData: {
        fullName: "Maria Silva",
      },
    });
  });
});
