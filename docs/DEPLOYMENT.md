# Deploy na Hostinger

## Topologia real

Produção usa domínio único:

- aplicação web: `https://kronostechsolutions.com`
- SPA pública/autenticada: `/`, `/dashboard`, `/avisos`, `/usuario`, etc.
- API no mesmo host: `/auth/*`, `/records/*`, `/dashboard/summary`, `/lgpd/*` e demais rotas HTTP do Spring

O erro abaixo significa que uma rota da SPA caiu no back-end:

```json
{"type":"about:blank","title":"Not Found","status":404,"detail":"No static resource dashboard.","instance":"/dashboard"}
```

Ou, em alguns cenários, a rota cai no filtro de segurança e retorna `401`.

## Regra de roteamento

O servidor precisa separar:

1. rotas de API, que devem ir para o Spring Boot;
2. rotas da SPA, que devem resolver para `index.html`.

Exemplos corretos:

- `GET /records/pending-approvals` -> back-end
- `GET /dashboard/summary` -> back-end
- `GET /dashboard` -> front-end SPA
- `GET /avisos` -> front-end SPA

## Build de produção

Preferencialmente:

```bash
VITE_API_BASE_URL=https://kronostechsolutions.com npm run build
```

Se `VITE_API_BASE_URL` não for definido, o front agora usa `window.location.origin` em produção. Isso atende o cenário de domínio único.

## Publicação dos artefatos

Publique o conteúdo de `dist/` no diretório público do domínio e preserve:

- `dist/index.html`
- `dist/assets/*`
- `dist/.htaccess`

Em Apache/LiteSpeed, o `.htaccess` cobre o fallback SPA:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule . - [L]

  RewriteRule . /index.html [L]
</IfModule>
```

## Nginx na frente do domínio

Se a Hostinger estiver usando Nginx reverso no domínio principal, a regra precisa ser parecida com:

```nginx
location ~ ^/(auth|records|employee|companies|documents|messages|users|lgpd|geolocation|terms|legal|service-contracts|security-incidents)(/|$) {
    proxy_pass http://127.0.0.1:8080;
}

location = /dashboard/summary {
    proxy_pass http://127.0.0.1:8080;
}

location ~ ^/admin/(platform/health|retention(/.*)?)$ {
    proxy_pass http://127.0.0.1:8080;
}

location ~ ^/public/privacy/(processing-catalog|policy|biometric-term)$ {
    proxy_pass http://127.0.0.1:8080;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

Sem essa separação, `/dashboard` e `/` podem cair no Spring em vez de abrir a SPA.

## Checklist de validação

- `https://kronostechsolutions.com/` retorna HTML
- `https://kronostechsolutions.com/dashboard` retorna HTML, não JSON do Spring
- `https://kronostechsolutions.com/records/pending-approvals` continua respondendo pelo back-end
- `dist/.htaccess` foi publicado
- o proxy do domínio não envia `/dashboard` para o upstream Java
- `VITE_API_BASE_URL` aponta para `https://kronostechsolutions.com` ou não é definido
