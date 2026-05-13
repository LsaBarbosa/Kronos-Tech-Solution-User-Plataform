# 🚀 Guia de Deployment - Kronos User Platform

## Configuração de Variáveis de Ambiente

### Em Desenvolvimento (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_OBSERVABILITY_ENABLED=false
```

### Em Produção (`.env.production`)

⚠️ **IMPORTANTE:** Você DEVE definir `VITE_API_BASE_URL` com a URL correta do seu backend em produção.

#### Opções de Configuração:

**Opção 1: Usar `.env.production` (Recomendado)**

```env
VITE_API_BASE_URL=https://seu-backend-url.com
VITE_OBSERVABILITY_ENABLED=true
VITE_OBSERVABILITY_ENDPOINT=https://seu-observability-endpoint.com
```

**Opção 2: Passar via Comando de Build**

```bash
VITE_API_BASE_URL=https://seu-backend-url.com npm run build
```

**Opção 3: Variáveis de Ambiente do Sistema (CI/CD)**

Defina a variável de ambiente no seu pipeline CI/CD:

```yaml
# GitHub Actions
- name: Build
  env:
    VITE_API_BASE_URL: https://seu-backend-url.com
  run: npm run build
```

```yaml
# GitLab CI
build:
  variables:
    VITE_API_BASE_URL: "https://seu-backend-url.com"
  script:
    - npm run build
```

---

## Como Funciona

### Código em `src/config/api.ts`

```typescript
const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:8080";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_LOCAL_API_BASE_URL;
```

**Ordem de Precedência:**
1. ✅ Se `VITE_API_BASE_URL` está definida → usa ela
2. ❌ Se não está definida → usa o fallback `http://localhost:8080`

### ⚠️ Problema Comum em Produção

Se você faz deploy em produção **SEM definir `VITE_API_BASE_URL`**, o front-end tentará chamar `http://localhost:8080`, que resulta em:

- ❌ Requisições CORS falhando
- ❌ Aplicação não consegue se conectar ao backend
- ❌ Usuários veem erros de conexão

### ✅ Solução

**SEMPRE** defina `VITE_API_BASE_URL` antes de fazer build para produção:

```bash
# ❌ ERRADO (usará localhost como fallback)
npm run build

# ✅ CORRETO (usa a URL do backend em produção)
VITE_API_BASE_URL=https://seu-backend-url.com npm run build
```

---

## Exemplos de URLs de Backend

| Ambiente | URL Exemplo |
|----------|------------|
| Local | `http://localhost:8080` |
| Desenvolvimento | `http://dev-api.kronos.local` |
| Staging | `https://staging-api.kronos.com` |
| Produção Render | `https://kronos-api-production.render.com` |
| Produção Custom | `https://api.kronossolutions.com` |

---

## Validação

Para verificar qual URL está sendo usada, abra o DevTools do navegador e execute:

```javascript
// Console do navegador
console.log(window.location.origin); // URL do front-end
fetch('/').then(r => console.log(r.url)); // Verificará o baseURL
```

Ou inspecione o arquivo HTML buildado:

```bash
# Procure pelas requisições de API nos seus testes/staging
grep -r "localhost" dist/ && echo "⚠️ ALERTA: localhost encontrado em produção!" || echo "✅ Nenhuma referência a localhost"
```

---

## Checklist de Deployment

- [ ] Variável `VITE_API_BASE_URL` definida corretamente
- [ ] Backend está acessível na URL definida
- [ ] CORS está configurado corretamente no backend
- [ ] Certificado SSL é válido (se HTTPS)
- [ ] Firewall permite requisições HTTPS
- [ ] Build foi feito COM a variável de ambiente (não apenas no código)

---

## Troubleshooting

### "NetworkError: A network error occurred."

❌ **Causa:** `VITE_API_BASE_URL` não foi definida ou está errada

✅ **Solução:** Reconstruir com `VITE_API_BASE_URL=<URL_CORRETA> npm run build`

### "CORS error: No 'Access-Control-Allow-Origin' header"

❌ **Causa:** Backend não está com CORS configurado para o domínio do front-end

✅ **Solução:** Configurar CORS no backend (verificar `SecurityConfig.java`)

### Build local funciona, mas produção não funciona

❌ **Causa:** Variável não foi setada durante o build de produção

✅ **Solução:** Usar `.env.production` ou passar variável no comando de build

---

## Referências

- [Vite: Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Backend Kronos](../Kronos-Tech-Solutions-KTS/README.md)
- [API Configuration](../src/config/api.ts)
