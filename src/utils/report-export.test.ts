import { describe, expect, it } from "vitest";
import { buildCsvContent } from "./report-export";

describe("report-export", () => {
  it("serializa células com quebra de linha e separadores", () => {
    const csv = buildCsvContent(
      [
        ["Linha 1\nLinha 2", "Texto;com;ponto-e-vírgula", 'Aspas "duplas"'],
      ],
      ["Coluna A", "Coluna B", "Coluna C"]
    );

    expect(csv).toContain("Coluna A;Coluna B;Coluna C");
    expect(csv).toContain("Linha 1 Linha 2");
    expect(csv).toContain('"Texto;com;ponto-e-vírgula"');
    expect(csv).toContain('Aspas "duplas"');
  });
});
