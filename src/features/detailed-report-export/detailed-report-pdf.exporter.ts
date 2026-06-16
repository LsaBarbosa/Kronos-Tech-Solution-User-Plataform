import type { jsPDF as JsPdfConstructor } from "jspdf";
import {
  CATEGORY_LABEL,
  aggregateReportTotals,
  buildTimestamp,
  formatBackendDateAsBR,
  formatGeneratedAt,
  formatMinutesAsHHMM,
  formatMinutesAsSignedHHMM,
  formatPeriodLabel,
  getCompetenceLabel,
  getDayOfWeekLabel,
  getStatusLabel,
  isHolidayDate,
  parseSignedDurationToMinutes,
  parseUnsignedDurationToMinutes,
} from "./detailed-report-export.helpers";
import type {
  ReportExportPayload,
  ReportTotals,
} from "./detailed-report-export.types";

type PdfLibraries = {
  jsPDF: typeof JsPdfConstructor;
  autoTable: (...args: unknown[]) => void;
};

const loadPdfLibraries = async (): Promise<PdfLibraries> => {
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = (
    "default" in autoTableModule && typeof autoTableModule.default === "function"
      ? autoTableModule.default
      : autoTableModule.autoTable
  ) as (...args: unknown[]) => void;
  return { jsPDF, autoTable };
};

const COLORS = {
  midnight: [11, 18, 32] as [number, number, number],
  midnightDeep: [16, 26, 51] as [number, number, number],
  deepBlue: [30, 58, 138] as [number, number, number],
  primaryBlue: [37, 99, 235] as [number, number, number],
  cyan: [34, 211, 238] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  greenSoft: [220, 252, 231] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
  amberSoft: [254, 243, 199] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  redSoft: [254, 226, 226] as [number, number, number],
  purple: [124, 58, 237] as [number, number, number],
  purpleSoft: [237, 233, 254] as [number, number, number],
  teal: [13, 148, 136] as [number, number, number],
  tealSoft: [204, 251, 241] as [number, number, number],
  surfaceLight: [248, 250, 252] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  textPrimary: [15, 23, 42] as [number, number, number],
  textSecondary: [100, 116, 139] as [number, number, number],
  textTertiary: [148, 163, 184] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
} as const;

const PAGE = {
  marginX: 14,
  marginTopAfterHeader: 50,
  contentWidth: 182, // A4 width 210mm minus 14mm * 2 margins
} as const;

const setFill = (doc: JsPDF, rgb: readonly [number, number, number]) => {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
};
const setText = (doc: JsPDF, rgb: readonly [number, number, number]) => {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
};
const setDraw = (doc: JsPDF, rgb: readonly [number, number, number]) => {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
};

type JsPDF = InstanceType<typeof JsPdfConstructor>;

interface DocWithAutoTable extends JsPDF {
  lastAutoTable?: { finalY: number };
}

