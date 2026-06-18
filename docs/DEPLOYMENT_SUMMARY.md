# Resumo Operacional de Deploy

## Cenário correto

- domínio público: `https://kronostechsolutions.com`
- SPA: `/`, `/dashboard`, `/avisos`, `/usuario`
- API: `/auth/*`, `/records/*`, `/dashboard/summary`, `/lgpd/*`, `/admin/retention/*`, `/public/privacy/*`

## Sintoma observado

Quando a infraestrutura está errada, rotas como `/` ou `/dashboard` chegam ao Spring Boot e geram:

- `404 No static resource .`
- `404 No static resource dashboard.`
- `401` JSON do back-end

## Causa

O proxy do domínio principal está tratando rotas da SPA como se fossem API.

## Correção

1. servir `dist/` no domínio `kronostechsolutions.com`
2. manter fallback SPA para `index.html`
3. encaminhar ao Spring apenas os caminhos de API
4. usar `VITE_API_BASE_URL=https://kronostechsolutions.com` ou fallback same-origin

## Evidência da montagem real

- `GET /` deve retornar HTML
- `GET /dashboard` deve retornar HTML
- `GET /records/pending-approvals` deve continuar no back-end

Se `/dashboard` responder com JSON do Spring, o problema permanece na camada de proxy/vhost.
