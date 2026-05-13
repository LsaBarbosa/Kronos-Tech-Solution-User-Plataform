# 🔧 Troubleshooting — Erro de Login "Resposta de login sem token"

## ❌ O Erro

Quando você tenta fazer login, recebe a mensagem:
```
Resposta de login sem token.
```

---

## 🔍 Como Diagnosticar

### Passo 1: Abra o Console do Navegador
1. Pressione `F12` no navegador (ou `Ctrl+Shift+I`)
2. Vá para a aba **Console**
3. Tente fazer login novamente
4. Procure por logs com `[auth.service]`

Você deve ver algo como:
```javascript
[auth.service] Login response: { status: 200, data: { token: "eyJhbG..." } }
```

### Passo 2: Verifique a Aba Network
1. Abra DevTools → **Network**
2. Faça login
3. Procure pela requisição `POST auth/login`
4. Clique nela e veja:
   - **Status**: Deve ser `200` ou `401`
   - **Response**: Deve mostrar `{ "token": "..." }` ou erro

#### ✅ Resposta Correta (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### ❌ Resposta Incorreta (Token Nulo)
```json
{
  "token": null
}
```

#### ❌ Resposta Incorreta (Campo Ausente)
```json
{}
```

#### ❌ Resposta de Erro (401)
```json
{
  "status": 401,
  "title": "Unauthorized",
  "detail": "Usuário ou senha inválidos"
}
```

---

## 🛠️ Possíveis Causas e Soluções

### 1. **Backend Retorna Token Null**

**Sintoma:** Status 200, mas `"token": null`

**Causa:** O backend está gerando um token nulo

**Solução:**
```bash
# Verifique o backend no servidor
# 1. Confirme que JWT_SECRET está definido
echo $JWT_SECRET

# 2. Verifique logs do backend
# (verifique o console/logs da aplicação backend)
```

### 2. **Credenciais Inválidas (401)**

**Sintoma:** Status 401 com mensagem "Usuário ou senha inválidos"

**Causa:** Usuário ou senha incorretos

**Solução:**
```bash
# Use credenciais corretas
# Valores de teste (se disponível):
username: admin@kronos.com
password: AdminPassword123

# Ou crie um novo usuário no backend
```

### 3. **Backend Não Está Retornando Resposta**

**Sintoma:** Requisição fica pendente ou timeout

**Causa:** Backend pode estar:
- Offline
- Lento
- Sob muita carga

**Solução:**
```bash
# Verifique se o backend está rodando
curl https://kronos-solutions-service.onrender.com/health

# Deve retornar algo como:
# { "status": "UP" }
```

### 4. **CORS Error**

**Sintoma:** Erro no Console: `Access to XMLHttpRequest blocked by CORS policy`

**Causa:** Backend não está configurado para aceitar requisições do frontend

**Solução:**
No backend (`SecurityConfig.java`), adicione o domínio do frontend aos allowed origins:
```java
corsConfigurationSource() {
  // Adicionar o domínio do seu frontend
  "https://seu-frontend-render.onrender.com"
}
```

### 5. **URL do Backend Incorreta**

**Sintoma:** Requisição vai para `localhost` em vez de Render

**Causa:** `VITE_API_BASE_URL` não está configurada

**Solução:**
```bash
# Verifique a variável de ambiente
echo $VITE_API_BASE_URL

# Deve ser algo como:
# https://kronos-solutions-service.onrender.com

# Se em desenvolvimento, configure:
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

---

## 📝 Validação Passo a Passo

### 1. Verificar Backend URL
```bash
# No DevTools Console, execute:
console.log(window.location.origin)
```

### 2. Testar Requisição Manualmente
```bash
# Via curl (substitua com suas credenciais)
curl -X POST https://kronos-solutions-service.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"seu-usuario","password":"sua-senha"}'

# Deve retornar:
# {"token":"eyJ..."}
```

### 3. Verificar no Frontend
```bash
# No DevTools Console:
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("Backend URL:", API_BASE_URL);

// Deve mostrar a URL correta do Render
```

---

## 🎯 Checklist de Resolução

- [ ] Backend está online (`/health` retorna 200)
- [ ] `VITE_API_BASE_URL` aponta para o URL correto
- [ ] Credenciais estão corretas
- [ ] Não há erro de CORS no console
- [ ] Requisição POST `/auth/login` retorna 200 com `token` presente
- [ ] Token é uma string não-vazia (começa com `eyJ...`)

---

## 💡 Debug Avançado

Se o problema persistir, adicione este código temporário no Console do DevTools:

```javascript
// 1. Teste a requisição diretamente
const response = await fetch('https://kronos-solutions-service.onrender.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'seu-usuario', password: 'sua-senha' })
});

const data = await response.json();
console.log('Status:', response.status);
console.log('Response:', data);
console.log('Has token:', !!data.token);
```

---

## 📞 Próximos Passos

Se nenhuma solução acima funcionar:

1. Verifique os logs do backend (Render Dashboard → Logs)
2. Confirme que o banco de dados está acessível
3. Verifique se `JWT_SECRET` está definido no Render Dashboard
4. Considere fazer redeploy do backend

---

## 🔗 Referências

- [docs/RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) — Configuração do Render
- [docs/ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md) — Variáveis de ambiente
