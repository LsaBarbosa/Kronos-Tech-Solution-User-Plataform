# 🚀 Guia de Deployment no Render - Kronos

## 🔗 Arquitetura Render

### Backend (Kronos-Tech-Solutions-KTS)
- **Service:** `kronos-solutions-service`
- **URL Pública:** `https://kronos-solutions-service.onrender.com/`
- **Arquivo Config:** `Kronos-Tech-Solutions-KTS/render.yaml`

### Frontend (Kronos-Tech-Solution-User-Plataform)
- **Service:** (será criado no Render)
- **Tipo:** Static Site ou Web Service
- **Arquivo Config:** `vite.config.ts` + `.env.production`

---

## 📋 Configuração Atual

### `.env.production`

```env
VITE_API_BASE_URL=${VITE_API_BASE_URL:-https://kronos-solutions-service.onrender.com/}
VITE_OBSERVABILITY_ENABLED=true
VITE_OBSERVABILITY_ENDPOINT=${VITE_OBSERVABILITY_ENDPOINT:-https://observability.kronos.com}
```

**O que significa:**
- ✅ Usa `https://kronos-solutions-service.onrender.com/` como padrão
- ✅ Pode ser sobrescrito por variável de ambiente se necessário
- ✅ Observability habilitado para produção

---

## 🛠️ Como Fazer Deploy no Render

### Opção 1: Deploy via GitHub (Recomendado)

#### 1. Conectar repositório ao Render

1. Acesse https://render.com
2. Clique em "New +" → "Web Service"
3. Selecione "Deploy an existing repository"
4. Authorize Render no GitHub
5. Selecione o repositório `Kronos-Tech-Solutions-KTS`

#### 2. Configuração do Backend (Já Feito)

Render lê automaticamente `render.yaml` e cria o serviço com as variáveis configuradas.

#### 3. Criar novo serviço para Frontend

1. Clique em "New +" → "Static Site"
2. Conecte o repositório `Kronos-Tech-Solution-User-Plataform`
3. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

#### 4. Definir Variáveis de Ambiente (Frontend)

No Render Dashboard → Settings → Environment:

```
VITE_API_BASE_URL=https://kronos-solutions-service.onrender.com/
VITE_OBSERVABILITY_ENABLED=true
VITE_OBSERVABILITY_ENDPOINT=https://observability.kronos.com
```

#### 5. Deploy

Render fará deploy automaticamente quando você fazer push para a branch principal.

---

### Opção 2: Deploy Manual

```bash
# 1. Build localmente com a URL do Render
VITE_API_BASE_URL=https://kronos-solutions-service.onrender.com/ npm run build

# 2. Fazer upload da pasta dist/
# (usando Render CLI ou dashboard)
```

---

## ✅ Verificação Pós-Deploy

### 1. Verificar URL da API

```bash
# No console do navegador em produção
fetch('https://seu-frontend-render-url/api/health')
  .then(r => console.log(r.url))
  .catch(e => console.log('Erro:', e.message))
```

### 2. Validar que não há localhost

```bash
# Verificar se localhost foi buildado (NÃO DEVE ESTAR)
grep -r "localhost" dist/ 
# Esperado: nenhum resultado
```

### 3. Testar requisição à API

Abra DevTools → Network e verifique:
- ✅ Requisições vão para `https://kronos-solutions-service.onrender.com/`
- ✅ Status HTTP é 2xx ou esperado
- ✅ CORS headers estão presentes

---

## 🔗 Fluxo de Requisição (Produção Render)

```
┌─────────────────────────────────────┐
│ Browser (Frontend Render)           │
│ https://seu-site.render.com/        │
└──────────────┬──────────────────────┘
               │
               │ CORS Request
               ▼
┌─────────────────────────────────────┐
│ Backend (Kronos Render)             │
│ https://kronos-solutions-...        │
│         onrender.com/               │
│                                     │
│ ✅ Tem CORS configurado para       │
│    aceitar frontend                │
└─────────────────────────────────────┘
```

