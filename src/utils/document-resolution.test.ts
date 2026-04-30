import { describe, expect, it } from "vitest";
import { resolveDocumentId } from "./document-resolution";

describe("resolveDocumentId", () => {
  it("prioriza documentId oficial", () => {
    expect(
      resolveDocumentId({
        documentId: "doc-oficial",
        documentDownloadUrl: "/documents/doc-url",
        documentDownloadPath: "/documents/doc-legado",
      })
    ).toBe("doc-oficial");
  });

  it("extrai id de documentDownloadUrl sem retornar rota completa", () => {
    expect(
      resolveDocumentId({
        documentDownloadUrl: "https://api.kronos.local/documents/550e8400-e29b-41d4-a716-446655440000",
      })
    ).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("extrai id de documentDownloadPath legado", () => {
    expect(
      resolveDocumentId({
        documentDownloadPath: "/documents/550e8400-e29b-41d4-a716-446655440001",
      })
    ).toBe("550e8400-e29b-41d4-a716-446655440001");
  });

  it("mantem compatibilidade com legado que ja envia apenas o id", () => {
    expect(
      resolveDocumentId({
        documentDownloadPath: "doc-legado",
      })
    ).toBe("doc-legado");
  });

  it("ignora rotas legadas sem identificador de documento", () => {
    expect(
      resolveDocumentId({
        documentDownloadPath: "/documents/",
      })
    ).toBeUndefined();
  });

  it("nao retorna segmentos que ainda seriam tratados como rota", () => {
    expect(
      resolveDocumentId({
        documentDownloadPath: "/documents/doc%2Flegado",
      })
    ).toBeUndefined();
  });
});
