import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useToast } from "@/hooks/use-toast";
import { downloadDocument } from "@/service/document.service";
import { ResultadosRelatorioDetalhado } from "./ResultadosRelatorioDetalhado";

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/service/document.service", () => ({
  downloadDocument: vi.fn(),
}));

vi.mock("@/utils/report-utils", () => ({
  DetailedReportItem: {},
  statusOptions: [],
  getStatusColor: () => "bg-green-500",
  statusMap: {
    CREATED: "Criado",
    IMPLICIT_BREAK: "Pausa",
  },
}));

const mockUseToast = vi.mocked(useToast);
const mockDownloadDocument = vi.mocked(downloadDocument);
const toastMock = vi.fn();

const baseRecord = {
  timeRecordId: 1,
  startWork: "23-04-2026",
  startHour: "08:00",
  endHour: "17:00",
  hoursWork: "09:00",
  balance: "+01:00",
  statusRecord: "CREATED",
  employeeId: "emp-1",
  employeeData: {
    employeeName: "Maria Silva",
  },
  documentDownloadPath: "doc-1",
};

describe("ResultadosRelatorioDetalhado", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseToast.mockReturnValue({ toast: toastMock } as any);
    mockDownloadDocument.mockResolvedValue({
      fileName: "Maria_Silva_documento",
      blob: new Blob(["conteudo"]),
    });
  });

  it("renderiza estado vazio quando nao ha registros", () => {
    render(
      <ResultadosRelatorioDetalhado
        reportData={[]}
        statusFilter={[]}
        referenceTime="2026-04"
        selectedDates={[]}
        onEditRecord={vi.fn()}
        onDownloadPDF={vi.fn()}
        onDownloadCSV={vi.fn()}
      />
    );

    expect(screen.getByText("Nenhum registro encontrado para o período.")).toBeInTheDocument();
  });

  it("exporta e baixa anexo do registro", async () => {
    const user = userEvent.setup();
    const onDownloadPDF = vi.fn();
    const onDownloadCSV = vi.fn();
    const onEditRecord = vi.fn();

    render(
      <ResultadosRelatorioDetalhado
        reportData={[baseRecord as any]}
        statusFilter={["CREATED"]}
        referenceTime="2026-04"
        selectedDates={[]}
        onEditRecord={onEditRecord}
        onDownloadPDF={onDownloadPDF}
        onDownloadCSV={onDownloadCSV}
      />
    );

    await user.click(screen.getByRole("button", { name: /Exportar PDF/i }));
    await user.click(screen.getByRole("button", { name: /Exportar CSV/i }));
    await user.click(screen.getByRole("button", { name: /Ver Anexo/i }));

    expect(onDownloadPDF).toHaveBeenCalled();
    expect(onDownloadCSV).toHaveBeenCalled();
    expect(mockDownloadDocument).toHaveBeenCalledWith("doc-1", "Maria Silva_documento", "emp-1");
  });
});
