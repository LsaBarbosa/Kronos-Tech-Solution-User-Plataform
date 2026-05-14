# Checklist de Validação Front × Back

**Objetivo:** Validação de contrato entre front-end e back-end antes de deploy em produção.

**Frequência:** A ser executado antes de toda integração ou deploy em ambiente de staging/produção.

---

## Pré-requisitos

- [ ] Branch front-end em `PROD_HOSTINGER`
- [ ] Branch back-end em `PROD_HOSTINGER` (ou compatível)
- [ ] Ambos os serviços podem ser iniciados localmente ou em staging
- [ ] Back-end está acessível em `VITE_API_BASE_URL`

---

## Build & Verificação de Código

- [ ] `npm install` executa sem erros
- [ ] `npm run lint` retorna 0 warnings/errors
- [ ] `npx tsc --noEmit` retorna 0 erros de tipo
- [ ] `npm run test` — todos os testes passam (213+)
- [ ] `npm run build` gera artefato de produção sem erros
- [ ] Bundle analisado com `npm run analyze` — nenhum novo dependency pesado

---

## Autenticação e Sessão

- [ ] **Login com credenciais** (teste manual)
  - Post `/auth/login` com username/password
  - Response: `204 No Content`
  - Cookie `Set-Cookie` présente no header
  - Navegador armazena cookie HTTP-Only
  - Redireciona para `/dashboard`

- [ ] **Cookie salvo no navegador** (DevTools)
  - Abrir DevTools → Storage → Cookies
  - Verificar presença de cookie de sessão (ex: `JSESSIONID`, `session`, etc.)
  - Cookie tem `HttpOnly` ✓, `Secure` (em HTTPS) ✓, `SameSite` ✓

- [ ] **Logout funciona**
  - Clicar em "Sair" na sidebar
  - Post `/auth/logout` sem erro
  - Cookie expirado no backend
  - Redireciona para `/login`
  - Toast: "Logout bem-sucedido" ou similar

- [ ] **Sessão expirada tratada**
  - Simular expiração: alterar data/hora do sistema OU aguardar timeout configurado
  - Tentar acessar endpoint protegido
  - Response: `401`
  - Redireciona para `/login` com `state.reason = "session_expired"`
  - Toast: "Tempo de sessão expirado"
  - Usuário pode fazer login novamente

---

## Chamadas Protegidas

- [ ] **Após login, chamadas HTTP incluem credentials**
  - Abrir DevTools → Network
  - Qualquer POST/GET para backend
  - Request headers: `Cookie: [session cookie]`
  - CORS `Access-Control-Allow-Credentials: true` (se aplicável)

- [ ] **Endpoints protegidos retornam dados**
  - GET `/users/own-profile` → 200 + dados do usuário
  - GET `/records/pending-approvals` → 200 + array de aprovações
  - POST `/documents` (upload) → 201 + ID do documento

---

## Fluxos Críticos

- [ ] **Termo de biometria**
  - [ ] `GET /terms/status` retorna `{ accepted: true/false }`
  - [ ] Se não aceito, usuário vê modal para aceitar
  - [ ] POST `/terms/accept-biometric` → 204
  - [ ] Após aceitar, pode prosseguir

- [ ] **Login facial**
  - [ ] Câmera requerida funciona
  - [ ] Imagem capturada é enviada
  - [ ] POST `/auth/login-face` com base64
  - [ ] Response: `204` + cookie
  - [ ] Redireciona para `/dashboard`

- [ ] **Upload de documentos**
  - [ ] Selecionar arquivo PDF válido
  - [ ] POST `/documents` (multipart FormData)
  - [ ] Response: `201` com ID do documento
  - [ ] Toast: "Documento enviado com sucesso"
  - [ ] Arquivo aparece na lista

- [ ] **Download de documentos**
  - [ ] GET `/documents/{id}` (blob)
  - [ ] `Content-Disposition: attachment; filename="..."`
  - [ ] Arquivo é baixado no navegador
  - [ ] Nome do arquivo respeitado

- [ ] **Relatórios**
  - [ ] POST `/records/report` com datas + referência
  - [ ] Response: array de registros de tempo
  - [ ] Geração de PDF via jsPDF
  - [ ] Download funciona

- [ ] **Férias**
  - [ ] POST `/records/vacation-request` com datas + manager
  - [ ] Response: `201` com IDs criados
  - [ ] GET `/records/vacation-request?status=PENDING`
  - [ ] Lista férias pendentes
  - [ ] PATCH `/records/vacation-request/approve` → `204`

