# Guia de Deploy na Hostinger

## Contexto

Este documento substitui o fluxo antigo baseado em Render.

O cenário atual do projeto é:

- front-end publicado na Hostinger
- back-end publicado separadamente e acessado por subdomínio da API

## Domínios Esperados

- app: `https://app.kronossolutions.tech`
- api: `https://api.kronossolutions.tech`

## Front-end

### Build

```bash
VITE_API_BASE_URL=https://api.kronossolutions.tech npm run build
```

### Publicação

Publique o conteúdo da pasta `dist/` no diretório público do domínio do app.

Arquivos essenciais:

- `index.html`
- `assets/`
- `.htaccess`

### Fallback SPA

O arquivo `.htaccess` incluído no build resolve refresh e acesso direto em rotas como:

- `/dashboard`
- `/avisos`
- `/usuario`

## Back-end

O snippet [hostinger-nginx.conf](/home/kronos/Documentos/Codigin/kronos/Kronos-Tech-Solutions-KTS/deploy/hostinger-nginx.conf) deve continuar no lado da API.

Ele é adequado para o subdomínio da API, não para servir a SPA do front.

## Diagnóstico do Erro Atual

Erro:

```json
{"type":"about:blank","title":"Not Found","status":404,"detail":"No static resource .","instance":"/"}
```

Leitura correta:

- a raiz `/` está chegando no Spring Boot;
- isso não deveria acontecer quando o usuário acessa o domínio do app;
- portanto o domínio do app está apontando para a API, ou o proxy da Hostinger está encaminhando `/` para o back-end.

## Correção Estrutural

### Opção correta

- `app.kronossolutions.tech` serve `dist/`
- `api.kronossolutions.tech` faz proxy para `127.0.0.1:8080`

### Opção incorreta

- usar o mesmo host da API para servir a SPA sem fallback estático

## Smoke Test

Depois da publicação:

1. abrir `https://app.kronossolutions.tech/`
2. abrir direto `https://app.kronossolutions.tech/dashboard`
3. dar refresh em `/dashboard`
4. confirmar que chamadas XHR vão para `https://api.kronossolutions.tech`

## Sinal de Ambiente Ainda Quebrado

Se o navegador continuar mostrando JSON do Spring em `/` ou `/dashboard`, o problema restante não está mais no código do front:

- está no apontamento do domínio;
- ou na configuração do proxy/reverse proxy da Hostinger.
