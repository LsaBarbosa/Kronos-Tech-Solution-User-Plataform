# Autenticação e Sessão

## Padrão de Autenticação

O Kronos front-end implementa autenticação baseada em **cookie HTTP-Only**, sem armazenamento de tokens em localStorage.

### Login

1. **Request:** `POST /auth/login` com `{ username, password }`
2. **Response:** `204 No Content` + header `Set-Cookie` com cookie HTTP-Only
3. **Front-end:** Cookie é gerenciado automaticamente pelo navegador; nenhum armazenamento local

Código relevante: [`src/service/auth.service.ts`](../src/service/auth.service.ts)

### Logout

1. **Request:** `POST /auth/logout` (cookie incluído automaticamente)
2. **Response:** Cookie expirado no backend (status 204 ou 302 com redirect)
3. **Front-end:** Estado local é limpo via `AuthContext.logout()`

Código relevante: [`src/context/AuthContext.tsx`](../src/context/AuthContext.tsx), linha 127

### Credenciais em Requisições

Todas as requisições HTTP incluem `withCredentials: true` no cliente Axios:

```ts
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // ← Envia cookies automaticamente
  headers: { "Content-Type": "application/json" },
});
```

Código: [`src/config/api.ts`](../src/config/api.ts)

## Tratamento de Erros de Autenticação

### 401 Unauthorized

- **Significado:** Token/sessão expirados
- **Ação:** Callback global registrado via `registerSessionExpiredHandler` (API 179)
- **Fluxo:**
  1. Backend retorna `401`
  2. Interceptor chamado: `onSessionExpiredCallback?.("expired")`
  3. `AuthContext.handleSessionExpired()` executa:
     - `clearSession()` limpa React state
     - `navigate("/login", { state: { reason: "session_expired" } })`
  4. `LoginForm.tsx` detecta `state.reason === "session_expired"` e exibe: "Tempo de sessão expirado."

Código: [`src/config/api.ts`](../src/config/api.ts) linha 179, [`src/context/AuthContext.tsx`](../src/context/AuthContext.tsx) linha 89

### 403 Forbidden com `TERMS_NOT_ACCEPTED`

- **Significado:** Usuário deve aceitar termos de biometria ou uso
- **Ação:** Mantém a sessão autenticada e bloqueia rotas protegidas com `TermsAcceptanceGate`
- **Fluxo:**
  1. Backend retorna `403 { type: "TERMS_NOT_ACCEPTED" }`
  2. Interceptor normaliza o erro como `ServiceError.kind = "terms"`
  3. `AuthContext.checkSession()` mantém `status="authenticated"` para permitir chamadas de termo
  4. `TermsAcceptanceGate` consulta `GET /terms/status`
  5. Se pendente, o modal obrigatório chama `POST /terms/accept-biometric`
  6. Após `204`, o cache de CSRF é invalidado, a sessão é revalidada e as rotas protegidas são liberadas

Código: [`src/config/api.ts`](../src/config/api.ts), [`src/context/AuthContext.tsx`](../src/context/AuthContext.tsx), [`src/components/TermsAcceptanceGate.tsx`](../src/components/TermsAcceptanceGate.tsx)

## Tratamento de 204 No Content

Respostas `204` não contêm corpo JSON. Os services esperam `Promise<void>`:

```ts
export const loginWithPassword = async (payload: LoginPayload): Promise<void> => {
  const response = await api.post(buildRoute(API_ROUTES.AUTH, AUTH_PATHS.LOGIN), payload);
  if (response.status !== 204) {
    throw new Error("Login falhou. Resposta inesperada do servidor.");
  }
  // Sem acesso a response.data (vazio)
};
```

Código: [`src/service/auth.service.ts`](../src/service/auth.service.ts) linha 19–25

**Validação de testes:** [`src/config/api.test.ts`](../src/config/api.test.ts) e todos os `.service.test.ts` validam explicitamente `response.status === 204`.

## Sessão e Expiração

A sessão é validada via chamada ao backend (`loadSessionProfile`). Se a sessão expirou, o backend retorna `401`.

### Fluxo de Revalidação

1. **Na montagem do app:** `AuthContext` monta com `status = "checking"`
2. **useEffect:** Chama `checkSession()` → `loadSessionProfile()`
3. **Se sucesso:** `status = "authenticated"`, dados do usuário carregados
4. **Se falha (401):** `handleSessionExpired()` executa redirect

Código: [`src/context/AuthContext.tsx`](../src/context/AuthContext.tsx) linha 50–65

### Ausência de Refresh Token

**Decisão:** O projeto **não implementa refresh tokens**. Motivos:

- Simplifica a lógica de autenticação (sem token rotation)
- Cookies HTTP-Only já protegem contra XSS
- A expiração é tratada com redirect amigável para o usuário
- Fluxos de longa duração (ex: relatórios) podem falhar se sessão expirar durante o processamento — isto é aceitável

Se o usuário é deslogado durante um fluxo:
1. Toast exibe: "Tempo de sessão expirado."
2. Redireciona para `/login`
3. Usuário faz login novamente
4. A maioria dos fluxos pode ser reiniciada

## Endpoints de Autenticação

Centralizados em [`src/config/api-routes.ts`](../src/config/api-routes.ts):

```ts
export const AUTH_PATHS = {
  LOGIN: "login",
  LOGIN_FACE: "login-face",
  RECOVER_PASSWORD: "recover-password",
  RESET_PASSWORD: "reset-password",
  LOGOUT: "logout",
} as const;
```

Services usam: `buildRoute(API_ROUTES.AUTH, AUTH_PATHS.LOGIN)`

## Termos Biométricos

Endpoints separados em [`src/config/api-routes.ts`](../src/config/api-routes.ts):

```ts
export const TERMS_PATHS = {
  STATUS: "status",
  ACCEPT_BIOMETRIC: "accept-biometric",
  REVOKE_BIOMETRIC: "revoke-biometric",
} as const;
```

Fluxo:
1. `checkBiometricTermsStatus()` → verifica se aceitos
2. Se não aceitos, usuário é redirecionado para servidor externo de termos
3. Após aceitar, `acceptBiometricTerms()` registra a aceitação

Código: [`src/service/terms.service.ts`](../src/service/terms.service.ts)

## Testes de Contrato

Todos os services de autenticação têm testes MSW que validam:
- ✓ Endpoint chamado corretamente
- ✓ Método HTTP correto
- ✓ Payload esperado
- ✓ `withCredentials` incluído
- ✓ Resposta esperada (204 para login/logout)
- ✓ Erros 401/403 tratados

Testes: [`src/service/auth.service.test.ts`](../src/service/auth.service.test.ts) e [`src/config/api.test.ts`](../src/config/api.test.ts)
