import {
  buildTimestamp,
  formatBackendDateAsISO,
  formatPeriodLabel,
  getCompetenceLabel,
  getDayOfWeekLabel,
  getEventCategory,
  getStatusLabel,
  parseSignedDurationToMinutes,
  parseUnsignedDurationToMinutes,
  formatMinutesAsHHMM,
  formatMinutesAsSignedHHMM,
} from "./detailed-report-export.helpers";
import type { ReportExportPayload } from "./detailed-report-export.types";

export const CSV_COLUMNS = [
  "competencia",
  "periodo_inicio",
  "periodo_fim",
  "empresa",
  "colaborador",
  "employee_id",
  "time_record_id",
  "data_inicio",
  "dia_semana",
  "hora_inicio",
  "data_fim",
  "hora_fim",
  "duracao_hhmm",
  "saldo_hhmm",
  "status_codigo",
  "status_label",
  "tipo_evento",
  "ativo",
  "editado",
  "documento_id",
  "documento_presente",
  "geolocalizacao_coletada",
] as const;

export type CsvColumn = (typeof CSV_COLUMNS)[number];

const CSV_INJECTION_TRIGGERS = ["=", "+", "-", "@"];

/**
 * Escapa um valor de célula CSV preservando vírgulas, escapando ponto e vírgula,
 * aspas e quebras de linha, e protegendo contra CSV injection.
 *
 * - Vírgulas são preservadas como conteúdo.
 * - `;` força wrap em aspas (já que é o separador).
 * - Aspas internas são dobradas (`"` → `""`).
 * - Quebras de linha forçam wrap em aspas e são preservadas.
 * - Valores iniciando com `=`, `+`, `-`, `@` recebem um apóstrofo na frente para
 *   evitar execução de fórmulas em planilhas (Excel/Google Sheets/LibreOffice).
 */
export const escapeCsvCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const stringified = typeof value === "string" ? value : String(value);

  const safe = CSV_INJECTION_TRIGGERS.some((trigger) => stringified.startsWith(trigger))
    ? `'${stringified}`
    : stringified;

  const needsQuoting = /[;"\n\r]/.test(safe);
  if (!needsQuoting) return safe;

  return `"${safe.replace(/"/g, '""')}"`;
};

const BOM_UTF8 = "﻿";

export const buildCsvContent = (
  rows: readonly (readonly unknown[])[],
  headers: readonly string[]
): string => {
  const csvHeader = headers.map(escapeCsvCell).join(";");
  const csvRows = rows.map((row) => row.map(escapeCsvCell).join(";"));
  const lines = [csvHeader, ...csvRows].join("\r\n");
  return `${BOM_UTF8}${lines}`;
};

const toCsvBoolean = (value: boolean | undefined | null): string =>
  value ? "sim" : "nao";

export const buildDetailedReportCsvRows = (
  payload: ReportExportPayload
): unknown[][] => {
  const competencia = getCompetenceLabel(payload.context.selectedDates);
  const periodoLabel = formatPeriodLabel(payload.context.selectedDates);
  const [periodoInicio, periodoFim] = (() => {
    if (periodoLabel === "—") return ["", ""];
    if (periodoLabel.includes(" a ")) {
      const [start, end] = periodoLabel.split(" a ");
      return [start ?? "", end ?? ""];
    }
    return [periodoLabel, periodoLabel];
  })();

  return payload.records.map((record) => {
    const status = record.statusRecord;
    const isPending = status === "PENDING";
    const workedMinutes = parseUnsignedDurationToMinutes(record.hoursWork);
    const balanceMinutes = parseSignedDurationToMinutes(record.balance);

    return [
      competencia,
      periodoInicio,
      periodoFim,
      record.employeeData?.companyName ?? "",
      record.employeeData?.employeeName ?? "",
      record.employeeId ?? "",
      record.timeRecordId ?? "",
      formatBackendDateAsISO(record.startWork),
      getDayOfWeekLabel(record.startWork),
      isPending ? "" : record.startHour ?? "",
      isPending ? "" : formatBackendDateAsISO(record.endWork),
      isPending ? "" : record.endHour ?? "",
      isPending ? "" : formatMinutesAsHHMM(workedMinutes),
      status === "IMPLICIT_BREAK" || isPending ? "00:00" : formatMinutesAsSignedHHMM(balanceMinutes),
      status ?? "",
      getStatusLabel(status),
      getEventCategory(status),
      toCsvBoolean(record.active),
      toCsvBoolean(record.edited),
      record.documentId ?? "",
      toCsvBoolean(Boolean(record.documentId || record.documentDownloadUrl || record.documentDownloadPath)),
      toCsvBoolean(
        record.latitude !== null && record.latitude !== undefined
          ? true
          : record.longitude !== null && record.longitude !== undefined
            ? true
            : record.endLatitude !== null && record.endLatitude !== undefined
              ? true
              : record.endLongitude !== null && record.endLongitude !== undefined
      ),
    ];
  });
};

export const buildDetailedReportCsv = (payload: ReportExportPayload): string => {
  const rows = buildDetailedReportCsvRows(payload);
  return buildCsvContent(rows, CSV_COLUMNS);
};

export const getCsvFileName = (payload: ReportExportPayload): string =>
  `relatorio_detalhado_${buildTimestamp(payload.context.generatedAt)}.csv`;

export const downloadDetailedReportCsv = (payload: ReportExportPayload): string => {
  const content = buildDetailedReportCsv(payload);
  const fileName = getCsvFileName(payload);
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return fileName;
};