const drawHeaderBand = (doc: JsPDF, payload: ReportExportPayload) => {
  // Faixa institucional escura no topo
  setFill(doc, COLORS.midnight);
  doc.rect(0, 0, 210, 22, "F");

  // Linha ciano técnica abaixo
  setFill(doc, COLORS.cyan);
  doc.rect(0, 22, 210, 1.2, "F");

  setText(doc, COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("KRONOS · Relatório Detalhado de Ponto", PAGE.marginX, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setText(doc, [203, 213, 225]);
  doc.text(
    "Modelo visual · orientado a contabilidade",
    PAGE.marginX,
    17
  );

  doc.setFontSize(8);
  setText(doc, COLORS.white);
  doc.text(
    `Gerado em: ${formatGeneratedAt(payload.context.generatedAt)}`,
    210 - PAGE.marginX,
    17,
    { align: "right" }
  );
};

const drawIdentification = (doc: JsPDF, payload: ReportExportPayload) => {
  const { identity, context, records } = payload;
  const titleY = 32;
  setText(doc, COLORS.textPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Relatório Detalhado de Ponto", PAGE.marginX, titleY);

  setText(doc, COLORS.textSecondary);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Apuração mensal para fechamento contábil e folha de pagamento.",
    PAGE.marginX,
    titleY + 5
  );

  const competencia = getCompetenceLabel(context.selectedDates);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  setText(doc, COLORS.textPrimary);
  const competLabel = `Competência ${competencia.charAt(0).toUpperCase()}${competencia.slice(1)}`;
  doc.text(competLabel, 210 - PAGE.marginX, titleY, { align: "right" });

  // Card de identificação (3 colunas × 3 linhas)
  const cardY = titleY + 9;
  const cardHeight = 42;
  setFill(doc, COLORS.surfaceLight);
  setDraw(doc, COLORS.border);
  doc.roundedRect(PAGE.marginX, cardY, PAGE.contentWidth, cardHeight, 2, 2, "FD");

  const colWidth = PAGE.contentWidth / 3;
  const employeeName = identity.employeeName || records[0]?.employeeData?.employeeName || "—";
  const companyName = identity.companyName || records[0]?.employeeData?.companyName || "—";

  const drawLabelValue = (
    label: string,
    value: string,
    x: number,
    y: number,
    maxWidth: number
  ) => {
    setText(doc, COLORS.textSecondary);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(label.toUpperCase(), x + 4, y + 4);
    setText(doc, COLORS.textPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    const wrapped = doc.splitTextToSize(value || "—", maxWidth - 8) as string[];
    const limited = wrapped.slice(0, 2); // até 2 linhas
    limited.forEach((line, index) => {
      doc.text(line, x + 4, y + 9 + index * 4.5);
    });
  };

  const formatRoleLabel = (role?: string | null): string => {
    if (!role) return "Sessão atual";
    const map: Record<string, string> = {
      MANAGER: "Administrador",
      CTO: "CTO",
      PARTNER: "Colaborador",
    };
    return map[role] ?? role;
  };

  // Linha 1 — Empresa ocupa 2 colunas (mais espaço para nome) e Jornada fica na 3ª
  drawLabelValue("Empresa", companyName, PAGE.marginX, cardY, colWidth * 2);
  drawLabelValue(
    "Jornada diária",
    `${identity.referenceTime}/dia`,
    PAGE.marginX + colWidth * 2,
    cardY,
    colWidth
  );

  // Linha 2
  drawLabelValue("Colaborador", employeeName, PAGE.marginX, cardY + 14, colWidth);
  drawLabelValue(
    "CPF",
    identity.employeeMaskedCpf || "Não disponível no relatório atual",
    PAGE.marginX + colWidth,
    cardY + 14,
    colWidth
  );
  drawLabelValue(
    "Cargo",
    identity.employeeJobPosition || "Não disponível no relatório atual",
    PAGE.marginX + colWidth * 2,
    cardY + 14,
    colWidth
  );

  // Linha 3 — Período + Gerado por (escopo removido)
  drawLabelValue(
    "Período",
    formatPeriodLabel(context.selectedDates),
    PAGE.marginX,
    cardY + 28,
    colWidth
  );
  drawLabelValue(
    "Gerado por",
    context.generatedByUsername
      ? `${context.generatedByUsername} · ${formatRoleLabel(context.role)}`
      : formatRoleLabel(context.role),
    PAGE.marginX + colWidth,
    cardY + 28,
    colWidth * 2
  );
};

const drawAccountingSummary = (
  doc: JsPDF,
  payload: ReportExportPayload,
  totals: ReportTotals
): number => {
  const baseY = 90;
  setText(doc, COLORS.textPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Resumo para contabilidade", PAGE.marginX, baseY);

  setText(doc, COLORS.textSecondary);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(
    "Saldo positivo ou negativo NÃO equivale automaticamente a hora extra. Aplique a política da empresa, escala, contrato e convenção coletiva antes do fechamento da folha.",
    PAGE.marginX,
    baseY + 5,
    { maxWidth: PAGE.contentWidth }
  );

  const tiles: {
    label: string;
    value: string;
    fill: readonly [number, number, number];
    textColor: readonly [number, number, number];
    border: readonly [number, number, number];
  }[] = [
    {
      label: "Total trabalhado",
      value: formatMinutesAsHHMM(totals.totalWorkedMinutes),
      fill: COLORS.surfaceLight,
      textColor: COLORS.textPrimary,
      border: COLORS.border,
    },
    {
      label: "Saldo do período",
      value: formatMinutesAsSignedHHMM(totals.totalBalanceMinutes),
      fill: totals.totalBalanceMinutes < 0 ? COLORS.redSoft : COLORS.greenSoft,
      textColor: totals.totalBalanceMinutes < 0 ? COLORS.red : COLORS.green,
      border: totals.totalBalanceMinutes < 0 ? COLORS.red : COLORS.green,
    },
    {
      label: "Horas positivas",
      value: `+${formatMinutesAsHHMM(totals.positiveMinutes)}`,
      fill: COLORS.greenSoft,
      textColor: COLORS.green,
      border: COLORS.green,
    },
    {
      label: "Horas negativas",
      value: `-${formatMinutesAsHHMM(totals.negativeMinutes)}`,
      fill: COLORS.redSoft,
      textColor: COLORS.red,
      border: COLORS.red,
    },
  ];

  const tileY = baseY + 14;
  const tileH = 18;
  const tileGap = 4;
  const tileW = (PAGE.contentWidth - tileGap * (tiles.length - 1)) / tiles.length;

  tiles.forEach((tile, index) => {
    const x = PAGE.marginX + (tileW + tileGap) * index;
    setFill(doc, tile.fill);
    setDraw(doc, tile.border);
    doc.roundedRect(x, tileY, tileW, tileH, 1.5, 1.5, "FD");
    setText(doc, COLORS.textSecondary);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(tile.label.toUpperCase(), x + 3, tileY + 5);
    setText(doc, tile.textColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(tile.value, x + 3, tileY + 13);
  });

  // Aviso interpretativo
  const alertY = tileY + tileH + 6;
  setFill(doc, COLORS.amberSoft);
  setDraw(doc, COLORS.amber);
  doc.roundedRect(PAGE.marginX, alertY, PAGE.contentWidth, 14, 1.5, 1.5, "FD");
  setText(doc, [146, 64, 14]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Leitura contábil", PAGE.marginX + 4, alertY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "Saldo apresentado vem da carga horária diária configurada. Banco de horas, hora extra, justificativas e abonos seguem a política interna e a convenção aplicável antes do fechamento da folha.",
    PAGE.marginX + 4,
    alertY + 10,
    { maxWidth: PAGE.contentWidth - 8 }
  );

  return alertY + 14;
};

const TABLE_HEAD = [
  "Data",
  "Dia",
  "Entrada",
  "Saída",
  "Horas",
  "Tipo",
  "Status",
  "Impacto",
];

interface TableRow {
  data: string;
  dia: string;
  entrada: string;
  saida: string;
  horas: string;
  tipo: string;
  status: string;
  impacto: string;
  statusFill: readonly [number, number, number];
  statusText: readonly [number, number, number];
  impactFill: readonly [number, number, number];
  impactText: readonly [number, number, number];
}

const STATUS_TONE: Record<string, { fill: readonly [number, number, number]; text: readonly [number, number, number] }> = {
  CREATED: { fill: COLORS.greenSoft, text: COLORS.green },
  UPDATED: { fill: [219, 234, 254], text: COLORS.deepBlue },
  PENDING: { fill: COLORS.amberSoft, text: [146, 64, 14] },
  PENDING_APPROVAL: { fill: COLORS.amberSoft, text: [146, 64, 14] },
  ABSENCE: { fill: COLORS.redSoft, text: COLORS.red },
  DAY_OFF: { fill: COLORS.tealSoft, text: COLORS.teal },
  VACATION: { fill: COLORS.tealSoft, text: COLORS.teal },
  TIME_OFF: { fill: COLORS.purpleSoft, text: COLORS.purple },
  IMPLICIT_BREAK: { fill: COLORS.surfaceLight, text: COLORS.textSecondary },
};

const getStatusTone = (status: string) =>
  STATUS_TONE[status] ?? { fill: COLORS.surfaceLight, text: COLORS.textSecondary };

const buildTableRows = (payload: ReportExportPayload): TableRow[] =>
  payload.records.map((record) => {
    const status = record.statusRecord;
    const isPending = status === "PENDING";
    const isBreak = status === "IMPLICIT_BREAK";
    const balanceMinutes = parseSignedDurationToMinutes(record.balance);
    const tone = getStatusTone(status);
    const isHoliday = isHolidayDate(record.startWork);
    const eventTypeMap: Record<string, string> = {
      CREATED: "Entrada/Saída",
      UPDATED: "Ajustado ADM",
      PENDING: "Saída pendente",
      PENDING_APPROVAL: "Aguardando aprovação",
      ABSENCE: "Falta",
      DAY_OFF: "Folga",
      VACATION: "Férias",
      TIME_OFF: "Abono",
      IMPLICIT_BREAK: "Pausa implícita",
      WORK_TIME_REQUEST: "Ajuste solicitado",
      WORK_TIME_REJECTED: "Ajuste rejeitado",
      UPDATE_REJECTED: "Atualização rejeitada",
      TIME_OFF_REQUEST: "Abono solicitado",
      TIME_OFF_REJECTED: "Abono rejeitado",
      REQUEST_VACATION: "Férias solicitadas",
      VACATION_REJECTED: "Férias rejeitadas",
    };

    const dia = getDayOfWeekLabel(record.startWork);
    let impacto = "OK";
    let impactFill: readonly [number, number, number] = COLORS.surfaceLight;
    let impactText: readonly [number, number, number] = COLORS.textSecondary;

    if (isPending) {
      impacto = "Pendência";
      impactFill = COLORS.amberSoft;
      impactText = [146, 64, 14];
    } else if (isBreak) {
      impacto = "Pausa";
      impactFill = COLORS.surfaceLight;
      impactText = COLORS.textSecondary;
    } else if (status === "ABSENCE") {
      impacto = "Falta";
      impactFill = COLORS.redSoft;
      impactText = COLORS.red;
    } else if (status === "TIME_OFF") {
      impacto = "Abono";
      impactFill = COLORS.purpleSoft;
      impactText = COLORS.purple;
    } else if (balanceMinutes < 0) {
      impacto = formatMinutesAsSignedHHMM(balanceMinutes);
      impactFill = COLORS.redSoft;
      impactText = COLORS.red;
    } else if (balanceMinutes > 0) {
      impacto = formatMinutesAsSignedHHMM(balanceMinutes);
      impactFill = COLORS.greenSoft;
      impactText = COLORS.green;
    }

    return {
      data: formatBackendDateAsBR(record.startWork) + (isHoliday ? " ★" : ""),
      dia: dia.charAt(0).toUpperCase() + dia.slice(1),
      entrada: isPending && !record.startHour ? "—" : record.startHour ?? "—",
      saida: isPending ? "—" : record.endHour ?? "—",
      horas: isPending
        ? "—"
        : formatMinutesAsHHMM(parseUnsignedDurationToMinutes(record.hoursWork)),
      tipo: eventTypeMap[status] ?? status,
      status: getStatusLabel(status),
      impacto,
      statusFill: tone.fill,
      statusText: tone.text,
      impactFill,
      impactText,
    };
  });

const drawTable = (
  doc: DocWithAutoTable,
  autoTable: (...args: unknown[]) => void,
  rows: TableRow[],
  startY: number
): number => {
  autoTable(doc, {
    startY,
    head: [TABLE_HEAD],
    body: rows.map((row) => [
      { content: row.data, styles: { halign: "left" } },
      { content: row.dia, styles: { halign: "left" } },
      { content: row.entrada, styles: { halign: "center" } },
      { content: row.saida, styles: { halign: "center" } },
      { content: row.horas, styles: { halign: "center" } },
      { content: row.tipo, styles: { halign: "left" } },
      {
        content: row.status,
        styles: {
          halign: "center",
          fillColor: row.statusFill as [number, number, number],
          textColor: row.statusText as [number, number, number],
          fontStyle: "bold",
        },
      },
      {
        content: row.impacto,
        styles: {
          halign: "center",
          fillColor: row.impactFill as [number, number, number],
          textColor: row.impactText as [number, number, number],
          fontStyle: "bold",
        },
      },
    ]),
    theme: "grid",
    margin: { left: PAGE.marginX, right: PAGE.marginX, bottom: 22 },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      lineColor: COLORS.border as [number, number, number],
      lineWidth: 0.15,
      textColor: COLORS.textPrimary as [number, number, number],
    },
    headStyles: {
      fillColor: COLORS.deepBlue as [number, number, number],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: COLORS.surfaceLight as [number, number, number],
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 22 },
      2: { cellWidth: 18 },
      3: { cellWidth: 18 },
      4: { cellWidth: 16 },
      5: { cellWidth: 28 },
      6: { cellWidth: 30 },
      7: { cellWidth: "auto" },
    },
  });

  return doc.lastAutoTable?.finalY ?? startY;
};

const drawConciliationPage = (
  doc: DocWithAutoTable,
  autoTable: (...args: unknown[]) => void,
  payload: ReportExportPayload,
  totals: ReportTotals
) => {
  doc.addPage();
  drawHeaderBand(doc, payload);

  setText(doc, COLORS.textPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Quadro de conciliação para fechamento", PAGE.marginX, 32);

  setText(doc, COLORS.textSecondary);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Este quadro organiza os valores para conciliação contábil antes do processamento da folha.",
    PAGE.marginX,
    37,
    { maxWidth: PAGE.contentWidth }
  );

  const counts = totals.countsByCategory;
  const conciliationRows: [string, string, string][] = [
    [
      "Abonos aprovados",
      String(counts.time_off),
      "Anexar evidência/documento",
    ],
    ["Faltas", String(counts.absence), "Conciliar com justificativas"],
    ["Folgas", String(counts.day_off), "Verificar escala"],
    ["Férias", String(counts.vacation), "Conferir período aquisitivo"],
    [
      "Pendências",
      String(totals.pendingCount),
      "Regularizar antes do fechamento",
    ],
  ];

  autoTable(doc, {
    startY: 44,
    head: [["Evento contábil", "Quantidade", "Ação recomendada"]],
    body: conciliationRows,
    theme: "grid",
    margin: { left: PAGE.marginX, right: PAGE.marginX, bottom: 22 },
    styles: {
      fontSize: 9,
      cellPadding: 3.5,
      lineColor: COLORS.border as [number, number, number],
      lineWidth: 0.15,
      textColor: COLORS.textPrimary as [number, number, number],
    },
    headStyles: {
      fillColor: COLORS.deepBlue as [number, number, number],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: { fillColor: COLORS.surfaceLight as [number, number, number] },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: "bold" },
      1: { cellWidth: 40, halign: "center" },
      2: { cellWidth: "auto" },
    },
  });

  const conciliationEndY = doc.lastAutoTable?.finalY ?? 44;
  const observationsEndY = drawObservations(doc, conciliationEndY + 8, totals);
  drawSignatureFields(doc, observationsEndY + 8);
};

const drawObservations = (doc: JsPDF, startY: number, totals: ReportTotals): number => {
  setText(doc, COLORS.textPrimary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Observações de fechamento", PAGE.marginX, startY);

  const bullets: string[] = [
    "Relatório orientado a apuração. A regra final de banco de horas, hora extra, escala e convenção coletiva é responsabilidade da empresa controladora.",
    "Registros marcados como pendentes precisam ser regularizados antes do processamento da folha.",
    "Abonos devem ter evidência/documento anexado quando aplicável.",
  ];
  if (totals.geoCount > 0) {
    bullets.push(
      "Coordenadas precisas NÃO são exportadas neste documento; apenas o indicador de geolocalização capturada (por LGPD)."
    );
  }
  if (totals.pendingCount > 0) {
    bullets.push(
      `Há ${totals.pendingCount} pendência(s) que devem ser revisadas antes do envio.`
    );
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setText(doc, COLORS.textSecondary);

  const lineHeight = 4.2; // mm por linha
  const bulletGap = 2.5; // mm entre bullets
  const bulletIndent = 4; // recuo após o marcador
  let cursorY = startY + 7;

  for (const bullet of bullets) {
    // Marcador
    doc.text("•", PAGE.marginX, cursorY);
    // Texto com quebra correta, empilhando linhas
    const wrapped = doc.splitTextToSize(
      bullet,
      PAGE.contentWidth - bulletIndent
    ) as string[];
    wrapped.forEach((line, index) => {
      doc.text(line, PAGE.marginX + bulletIndent, cursorY + index * lineHeight);
    });
    cursorY += wrapped.length * lineHeight + bulletGap;
  }

  return cursorY;
};

const drawSignatureFields = (doc: JsPDF, startY: number) => {
  const footerSafeY = 278;
  const y = Math.min(Math.max(startY, 235), footerSafeY - 28);
  const colW = (PAGE.contentWidth - 8) / 3;

  const fields = [
    { label: "Responsável de RH", subline: "Assinatura e data" },
    { label: "Contabilidade", subline: "Conferência da folha" },
    { label: "Colaborador", subline: "Ciência do espelho" },
  ];

  fields.forEach((field, index) => {
    const x = PAGE.marginX + (colW + 4) * index;
    setDraw(doc, COLORS.border);
    doc.line(x, y + 18, x + colW, y + 18);
    setText(doc, COLORS.textPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(field.label, x, y + 23);
    setText(doc, COLORS.textSecondary);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(field.subline, x, y + 27);
  });
};

const drawPageFooter = (doc: JsPDF, totalPagesPlaceholder: string) => {
  const pageCount = doc.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    doc.setPage(pageNumber);
    const footerY = 290;
    setDraw(doc, COLORS.border);
    doc.line(PAGE.marginX, footerY - 5, 210 - PAGE.marginX, footerY - 5);
    setText(doc, COLORS.textTertiary);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(
      "Documento gerado eletronicamente pelo Kronos. Confira: empresa, competência e regras de apuração antes do envio à folha.",
      PAGE.marginX,
      footerY,
      { maxWidth: 130 }
    );
    doc.text(
      `Página ${pageNumber} de ${totalPagesPlaceholder === "{TOTAL}" ? pageCount : totalPagesPlaceholder}`,
      210 - PAGE.marginX,
      footerY,
      { align: "right" }
    );
  }
};

export const buildDetailedReportPdf = async (
  payload: ReportExportPayload
): Promise<JsPDF> => {
  const { jsPDF, autoTable } = await loadPdfLibraries();
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" }) as DocWithAutoTable;

  const totals = aggregateReportTotals(payload.records);

  drawHeaderBand(doc, payload);
  drawIdentification(doc, payload);
  const accountingEndY = drawAccountingSummary(doc, payload, totals);

  const rows = buildTableRows(payload);
  drawTable(doc, autoTable, rows, accountingEndY + 6);

  drawConciliationPage(doc, autoTable, payload, totals);
  drawPageFooter(doc, "{TOTAL}");
  return doc;
};

export const getPdfFileName = (payload: ReportExportPayload): string =>
  `relatorio_detalhado_${buildTimestamp(payload.context.generatedAt)}.pdf`;

export const downloadDetailedReportPdf = async (
  payload: ReportExportPayload
): Promise<string> => {
  const doc = await buildDetailedReportPdf(payload);
  const fileName = getPdfFileName(payload);
  doc.save(fileName);
  return fileName;
};

