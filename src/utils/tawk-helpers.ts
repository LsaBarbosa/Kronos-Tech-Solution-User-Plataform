const MAX_TAWK_ATTRIBUTES = 50;
const MAX_TAWK_VALUE_LENGTH = 255;
const MAX_TAWK_TAGS = 10;

export function sanitizeTawkAttributes(
  attributes: Record<string, unknown>
): Record<string, string> {
  return Object.entries(attributes)
    .filter(([key, value]) => Boolean(key) && value !== null && value !== undefined)
    .filter(([key]) => /^[a-zA-Z0-9-]+$/.test(key))
    .map(([key, value]) => [key, String(value).trim()] as const)
    .filter(([, value]) => value.length > 0)
    .slice(0, MAX_TAWK_ATTRIBUTES)
    .reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = value.slice(0, MAX_TAWK_VALUE_LENGTH);
      return acc;
    }, {});
}

export function sanitizeTawkTags(tags: Array<string | undefined | null>): string[] {
  return Array.from(
    new Set(
      tags
        .filter((tag): tag is string => Boolean(tag))
        .map((tag) =>
          tag
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
        )
        .filter(Boolean)
    )
  ).slice(0, MAX_TAWK_TAGS);
}

export function resolveKronosModule(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/documentos")) return "documentos";
  if (pathname.startsWith("/meus-documentos")) return "documentos";
  if (pathname.startsWith("/enviar-documentos")) return "documentos";
  if (pathname.startsWith("/enviar-documento-colaborador")) return "documentos";
  if (pathname.startsWith("/empresa")) return "empresa";
  if (pathname.startsWith("/usuario")) return "perfil";
  if (pathname.startsWith("/lista-colaboradores")) return "colaboradores";
  if (pathname.startsWith("/criar-colaborador")) return "colaboradores";
  if (pathname.startsWith("/criar-administrador")) return "colaboradores";
  if (pathname.startsWith("/espelho-ponto")) return "ponto";
  if (pathname.startsWith("/assinatura-ponto")) return "ponto";
  if (pathname.startsWith("/apuracao-horas")) return "ponto";
  if (pathname.startsWith("/status-do-registro")) return "ponto";
  if (pathname.startsWith("/solicitar-ferias")) return "ferias";
  if (pathname.startsWith("/ferias")) return "ferias";
  if (pathname.startsWith("/solicitar-abono")) return "abono";
  if (pathname.startsWith("/aprovacoes-abono")) return "abono";
  if (pathname.startsWith("/avisos")) return "avisos";
  if (pathname.startsWith("/criar-aviso")) return "avisos";
  if (pathname.startsWith("/auditoria")) return "auditoria";
  if (pathname.startsWith("/contratos")) return "contratos";
  if (pathname.startsWith("/assinatura-contrato")) return "contratos";
  if (pathname.startsWith("/relatorio-detalhado")) return "relatorio";
  if (pathname.startsWith("/privacidade")) return "privacidade";
  if (pathname.startsWith("/lgpd")) return "lgpd";
  if (pathname.startsWith("/administracao")) return "administracao";
  if (pathname.startsWith("/selecionar-empresa")) return "selecionar-empresa";
  return "geral";
}