---

## 🚨 Troubleshooting

### "CORS Error: No 'Access-Control-Allow-Origin'"

**Causa:** Backend não está com CORS configurado para o domínio do frontend

**Solução:**
1. Verifique `SecurityConfig.java` no backend
2. Adicione o domínio do frontend aos allowed origins:

```java
// SecurityConfig.java
corsConfigurationSource() {
  // Adicionar:
  "https://seu-frontend-render-url.onrender.com"
}
```

3. Redeploy do backend

### "NetworkError connecting to http://localhost:8080"

**Causa:** `VITE_API_BASE_URL` não foi setada no build

**Solução:**
1. Verificar `.env.production` está correto
2. Redeploy com `VITE_API_BASE_URL=...` definida
3. Verificar Render → Environment → Variables

### "Service unavailable / 503"

**Causa:** Backend pode estar dormindo (free tier do Render)

**Solução:**
1. Upgrade para plano pago no Render
2. Ou usar keep-alive para manter serviço ativo:

```bash
# Deploy uma simple health check request a cada 14 minutos
# para evitar que Render coloque o serviço em sleep
```

---

## 📊 Variáveis de Ambiente por Ambiente

| Variável | Desenvolvimento | Produção (Render) |
|----------|-----------------|-------------------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | `https://kronos-solutions-service.onrender.com/` |
| `VITE_OBSERVABILITY_ENABLED` | `false` | `true` |
| `VITE_OBSERVABILITY_ENDPOINT` | (não usada) | `https://observability.kronos.com` |

---

## 📝 Checklist de Deploy Render

- [ ] Repositório conectado ao Render
- [ ] Backend `kronos-solutions-service` está rodando em Render
- [ ] Frontend será deployado como Static Site ou Web Service
- [ ] `VITE_API_BASE_URL` setada como `https://kronos-solutions-service.onrender.com/`
- [ ] CORS configurado no backend para aceitar o domínio do frontend Render
- [ ] Build testado localmente: `VITE_API_BASE_URL=... npm run build`
- [ ] `.env.production` commitado e atualizado
- [ ] Nenhuma referência a `localhost` no código de produção
- [ ] Teste de requisição à API após deploy
- [ ] Monitorar logs no Render Dashboard

---

## 🔄 Fluxo de Atualização

Quando você faz push para `main` (ou branch configurada):

1. **Render detecta novo commit**
2. **Frontend é rebuiltado com `.env.production`**
3. **`VITE_API_BASE_URL` é setada para Render**
4. **Arquivo `dist/` é deployado**
5. **Nova versão fica viva em segundos**

```bash
# Seu fluxo
git add .
git commit -m "fix: atualização"
git push origin main

# Render automaticamente:
# npm install && npm run build && deploy dist/
```

---

## 🎯 URLs de Referência

- **Backend:** https://kronos-solutions-service.onrender.com/
- **Frontend:** https://seu-site-render.onrender.com/ (será criado)
- **Documentação Render:** https://render.com/docs
- **API Render:** https://api.render.com/

---

## ⚠️ Notas Importantes

1. **Free Tier Render:** Serviço entra em sleep após 15 minutos de inatividade
   - Solução: Upgrade para pago ou usar keep-alive

2. **Build Time:** Build pode levar 2-5 minutos no Render
   - Verifique logs se demorar mais

3. **Storage:** Render oferece storage limitado
   - Frontend é apenas arquivos estáticos (não há problema)
   - Backend usa banco de dados externo (PostgreSQL)

4. **SSL/TLS:** Render fornece certificados automaticamente
   - Todos os endpoints são HTTPS

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique Render Dashboard → Logs
2. Verifique `.env.production` está correto
3. Verifique CORS no backend
4. Verifique se backend está online
5. Abra issue com logs de erro
