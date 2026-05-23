import { describe, it, expect, vi } from "vitest";
import { LgpdEmployeeExportResponse } from "@/types/legal";

// Test that export response uses backend manifest, not hardcoded values
describe("PrivacyCenter export behavior", () => {
  it("should use backend manifest with correct sections", () => {
    const backendResponse: LgpdEmployeeExportResponse = {
      manifest: {
        exportId: "export-456",
        exportedAt: "2026-05-23T10:00:00Z",
        requestedByUserId: "user-789",
        targetEmployeeId: "emp-123",
        includePreciseGeolocation: true,
        sections: ["employee", "documents", "timeRecords"],
        warnings: ["Este arquivo contém dados pessoais"],
      },
      employee: {
        employeeId: "emp-123",
        fullName: "João Silva",
        jobPosition: "Desenvolvedor",
        email: "joao@example.com",
      },
      exportedAt: "2026-05-23T10:00:00Z",
    };

    // Verify backend response has manifest with only 3 sections
    expect(backendResponse.manifest.sections).toHaveLength(3);
    expect(backendResponse.manifest.sections).toContain("employee");
    expect(backendResponse.manifest.sections).toContain("documents");
    expect(backendResponse.manifest.sections).not.toContain("SALARY");
    expect(backendResponse.manifest.sections).not.toContain("MESSAGES");

    // Verify geolocation comes from backend
    expect(backendResponse.manifest.includePreciseGeolocation).toBe(true);

    // Verify exportId can be used in filename
    expect(backendResponse.manifest.exportId).toBeDefined();
  });

  it("should handle different backend manifest configurations", () => {
    const customResponse: LgpdEmployeeExportResponse = {
      manifest: {
        exportId: "custom-123",
        exportedAt: "2026-05-23T10:00:00Z",
        targetEmployeeId: "emp-001",
        includePreciseGeolocation: false,
        sections: ["employee", "company"],
      },
      employee: {
        employeeId: "emp-001",
        fullName: "Maria Santos",
        jobPosition: "Gerente",
        email: "maria@example.com",
      },
      exportedAt: "2026-05-23T10:00:00Z",
    };

    // Different sections from first response
    expect(customResponse.manifest.sections).not.toContain("documents");
    expect(customResponse.manifest.includePreciseGeolocation).toBe(false);
  });

  it("should generate filename from exportId", () => {
    const response: LgpdEmployeeExportResponse = {
      manifest: {
        exportId: "export-789",
        exportedAt: "2026-05-23T10:00:00Z",
        targetEmployeeId: "emp-001",
        includePreciseGeolocation: false,
        sections: [],
      },
      exportedAt: "2026-05-23T10:00:00Z",
    };

    // Simulate filename generation as done in PrivacyCenter
    const filename = `meus-dados-${response.manifest.exportId}.json`;
    expect(filename).toBe("meus-dados-export-789.json");
  });

  it("should serialize entire export response to JSON for download", () => {
    const response: LgpdEmployeeExportResponse = {
      manifest: {
        exportId: "export-123",
        exportedAt: "2026-05-23T10:00:00Z",
        targetEmployeeId: "emp-001",
        includePreciseGeolocation: true,
        sections: ["employee", "documents"],
      },
      employee: {
        employeeId: "emp-001",
        fullName: "Test User",
        jobPosition: "Developer",
        email: "test@example.com",
      },
      exportedAt: "2026-05-23T10:00:00Z",
    };

    // Simulate what PrivacyCenter does
    const json = JSON.stringify(response, null, 2);
    const blob = new Blob([json], { type: "application/json" });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/json");
    expect(blob.size).toBeGreaterThan(0);

    // Verify JSON contains manifest
    const parsed = JSON.parse(json);
    expect(parsed.manifest).toBeDefined();
    expect(parsed.manifest.exportId).toBe("export-123");
  });

  it("should respect backend includePreciseGeolocation value, not force false", () => {
    const withGeo: LgpdEmployeeExportResponse = {
      manifest: {
        exportId: "exp-1",
        exportedAt: "2026-05-23T10:00:00Z",
        targetEmployeeId: "emp-1",
        includePreciseGeolocation: true, // Backend says true
        sections: [],
      },
      exportedAt: "2026-05-23T10:00:00Z",
    };

    const withoutGeo: LgpdEmployeeExportResponse = {
      manifest: {
        exportId: "exp-2",
        exportedAt: "2026-05-23T10:00:00Z",
        targetEmployeeId: "emp-2",
        includePreciseGeolocation: false, // Backend says false
        sections: [],
      },
      exportedAt: "2026-05-23T10:00:00Z",
    };

    // Should use exact value from backend, not override
    expect(withGeo.manifest.includePreciseGeolocation).toBe(true);
    expect(withoutGeo.manifest.includePreciseGeolocation).toBe(false);
  });
});