- [ ] **Abono**
  - [ ] POST `/records/time-off/request` (multipart com documento opcional)
  - [ ] Response: ID criado
  - [ ] GET `/records/time-off/requests`
  - [ ] PATCH `/records/time-off/approve/{id}` → `204`

---

## Mensagens de Erro

- [ ] **400 Validation Error**
  - [ ] Enviar dados inválidos (ex: email malformado)
  - [ ] Toast mostra: "Erro de validação. Verifique os dados informados." ou detalhe do backend
  - [ ] Nenhuma string técnica exposta

- [ ] **401 Unauthorized**
  - [ ] Token/sessão expirados
  - [ ] Toast: "Sessão expirada ou acesso não autorizado."
  - [ ] Redireciona para `/login`

- [ ] **403 Forbidden**
  - [ ] Usuário sem permissão tenta acessar recurso
  - [ ] Toast: "Sessão expirada ou acesso não autorizado."

- [ ] **409 Conflict**
  - [ ] Tentar criar CPF/username/CNPJ já existente
  - [ ] Toast: "Já existe um registro com esses dados." ou detalhe customizado
  - [ ] Nenhuma exception stack trace

- [ ] **429 Rate Limit**
  - [ ] Fazer múltiplas requisições rápidas (relatório já em processamento)
  - [ ] Toast: "Processamento em andamento. Aguarde alguns instantes e tente novamente."

- [ ] **503 Service Unavailable**
  - [ ] Backend indisponível
  - [ ] Toast: "Serviço temporariamente indisponível. Tente novamente em instantes."

---

## Console e Observabilidade

- [ ] **Console sem erros de CORS**
  - [ ] Abrir DevTools → Console
  - [ ] Nenhuma mensagem "Access-Control-Allow-Origin"
  - [ ] Nenhuma mensagem "CORS policy"

- [ ] **Console sem warnings de segurança**
  - [ ] Nenhuma mensagem sobre cookies inseguros
  - [ ] Nenhuma mensagem sobre XSS vulnerabilities

- [ ] **Sem console.error de endpoints não encontrados**
  - [ ] Nenhuma mensagem `404 Not Found` de requisições para endpoints inexistentes
  - [ ] Todos os endpoints esperados retornam dados

- [ ] **Observabilidade (se configurado)**
  - [ ] Se `VITE_OBSERVABILITY_ENABLED=true`, erros são capturados
  - [ ] Evento de erro registrado no backend de observabilidade
  - [ ] Nenhum dado sensível (token, senha, CPF, imagens) enviado

---

## Performance e Build

- [ ] **Bundle analisado**
  - [ ] Rodar `npm run analyze`
  - [ ] Abrir `dist/bundle-stats.html`
  - [ ] Nenhuma dependência nova >100KB sem justificativa
  - [ ] Lazy loading ativo (páginas em chunks separados)

- [ ] **Primeiro carregamento < 5s** (em rede 4G simulada)
  - [ ] DevTools → Network → Throttling: "Fast 3G"
  - [ ] Medir DOMContentLoaded + Load time
  - [ ] < 5s para interatividade inicial

---

## Responsividade e Acessibilidade

- [ ] **Desktop (> 1024px)**
  - [ ] Layout correto
  - [ ] Nenhum overflow
  - [ ] Todos os botões acessíveis

- [ ] **Tablet (768–1024px)**
  - [ ] Sidebar colapsável funciona
  - [ ] Formulários responsivos

- [ ] **Mobile (< 768px)**
  - [ ] Menu hambúrguer funciona
  - [ ] Touch targets > 44px
  - [ ] Sem horizontal scroll

- [ ] **Teclado (Tab key)**
  - [ ] Todos os botões/inputs acessíveis via Tab
  - [ ] Focus outline visível
  - [ ] Ordem lógica de navegação

---

## Decisão Final

- [ ] **Tudo acima foi validado**
- [ ] **Sem bloqueadores encontrados**
- [ ] **Pronto para deploy em staging**
- [ ] **Pronto para deploy em produção** (após validação em staging)

---

## Notas de Deploy

Ao completar este checklist:
1. Documentar data da validação
2. Documentar versões das branches (git commits)
3. Documentar tester responsável
4. Guardar screenshots de testes críticos (erro de 401, login facial, etc.)
5. Comunicar ao time de backend se algum endpoint ainda não foi validado
