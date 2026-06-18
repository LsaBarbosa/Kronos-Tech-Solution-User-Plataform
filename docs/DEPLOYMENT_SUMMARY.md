# Resumo de Deploy na Hostinger

## Topologia Correta

- `app.kronossolutions.tech`: front-end estático gerado pelo Vite
- `api.kronossolutions.tech`: API Spring Boot atrás do proxy da Hostinger

## Resultado Esperado

- refresh em `/dashboard` deve abrir o app normalmente;
- chamadas HTTP do front devem sair para `https://api.kronossolutions.tech`;
- o domínio da API não deve ser usado para servir a SPA.

## Artefatos Importantes

- `public/.htaccess`
- `dist/.htaccess`
- `deploy/hostinger-nginx.conf` no back-end

## Erros que essa configuração evita

- `{"detail":"No static resource dashboard.","instance":"/dashboard"}`
- `{"detail":"No static resource .","instance":"/"}`

## Interpretação do Erro

Se esse erro aparece, significa que a rota chegou ao Spring Boot em vez de ser resolvida pelo front estático.

Isso normalmente indica uma destas causas:

1. o domínio do app está apontando para o back-end;
2. o `dist/` não foi publicado no domínio correto;
3. o fallback SPA não está ativo;
4. o build de produção foi feito com `VITE_API_BASE_URL` incorreto.

## Ação Operacional

1. publicar `dist/` em `app.kronossolutions.tech`
2. manter `api.kronossolutions.tech` apontando para o back-end
3. validar `.htaccess` no diretório publicado
4. validar `VITE_API_BASE_URL=https://api.kronossolutions.tech`
5. testar refresh direto em `/dashboard`
