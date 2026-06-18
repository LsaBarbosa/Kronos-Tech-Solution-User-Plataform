# Configuração de Ambiente

## Arquivos Versionados

Devem permanecer no repositório apenas arquivos de exemplo:

- `.env.example`
- `.env.production.example`

## Arquivos Não Versionados

Não devem ser commitados:

- `.env`
- `.env.local`
- `.env.production`
- `.env.*.local`

## Produção na Hostinger

O build do front precisa apontar para a API pública:

```env
VITE_API_BASE_URL=https://api.kronossolutions.tech
VITE_BIOMETRIC_LIVENESS_REQUIRED=false
VITE_OBSERVABILITY_ENABLED=true
VITE_OBSERVABILITY_ENDPOINT=
VITE_GOOGLE_MAPS_API_KEY=
```

## Regra Importante

Se `VITE_API_BASE_URL` não for definido corretamente no build de produção:

- o front pode continuar apontando para `localhost`;
- ou pode apontar para o domínio errado;
- isso quebra login, sessão, CSRF e carregamento da dashboard.

## Build Correto

```bash
VITE_API_BASE_URL=https://api.kronossolutions.tech npm run build
```

## Validação

Após o build, valide o conteúdo final:

```bash
grep -r "localhost:8080" dist/ && echo "ERRO" || echo "OK"
```

Se houver referência a `localhost`, o build de produção foi gerado incorretamente.
