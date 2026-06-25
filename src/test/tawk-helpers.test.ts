import { describe, expect, it } from "vitest";
import {
  sanitizeTawkAttributes,
  sanitizeTawkTags,
  resolveKronosModule,
} from "@/utils/tawk-helpers";

describe("sanitizeTawkAttributes", () => {
  it("filtra chaves inválidas (com espaços ou caracteres especiais)", () => {
    const result = sanitizeTawkAttributes({
      "valid-key": "value",
      "invalid key": "should be removed",
      "invalid@key": "should be removed",
      "another_invalid": "should be removed",
    });
    expect(result).toHaveProperty("valid-key", "value");
    expect(result).not.toHaveProperty("invalid key");
    expect(result).not.toHaveProperty("invalid@key");
    expect(result).not.toHaveProperty("another_invalid");
  });

  it("remove valores nulos e undefined", () => {
    const result = sanitizeTawkAttributes({
      key1: "value",
      key2: null,
      key3: undefined,
      key4: "",
    });
    expect(result).toHaveProperty("key1");
    expect(result).not.toHaveProperty("key2");
    expect(result).not.toHaveProperty("key3");
    expect(result).not.toHaveProperty("key4");
  });

  it("trunca valores acima de 255 caracteres", () => {
    const longValue = "x".repeat(300);
    const result = sanitizeTawkAttributes({ key: longValue });
    expect(result["key"]?.length).toBe(255);
  });

  it("limita a 50 atributos no máximo", () => {
    const attrs: Record<string, string> = {};
    for (let i = 0; i < 60; i++) {
      attrs[`key-${i}`] = "value";
    }
    const result = sanitizeTawkAttributes(attrs);
    expect(Object.keys(result).length).toBeLessThanOrEqual(50);
  });

  it("mantém chaves alfanuméricas com hífen", () => {
    const result = sanitizeTawkAttributes({
      "user-id": "123",
      "company-name": "Empresa",
      "current-route": "/dashboard",
    });
    expect(Object.keys(result)).toHaveLength(3);
  });
});

describe("sanitizeTawkTags", () => {
  it("converte para lowercase e remove acentos", () => {
    const result = sanitizeTawkTags(["Kronos", "Gestão", "ADMIN"]);
    expect(result).toContain("kronos");
    expect(result).toContain("gestao");
    expect(result).toContain("admin");
  });

  it("substitui caracteres especiais por hífen", () => {
    const result = sanitizeTawkTags(["cliente logado", "modulo/ponto"]);
    expect(result).toContain("cliente-logado");
    expect(result).toContain("modulo-ponto");
  });

  it("remove duplicatas", () => {
    const result = sanitizeTawkTags(["kronos", "kronos", "Kronos"]);
    expect(result.filter((t) => t === "kronos").length).toBe(1);
  });

  it("limita a 10 tags no máximo", () => {
    const tags = Array.from({ length: 15 }, (_, i) => `tag-${i}`);
    const result = sanitizeTawkTags(tags);
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it("ignora null e undefined", () => {
    const result = sanitizeTawkTags(["kronos", null, undefined, "valid"]);
    expect(result).toContain("kronos");
    expect(result).toContain("valid");
    expect(result.length).toBe(2);
  });
});

describe("resolveKronosModule", () => {
  it.each([
    ["/dashboard", "dashboard"],
    ["/documentos", "documentos"],
    ["/meus-documentos", "documentos"],
    ["/enviar-documentos", "documentos"],
    ["/empresa", "empresa"],
    ["/empresa/criar", "empresa"],
    ["/usuario", "perfil"],
    ["/lista-colaboradores", "colaboradores"],
    ["/criar-colaborador", "colaboradores"],
    ["/espelho-ponto", "ponto"],
    ["/assinatura-ponto", "ponto"],
    ["/apuracao-horas", "ponto"],
    ["/status-do-registro", "ponto"],
    ["/solicitar-ferias", "ferias"],
    ["/ferias", "ferias"],
    ["/solicitar-abono", "abono"],
    ["/aprovacoes-abono", "abono"],
    ["/avisos", "avisos"],
    ["/auditoria", "auditoria"],
    ["/contratos/admin", "contratos"],
    ["/relatorio-detalhado", "relatorio"],
    ["/privacidade", "privacidade"],
    ["/lgpd/admin/requests", "lgpd"],
    ["/administracao", "administracao"],
    ["/selecionar-empresa", "selecionar-empresa"],
    ["/rota-desconhecida", "geral"],
  ])("pathname '%s' → módulo '%s'", (pathname, expected) => {
    expect(resolveKronosModule(pathname)).toBe(expected);
  });
});
