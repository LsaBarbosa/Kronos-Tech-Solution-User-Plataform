# Deployment na Hostinger

## Arquitetura Alvo

O ecossistema Kronos está configurado para operar com separação de responsabilidades:

- front-end: `https://app.kronossolutions.tech`
- API: `https://api.kronossolutions.tech`

O front-end deve ser publicado como site estático.
A API deve permanecer atrás do proxy reverso da Hostinger apontando para o Spring Boot.

## Regra Crítica

Se a raiz `/` ou uma rota SPA como `/dashboard` cair no back-end, o usuário verá erro `404 No static resource`.

Para evitar isso, a publicação correta precisa garantir:

1. `app.kronossolutions.tech` servindo os arquivos do `dist/`
2. fallback SPA ativo para `index.html`
3. `api.kronossolutions.tech` apontando para o back-end

## Build de Produção

Use a API real no build:

```bash
VITE_API_BASE_URL=https://api.kronossolutions.tech npm run build
```

Opcionalmente, crie um arquivo local não versionado `.env.production` a partir de `.env.production.example`.

## Artefatos de Publicação

Após o build, publique o conteúdo de `dist/` no domínio do app.

Arquivos críticos:

- `dist/index.html`
- `dist/assets/*`
- `dist/.htaccess`

O arquivo `.htaccess` já contém o fallback SPA:

- arquivos reais são servidos normalmente;
- qualquer rota inexistente é redirecionada para `index.html`.

## Hostinger com Apache ou LiteSpeed

Se `app.kronossolutions.tech` estiver servindo arquivos estáticos diretamente:

1. suba o conteúdo de `dist/` para o diretório público do domínio;
2. confirme que `dist/.htaccess` foi publicado;
3. teste:
   - `/`
   - `/dashboard`
   - `/avisos`
   - `/usuario`

Se essas rotas abrirem apenas após navegação interna, mas falharem em refresh, o `.htaccess` não foi publicado ou o `mod_rewrite` não está ativo.

## Hostinger com Nginx em Frente

Se a Hostinger estiver usando Nginx antes do Apache/LiteSpeed, o domínio do app precisa preservar o fallback para SPA.

Padrão esperado:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Se o Nginx estiver encaminhando `/` para o Spring Boot, o front não está sendo servido pelo lugar correto.

## Comportamento Atual do Back-end

O back-end agora redireciona acessos HTML indevidos para o domínio do app usando `frontend.base-url-record`.

Isso reduz erros como:

- `No static resource .`
- `No static resource dashboard.`

Mas esse redirect é proteção adicional, não substitui a publicação correta do front.

## Checklist de Produção

- `VITE_API_BASE_URL` apontando para `https://api.kronossolutions.tech`
- `dist/` publicado em `app.kronossolutions.tech`
- `.htaccess` presente no diretório publicado
- API publicada em `api.kronossolutions.tech`
- CORS no back-end permitindo `https://app.kronossolutions.tech`
- refresh em `/dashboard` funcionando
- login, logout e chamadas autenticadas funcionando

## Diagnóstico Rápido

### Se `https://app.kronossolutions.tech/dashboard` retorna JSON 404 do Spring

Causa provável:

- o domínio do app está apontando para o back-end, não para os arquivos estáticos.

Correção:

- ajustar a configuração da Hostinger para servir `dist/` no domínio do app;
- manter a API no subdomínio `api`.

### Se `https://app.kronossolutions.tech/dashboard` retorna 404 HTML do servidor

Causa provável:

- falta de fallback SPA.

Correção:

- garantir publicação de `.htaccess`;
- se houver Nginx antes, aplicar `try_files`.
