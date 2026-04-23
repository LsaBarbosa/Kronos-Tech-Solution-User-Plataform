import { describe, expect, it } from "vitest";
import {
  extractArray,
  extractObject,
  mapArrayPayload,
  mapUserProfile,
} from "../response-normalizer.helper";

describe("response-normalizer.helper", () => {
  it("extrai array direto", () => {
    expect(extractArray([{ id: 1 }, { id: 2 }])).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("extrai array dentro de envelope conhecido", () => {
    expect(extractArray({ employees: [{ employeeId: "1" }] })).toEqual([
      { employeeId: "1" },
    ]);
  });

  it("extrai objeto simples ou envelope data", () => {
    expect(extractObject({ id: 1, name: "Kronos" })).toEqual({
      id: 1,
      name: "Kronos",
    });
    expect(extractObject({ data: { id: 2 } })).toEqual({ id: 2 });
  });

  it("mapeia perfil de usuario com campos faltando", () => {
    expect(mapUserProfile({ data: { userId: "u-1", name: "Ana" } })).toEqual({
      userId: "u-1",
      employeeId: "",
      fullName: "Ana",
      email: "",
      role: "",
    });
  });

  it("mapeia lista envelopada para objeto de front", () => {
    expect(
      mapArrayPayload(
        { companies: [{ id: "c-1", name: "Kronos" }] },
        (company: { id: string; name: string }) => ({
          companyId: company.id,
          label: company.name,
        })
      )
    ).toEqual([{ companyId: "c-1", label: "Kronos" }]);
  });
});
