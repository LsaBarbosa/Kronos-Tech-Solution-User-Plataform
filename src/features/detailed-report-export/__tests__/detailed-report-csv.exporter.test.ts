import { describe, expect, it } from "vitest";
import type { DetailedReportItem } from "@/utils/report-utils";
import {
  buildCsvContent,
  buildDetailedReportCsv,
  buildDetailedReportCsvRows,
  CSV_COLUMNS,
  escapeCsvCell,
} from "../detailed-report-csv.exporter";
import type { ReportExportPayload } from "../detailed-report-export.types";

const baseRecord = (overrides: Partial<DetailedReportItem> = {}): DetailedReportItem => ({
  startWork: "01-06-2026",
  startHour: "08:00",
  endWork: "01-06-2026",
  endHour: "17:00",
  hoursWork: "08:00",
  balance: "+00:00",
  statusRecord: "CREATED",
  edited: false,
  active: true,
  employeeId: "emp-1",
  timeRecordId: 100,
  employeeData: {
    employeeName: "Ana Souza",
    companyName: "Kronos Tech",
  },
  ...overrides,
});

const buildPayload = (overrides?: Partial<ReportExportPayload>): ReportExportPayload => ({
  records: overrides?.records ?? [baseRecord()],
  identity: overrides?.identity ?? {
    companyName: "Kronos Tech",
    employeeName: "Ana Souza",
    referenceTime: "08:00",
    isSelfReport: true,
  },
  context: overrides?.context ?? {
    selectedDates: [new Date(2026, 5, 1), new Date(2026, 5, 2)],
    selectedStatuses: [],
    reportActive: true,
    generatedAt: new Date(2026, 5, 16, 10, 30),
  },
});

describe("escapeCsvCell", () => {
  it("preserves commas as plain content (no replacement)", () => {
    expect(escapeCsvCell("Souza, Ana")).toBe("Souza, Ana");
  });

  it("wraps fields containing ; in quotes", () => {
    expect(escapeCsvCell("a;b")).toBe('"a;b"');
  });

  it("doubles inner quotes and wraps in quotes", () => {
    expect(escapeCsvCell('Diz "ola"')).toBe('"Diz ""ola"""');
  });

  it("wraps fields with newlines and preserves them", () => {
    expect(escapeCsvCell("linha1\nlinha2")).toBe('"linha1\nlinha2"');
  });

  it("returns empty for null/undefined", () => {
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(undefined)).toBe("");
  });

  it("protects against CSV injection prefixes (= + - @)", () => {
    expect(escapeCsvCell("=SUM(A1)")).toBe("'=SUM(A1)");
    expect(escapeCsvCell("+1234")).toBe("'+1234");
    expect(escapeCsvCell("-001:30")).toBe("'-001:30");
    expect(escapeCsvCell("@cmd")).toBe("'@cmd");
  });

  it("does not double-protect already-safe content", () => {
    expect(escapeCsvCell("texto comum")).toBe("texto comum");
    expect(escapeCsvCell(42)).toBe("42");
  });
});

describe("buildCsvContent", () => {
  it("emits BOM UTF-8 and CRLF row separator", () => {
    const csv = buildCsvContent([["a", "b"]], ["h1", "h2"]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.includes("\r\n")).toBe(true);
  });

  it("uses ; as separator", () => {
    const csv = buildCsvContent([["a", "b"]], ["h1", "h2"]);
    const headerLine = csv.slice(1).split("\r\n")[0];
    expect(headerLine).toBe("h1;h2");
  });

  it("escapes ; quotes and newlines properly in a row", () => {
    const csv = buildCsvContent(
      [["foo;bar", 'with "quotes"', "line1\nline2"]],
      ["a", "b", "c"]
    );
    expect(csv).toContain(`"foo;bar"`);
    expect(csv).toContain(`"with ""quotes"""`);
    expect(csv).toContain(`"line1\nline2"`);
  });
});

describe("buildDetailedReportCsv", () => {
  it("includes all stable columns in the header", () => {
    const csv = buildDetailedReportCsv(buildPayload());
    const headerLine = csv.slice(1).split("\r\n")[0];
    for (const column of CSV_COLUMNS) {
      expect(headerLine).toContain(column);
    }
  });

  it("uses ; not , as separator (preserving comma in content)", () => {
    const payload = buildPayload({
      records: [
        baseRecord({
          employeeData: {
            employeeName: "Souza, Ana",
            companyName: "Kronos, Tech",
          },
        }),
      ],
    });
    const csv = buildDetailedReportCsv(payload);
    expect(csv).toContain("Souza, Ana");
    expect(csv).toContain("Kronos, Tech");
    // ; should be the separator
    const dataLine = csv.split("\r\n")[1];
    expect(dataLine.split(";").length).toBe(CSV_COLUMNS.length);
  });

  it("marks PENDING rows with empty end/duration fields and balance 00:00", () => {
    const payload = buildPayload({
      records: [baseRecord({ statusRecord: "PENDING", balance: "+02:00" })],
    });
    const rows = buildDetailedReportCsvRows(payload);
    const row = rows[0];
    const indexByColumn = (col: string) => CSV_COLUMNS.indexOf(col as never);
    expect(row[indexByColumn("hora_fim")]).toBe("");
    expect(row[indexByColumn("duracao_hhmm")]).toBe("");
    expect(row[indexByColumn("saldo_hhmm")]).toBe("00:00");
  });

  it("does not export raw lat/lng but indicates if geolocation was captured", () => {
    const payload = buildPayload({
      records: [baseRecord({ latitude: -23.5505, longitude: -46.6333 })],
    });
    const csv = buildDetailedReportCsv(payload);
    expect(csv).not.toContain("-23.5505");
    expect(csv).not.toContain("-46.6333");
    const indexByColumn = (col: string) => CSV_COLUMNS.indexOf(col as never);
    const dataLine = csv.split("\r\n")[1];
    const cells = dataLine.split(";");
    expect(cells[indexByColumn("geolocalizacao_coletada")]).toBe("sim");
  });

  it("emits BOM UTF-8 at the very start", () => {
    const csv = buildDetailedReportCsv(buildPayload());
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("escapes employee names that include ; (no data corruption)", () => {
    const payload = buildPayload({
      records: [
        baseRecord({
          employeeData: {
            employeeName: "Souza; Ana",
            companyName: "Kronos",
          },
        }),
      ],
    });
    const csv = buildDetailedReportCsv(payload);
    expect(csv).toContain('"Souza; Ana"');
  });

  it("protects formula-leading employee names with apostrophe", () => {
    const payload = buildPayload({
      records: [
        baseRecord({
          employeeData: {
            employeeName: "=cmd()",
            companyName: "Kronos",
          },
        }),
      ],
    });
    const csv = buildDetailedReportCsv(payload);
    expect(csv).toContain("'=cmd()");
  });
});
