import type { jsPDF as JsPdfConstructor } from "jspdf";

type CsvCell = string | number | boolean | null | undefined;

const escapeCsvCell = (value: CsvCell) => {
  const normalized = value === null || value === undefined ? "" : String(value);
  const compact = normalized.replace(/\n/g, " ").replace(/,/g, ".");
  return /;/.test(compact) ? `"${compact.replace(/"/g, '""')}"` : compact;
};

export const buildCsvContent = (rows: readonly (readonly CsvCell[])[], headers: readonly string[]) => {
  const csvHeaders = headers.join(";");
  const csvRows = rows.map((row) => row.map(escapeCsvCell).join(";")).join("\n");
  return `\ufeff${csvHeaders}\n${csvRows}`;
};

export const downloadTextFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadCsvFile = (rows: readonly (readonly CsvCell[])[], headers: readonly string[], fileName: string) => {
  downloadTextFile(buildCsvContent(rows, headers), fileName, "text/csv;charset=utf-8;");
};

type PdfLibraries = {
  jsPDF: typeof JsPdfConstructor;
  autoTable: (...args: unknown[]) => void;
};

export const loadPdfLibraries = async (): Promise<PdfLibraries> => {
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const autoTable =
    ("default" in autoTableModule && typeof autoTableModule.default === "function"
      ? autoTableModule.default
      : autoTableModule.autoTable) as (...args: unknown[]) => void;

  return { jsPDF, autoTable };
};
