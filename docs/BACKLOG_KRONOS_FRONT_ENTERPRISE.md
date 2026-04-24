# BACKLOG — Kronos Front-end Enterprise Alignment

## Repositório alvo

- Front-end: `LsaBarbosa/Kronos-Tech-Solution-User-Plataform`
- Branch alvo: `v4/fase4/limpeza`
- Backend de referência: `LsaBarbosa/Kronos-Tech-Solutions-KTS`
- Branch backend: `main`

## Objetivo geral

Alinhar o front-end 100% ao contrato real do backend `Kronos-Tech-Solutions-KTS` e elevar o projeto para um padrão enterprise, com foco em:

- aderência real aos endpoints do backend;
- autenticação e sessão consistentes;
- tratamento correto de termos biométricos;
- configuração por ambiente;
- testes automatizados;
- redução de risco de regressão;
- melhoria gradual de type safety;
- preparação para CI/CD.

## Regras gerais para execução pelo Codex CLI

### Restrições obrigatórias

- Não alterar o contrato do backend dentro deste backlog, exceto quando a task declarar explicitamente que há divergência que deve virar issue/backlog do backend.
- Não criar novos endpoints fictícios no front.
- Não usar `fetch` para chamadas internas ao backend Kronos.
- Toda chamada HTTP interna deve passar por `src/config/api.ts`.
- Toda rota de API deve usar `src/config/api-routes.ts`.
- Não quebrar rotas públicas de login, recuperação e reset de senha.
- Não remover funcionalidade existente sem substituir por equivalente validado.
- Não adicionar dependências sem necessidade clara.
- Não usar `any`.
- Não adicionar secrets no código-fonte.
- Não deixar URL de backend hardcoded.
- Manter compatibilidade com Vite + React + TypeScript.

### Comandos obrigatórios ao final de cada sprint

```bash
npm install
npm run lint
npm run test
npm run build
```

### Definição de pronto geral

Uma sprint só pode ser considerada concluída quando:

- todos os critérios de aceite das histórias forem atendidos;
- `npm run lint` passar;
- `npm run test` passar;
- `npm run build` passar;
- não houver endpoint inexistente chamado pelo front;
- não houver regressão em login e sessão.

---

# Sprint 1 — Correções críticas de contrato e ambiente

## Objetivo da sprint

Corrigir os bloqueadores que impedem homologação segura do front-end contra o backend real.

---

## História 1.1 — Corrigir contrato de termos biométricos

### Contexto

O backend retorna:

- `GET /terms/status` como `boolean` puro.
- `POST /terms/accept-biometric` como `LoginResponse`, contendo `token`.

O front-end atualmente trata `GET /terms/status` como objeto `{ accepted: boolean }`, o que pode interpretar incorretamente o retorno `true`.

### Arquivos alvo

- `src/service/terms.service.ts`
- `src/context/AuthContext.tsx`
- componentes ou páginas que chamem `acceptBiometricTerms`
- testes relacionados em `src/**/*.test.ts` ou `src/**/*.test.tsx`

### Tasks técnicas

- [ ] Alterar `getBiometricTermStatus()` para consumir `boolean` puro.
- [ ] Alterar `acceptBiometricTerms()` para consumir resposta `{ token: string }`.
- [ ] Garantir que o token retornado pelo aceite substitua o token anterior no storage.
- [ ] Garantir que o `AuthContext` recarregue a sessão após novo token.
- [ ] Garantir que `accepted` seja `true` após aceite bem-sucedido.
- [ ] Adicionar teste para `GET /terms/status` retornando `true`.
- [ ] Adicionar teste para `GET /terms/status` retornando `false`.
- [ ] Adicionar teste para `POST /terms/accept-biometric` retornando token.
- [ ] Adicionar teste garantindo persistência do novo token.

### Implementação esperada

```ts
export const getBiometricTermStatus = async (): Promise<BiometricTermsStatusResponse> => {
  const response = await api.get<boolean>(buildRoute(API_ROUTES.TERMS, "status"));

  return {
    accepted: response.data === true,
  };
};

export const acceptBiometricTerms = async (): Promise<BiometricTermsAcceptResponse> => {
  const response = await api.post<{ token: string }>(
    buildRoute(API_ROUTES.TERMS, "accept-biometric")
  );

  if (!response.data?.token) {
    throw new Error("Resposta de aceite biométrico sem token.");
  }

  return {
    accepted: true,
    token: response.data.token,
  };
};
```

### Critérios de aceite

- [ ] Quando o backend retorna `true`, o front interpreta `accepted: true`.
- [ ] Quando o backend retorna `false`, o front interpreta `accepted: false`.
- [ ] Após aceitar o termo, o novo token é salvo.
- [ ] Após aceitar o termo, a sessão é recarregada.
- [ ] O usuário não entra em loop de redirecionamento para termo.
- [ ] Testes automatizados cobrem sucesso e falha.

### Validação

```bash
npm run test -- terms
npm run lint
npm run build
```

---

## História 1.2 — Remover URL hardcoded do backend

### Contexto

O front-end usa `http://localhost:8080/` diretamente em `src/config/api.ts`. Isso impede configuração adequada por ambiente.

### Arquivos alvo

- `src/config/api.ts`
- `.env.example`
- `README.md`

### Tasks técnicas

- [ ] Substituir `API_BASE_URL` hardcoded por `import.meta.env.VITE_API_BASE_URL`.
- [ ] Definir fallback local seguro para desenvolvimento.
- [ ] Criar `.env.example`.
- [ ] Documentar variáveis de ambiente no `README.md`.
- [ ] Garantir que produção não dependa de localhost.
- [ ] Garantir que testes consigam sobrescrever base URL.

### Implementação esperada

```ts
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
```

### `.env.example` esperado

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_HERE_API_KEY=
```

### Critérios de aceite

- [ ] Nenhuma chamada interna depende de backend fixo em localhost.
- [ ] `.env.example` existe.
- [ ] README explica as variáveis.
- [ ] `npm run build` funciona sem quebrar import de env.
- [ ] Ambiente local continua funcional.

### Validação

```bash
grep -R "http://localhost:8080" src || true
npm run build
```

---

## História 1.3 — Bloquear chamadas gerenciais indevidas no Dashboard

### Contexto

Alguns endpoints como `GET /records/pending-approvals` exigem perfil `MANAGER`. O Dashboard não deve chamar endpoints gerenciais quando o usuário autenticado for `PARTNER`.

### Arquivos alvo

- `src/service/dashboard.service.ts`
- `src/pages/Dashboard.tsx`
- `src/hooks/useUser.ts`
- `src/context/AuthContext.tsx`

### Tasks técnicas

- [ ] Identificar chamadas do Dashboard que exigem `MANAGER`.
- [ ] Condicionar chamadas por `role`.
- [ ] Para `PARTNER`, não chamar endpoints gerenciais.
- [ ] Para `MANAGER`, manter comportamento atual.
- [ ] Para `CTO`, seguir a matriz de permissões definida na História 1.4.
- [ ] Adicionar teste garantindo que `PARTNER` não chama `/records/pending-approvals`.
- [ ] Adicionar teste garantindo que `MANAGER` chama `/records/pending-approvals`.

### Critérios de aceite

- [ ] Usuário `PARTNER` não recebe erro 403 no Dashboard por chamada gerencial.
- [ ] Usuário `MANAGER` continua vendo pendências.
- [ ] Dashboard renderiza corretamente para `PARTNER`, `MANAGER` e `CTO`.
- [ ] Testes cobrem os comportamentos por role.

### Validação

```bash
npm run test -- dashboard
npm run lint
npm run build
```

---

## História 1.4 — Definir matriz de permissões CTO/MANAGER/PARTNER no front

### Contexto

Há divergência entre a visão funcional e alguns endpoints reais do backend. O front precisa refletir o que o backend realmente permite até que o backend seja ajustado.

### Arquivos alvo

- `src/config/app-routes.ts`
- `src/components/RoleRoute.tsx`
- `src/components/Sidebar.tsx`
- `src/context/AuthContext.tsx`
- documentação em `README.md` ou `docs/permissions.md`

### Tasks técnicas

- [ ] Criar documento `docs/permissions.md`.
- [ ] Mapear as permissões por rota front-end.
- [ ] Mapear as permissões por endpoint consumido.
- [ ] Garantir que nenhuma rota visível gere 403 previsível.
- [ ] Revisar `APP_ROUTE_META`.
- [ ] Revisar Sidebar/Menu para respeitar `allowedRoles`.
- [ ] Adicionar teste de `RoleRoute`.

### Matriz inicial esperada

| Área | PARTNER | MANAGER | CTO |
|---|---:|---:|---:|
| Dashboard | Sim | Sim | Sim |
| Perfil | Sim | Sim | Sim |
| Documentos próprios | Sim | Sim | Sim |
| Relatórios próprios | Sim | Sim | Sim |
| Empresas | Não | Não | Sim |
| Colaboradores | Não | Sim | Validar backend |
| Usuários | Limitado | Sim | Validar backend |
| Aprovações de ponto | Não | Sim | Validar backend |
| Férias gerenciais | Não | Sim | Validar backend |
| Abonos gerenciais | Não | Sim | Validar backend |
| Auditoria fiscal | Não | Sim | Sim, se backend permitir |

### Critérios de aceite

- [ ] `docs/permissions.md` criado.
- [ ] Rotas do front refletem permissões reais do backend.
- [ ] Sidebar não exibe item sem permissão.
- [ ] `RoleRoute` bloqueia acesso manual por URL.
- [ ] Testes cobrem pelo menos `PARTNER`, `MANAGER` e `CTO`.

### Validação

```bash
npm run test -- RoleRoute
npm run lint
npm run build
```

---

# Sprint 2 — Testes de contrato e MSW

## Objetivo da sprint

Criar uma base de testes que garanta que o front não volte a chamar endpoints inexistentes ou interpretar payloads incorretamente.

---

## História 2.1 — Criar handlers MSW por domínio

### Arquivos alvo

- `src/test/mocks/server.ts`
- `src/test/mocks/handlers.ts`
- `src/test/mocks/fixtures/auth.fixture.ts`
- `src/test/mocks/fixtures/user.fixture.ts`
- `src/test/mocks/fixtures/employee.fixture.ts`
- `src/test/mocks/fixtures/document.fixture.ts`
- `src/test/mocks/fixtures/records.fixture.ts`

### Tasks técnicas

- [ ] Criar `handlers.ts`.
- [ ] Registrar handlers no `setupServer`.
- [ ] Criar fixture para login.
- [ ] Criar fixture para usuário.
- [ ] Criar fixture para colaborador.
- [ ] Criar fixture para documentos.
- [ ] Criar fixture para registros de ponto.
- [ ] Criar fixture para férias.
- [ ] Criar fixture para abonos.
- [ ] Criar fixture para fiscal/legal.

### Endpoints mínimos a mockar

```txt
POST /auth/login
POST /auth/login-face
POST /auth/recover-password
POST /auth/reset-password

GET /users/own-profile
GET /users/search
PUT /users/password

GET /employee/own-profile
GET /employee
GET /employee/check-cpf
POST /employee
PATCH /employee/manager/update-employee/:employeeId

GET /companies
GET /companies/:cnpj
GET /companies/check-cnpj
POST /companies
PATCH /companies/:cnpj
PATCH /companies/:cnpj/toggle-activate

GET /terms/status
POST /terms/accept-biometric

GET /documents
POST /documents
GET /documents/:documentId
DELETE /documents/:documentId

GET /messages
POST /messages
DELETE /messages/:messageId

POST /records/report
POST /records/report/simple
GET /records/pending-approvals
PATCH /records/approve/:timeRecordId
PATCH /records/reject/:timeRecordId
POST /records/vacation-request
GET /records/vacation-request
PATCH /records/vacation-request/approve
PATCH /records/vacation-request/reject
POST /records/time-off/request
GET /records/time-off/requests
PATCH /records/time-off/approve/:timeRecordId
PATCH /records/time-off/reject/:timeRecordId

GET /legal/technical-certificate
GET /legal/afd
GET /legal/aej
GET /legal/espelho-ponto
```

### Critérios de aceite

- [ ] MSW possui handlers mínimos por domínio.
- [ ] `onUnhandledRequest: "error"` permanece ativo.
- [ ] Teste falha se o front chamar rota não mockada.
- [ ] Fixtures ficam separadas por domínio.
- [ ] Nenhum teste depende do backend real.

### Validação

```bash
npm run test
```

---

## História 2.2 — Testar autenticação e sessão

### Arquivos alvo

- `src/service/auth.service.test.ts`
- `src/context/AuthContext.test.tsx`
- `src/components/ProtectedRoute.test.tsx`
- `src/components/LoginForm.test.tsx`
- `src/components/FaceLoginModal.test.tsx`

### Tasks técnicas

- [ ] Testar login por senha com sucesso.
- [ ] Testar login por senha com erro 401.
- [ ] Testar login facial com sucesso.
- [ ] Testar login facial com erro de face não reconhecida.
- [ ] Testar `AuthProvider` sem token.
- [ ] Testar `AuthProvider` com token válido.
- [ ] Testar `AuthProvider` com token inválido.
- [ ] Testar `ProtectedRoute` em `checking`.
- [ ] Testar `ProtectedRoute` em `authenticated`.
- [ ] Testar `ProtectedRoute` em `unauthenticated`.

### Critérios de aceite

- [ ] Login salva token corretamente.
- [ ] Sessão inválida limpa token.
- [ ] Rota protegida não vaza conteúdo durante `checking`.
- [ ] Rota protegida redireciona para `/login` quando necessário.
- [ ] Testes cobrem senha e biometria.

### Validação

```bash
npm run test -- auth
npm run test -- ProtectedRoute
npm run test -- LoginForm
```

---

## História 2.3 — Testar services de contrato com backend

### Arquivos alvo

- `src/service/terms.service.test.ts`
- `src/service/company.service.test.ts`
- `src/service/collaborator-management.service.test.ts`
- `src/service/document.service.test.ts`
- `src/service/records.service.test.ts`
- `src/service/fiscal.service.test.ts`
- `src/service/message.service.test.ts`
- `src/service/dashboard.service.test.ts`

### Tasks técnicas

- [ ] Testar `terms.service`.
- [ ] Testar `company.service`.
- [ ] Testar `collaborator-management.service`.
- [ ] Testar `document.service`.
- [ ] Testar `records.service`.
- [ ] Testar `fiscal.service`.
- [ ] Testar `message.service`.
- [ ] Testar `dashboard.service`.

### Critérios de aceite

- [ ] Cada service tem teste de sucesso.
- [ ] Cada service crítico tem teste de erro.
- [ ] Upload multipart é validado.
- [ ] Download blob é validado.
- [ ] Rotas chamadas batem com o backend real.
- [ ] Nenhum service usa endpoint legado.

### Validação

```bash
npm run test -- service
npm run lint
npm run build
```

---

# Sprint 3 — Documentos, férias, abonos e relatórios

## Objetivo da sprint

Fechar os domínios operacionais mais sensíveis do sistema.

---

## História 3.1 — Completar aderência de documentos

### Arquivos alvo

- `src/service/document.service.ts`
- `src/types/document.ts`
- `src/pages/Documentos.tsx`
- `src/pages/EnviarDocumentos.tsx`
- `src/pages/DocumentoColaborador.tsx`
- `src/hooks/useDocumentUpload.ts`

### Tasks técnicas

- [ ] Garantir suporte ao filtro `type`.
- [ ] Garantir suporte ao filtro `date`.
- [ ] Garantir suporte ao filtro `employeeId`.
- [ ] Validar MIME type antes do upload.
- [ ] Validar tamanho máximo antes do upload.
- [ ] Mapear corretamente `documentId`, `fileName`, `uploadedAt`, `documentType`.
- [ ] Garantir download com `Content-Disposition`.
- [ ] Garantir exclusão com `DELETE /documents/{documentId}`.
- [ ] Adicionar teste para listagem própria.
- [ ] Adicionar teste para listagem por colaborador.
- [ ] Adicionar teste para upload.
- [ ] Adicionar teste para download.
- [ ] Adicionar teste para exclusão.

### Critérios de aceite

- [ ] Listagem funciona para usuário comum.
- [ ] Listagem funciona para gestor.
- [ ] Upload envia `multipart/form-data` com `file`, `employeeId` e `type`.
- [ ] Download salva arquivo com nome correto.
- [ ] Exclusão chama endpoint correto.
- [ ] Arquivo inválido é bloqueado antes da chamada HTTP.
- [ ] Testes passam.

### Validação

```bash
npm run test -- document
npm run lint
npm run build
```

---

## História 3.2 — Padronizar férias conforme contrato real

### Contexto

O backend retorna lista em `GET /records/vacation-request`, mas o front tenta montar resposta paginada. Essa divergência deve ser tratada no front ou documentada como ajuste necessário no backend.

### Arquivos alvo

- `src/service/records.service.ts`
- `src/types/vacation.ts`
- `src/pages/VacationApprovals.tsx`
- `src/pages/RequestVacation.tsx`
- `src/hooks/useVacationApprovals.ts`, se existir

### Tasks técnicas

- [ ] Validar formato real de retorno usado pela tela.
- [ ] Ajustar front para aceitar array direto.
- [ ] Manter fallback para envelope paginado, se já existir.
- [ ] Criar tipo específico para resposta de lista direta.
- [ ] Evitar assumir `totalPages` se backend não retorna.
- [ ] Garantir paginação visual coerente.
- [ ] Criar issue técnica documentando recomendação de backend paginado, se necessário.
- [ ] Testar listagem de férias pendentes.
- [ ] Testar aprovação de férias.
- [ ] Testar rejeição de férias.
- [ ] Testar solicitação de férias.

### Critérios de aceite

- [ ] Tela de férias funciona com array direto.
- [ ] Tela não quebra se backend não retorna `totalPages`.
- [ ] Aprovação envia `{ timeRecordIds: number[] }`.
- [ ] Rejeição envia `{ timeRecordIds: number[] }`.
- [ ] Solicitação envia `startDate`, `endDate`, `managerId`.
- [ ] Testes passam.

### Validação

```bash
npm run test -- vacation
npm run lint
npm run build
```

---

## História 3.3 — Fortalecer fluxo de abonos e esquecimento de marcação

### Arquivos alvo

- `src/service/records.service.ts`
- `src/types/vacation.ts`
- `src/types/recordApproval.ts`
- `src/pages/RequestManualRegistration.tsx`
- `src/pages/ManualRegisterApprovals.tsx`
- `src/hooks/useManualRegister.ts`

### Tasks técnicas

- [ ] Garantir uso exclusivo de `POST /records/time-off/request`.
- [ ] Remover qualquer referência a rota antiga `records/time-off-request`.
- [ ] Garantir envio multipart com parte `request`.
- [ ] Garantir envio opcional da parte `document`.
- [ ] Garantir filtros `status`, `employeeName`, `page`, `size`.
- [ ] Garantir aprovação em `PATCH /records/time-off/approve/{timeRecordId}`.
- [ ] Garantir rejeição em `PATCH /records/time-off/reject/{timeRecordId}`.
- [ ] Testar solicitação sem documento.
- [ ] Testar solicitação com documento.
- [ ] Testar aprovação.
- [ ] Testar rejeição.
- [ ] Testar listagem paginada.

### Critérios de aceite

- [ ] Nenhuma rota antiga de abono é encontrada no projeto.
- [ ] Multipart enviado segue contrato do backend.
- [ ] Documento é opcional.
- [ ] Listagem gerencial funciona.
- [ ] Aprovação e rejeição funcionam.
- [ ] Testes passam.

### Validação

```bash
grep -R "time-off-request" src || true
npm run test -- time-off
npm run lint
npm run build
```

---

## História 3.4 — Validar relatórios detalhado e simples

### Arquivos alvo

- `src/service/records.service.ts`
- `src/pages/RelatorioDetalhado.tsx`
- `src/components/ResultadosRelatorioDetalhado.tsx`
- `src/components/ResultadosRelatorioSimples.tsx`
- `src/utils/report-utils.ts`

### Tasks técnicas

- [ ] Garantir `POST /records/report`.
- [ ] Garantir `POST /records/report/simple`.
- [ ] Garantir query param opcional `employeeId`.
- [ ] Garantir body com `reference`, `active`, `dates`, `statuses`.
- [ ] Validar formato de `reference` como `HH:mm`.
- [ ] Validar datas antes da chamada.
- [ ] Tratar lista vazia.
- [ ] Tratar erro 400.
- [ ] Tratar erro 403.
- [ ] Testar relatório próprio.
- [ ] Testar relatório por colaborador.
- [ ] Testar resposta vazia.
- [ ] Testar erro de validação.

### Critérios de aceite

- [ ] Relatório detalhado funciona para próprio usuário.
- [ ] Relatório detalhado funciona para gestor com `employeeId`.
- [ ] Relatório simples funciona.
- [ ] UI mostra vazio sem quebrar.
- [ ] Erros são exibidos com helper padrão.
- [ ] Testes passam.

### Validação

```bash
npm run test -- report
npm run lint
npm run build
```

---

# Sprint 4 — Segurança, geolocalização e configuração enterprise

## Objetivo da sprint

Reduzir exposição no front-end e preparar o projeto para produção real.

---

## História 4.1 — Remover dependência direta de geocoding externo no navegador

### Contexto

O front chama ViaCEP e HERE diretamente para obter latitude/longitude. Mesmo com variável `VITE_HERE_API_KEY`, chave `VITE_*` fica exposta no bundle.

### Arquivos alvo

- `src/service/company.service.ts`
- `src/pages/CriarEmpresa.tsx`
- `src/hooks/useUpdateCompanyForm.ts`
- documentação em `docs/backend-required-changes.md`

### Tasks técnicas

- [ ] Criar abstração interna para geolocalização no front.
- [ ] Isolar chamada atual em função única.
- [ ] Documentar necessidade de endpoint backend futuro.
- [ ] Preparar front para trocar implementação sem alterar telas.
- [ ] Não quebrar criação de empresa.
- [ ] Não quebrar atualização de empresa.
- [ ] Adicionar teste para erro de chave ausente.
- [ ] Adicionar teste para erro de CEP inválido.

### Endpoint backend recomendado para backlog futuro

```txt
POST /geolocation/resolve
```

Payload sugerido:

```json
{
  "postalCode": "00000000",
  "number": "123"
}
```

Resposta sugerida:

```json
{
  "latitude": -22.000000,
  "longitude": -43.000000
}
```

### Critérios de aceite

- [ ] Geolocalização está isolada em uma camada única.
- [ ] Nenhuma tela chama HERE diretamente.
- [ ] Documentação de melhoria backend criada.
- [ ] Criação de empresa continua funcionando.
- [ ] Atualização de empresa continua funcionando.

### Validação

```bash
grep -R "hereapi" src
npm run test -- company
npm run lint
npm run build
```

---

## História 4.2 — Criar Error Boundary global

### Arquivos alvo

- `src/components/AppErrorBoundary.tsx`
- `src/App.tsx`
- `src/components/ui/*`, se necessário

### Tasks técnicas

- [ ] Criar componente `AppErrorBoundary`.
- [ ] Capturar erros inesperados de renderização.
- [ ] Exibir tela amigável.
- [ ] Adicionar botão para voltar ao Dashboard.
- [ ] Adicionar botão para recarregar página.
- [ ] Envolver a árvore protegida ou toda aplicação.
- [ ] Adicionar teste de componente quebrando propositalmente.

### Critérios de aceite

- [ ] Erro de renderização não deixa tela branca.
- [ ] Usuário vê mensagem amigável.
- [ ] Existe ação de recuperação.
- [ ] Teste cobre fallback.

### Validação

```bash
npm run test -- ErrorBoundary
npm run lint
npm run build
```

---

## História 4.3 — Padronizar tratamento de erro na UI

### Arquivos alvo

- `src/service/helpers/service-error.helper.ts`
- services que ainda fazem `try/catch` desnecessário
- páginas que exibem toast de erro

### Tasks técnicas

- [ ] Revisar services com `try/catch`.
- [ ] Remover `try/catch` duplicado quando interceptor já normaliza.
- [ ] Garantir uso de `getServiceErrorMessage`.
- [ ] Padronizar mensagens de erro em toast.
- [ ] Tratar `400`, `401`, `403`, `404`, `500` de forma consistente.
- [ ] Garantir que erro de termos continue com tipo `terms`.
- [ ] Adicionar testes do helper.

### Critérios de aceite

- [ ] Mensagens de erro ficam consistentes entre telas.
- [ ] Services não duplicam parsing de erro.
- [ ] Erro 401 limpa sessão.
- [ ] Erro 403 de termo redireciona corretamente.
- [ ] Testes passam.

### Validação

```bash
npm run test -- service-error
npm run lint
npm run build
```

---

# Sprint 5 — TypeScript strict e qualidade de código

## Objetivo da sprint

Aumentar segurança estática do front-end sem reescrever a aplicação.

---

## História 5.1 — Ativar `strictNullChecks`

### Arquivos alvo

- `tsconfig.json`
- `tsconfig.app.json`
- arquivos impactados pelo compilador

### Tasks técnicas

- [ ] Ativar `strictNullChecks`.
- [ ] Corrigir erros por domínio.
- [ ] Garantir fallback explícito para dados opcionais.
- [ ] Evitar `as` desnecessário.
- [ ] Evitar supressões com comentário.
- [ ] Rodar build.

### Critérios de aceite

- [ ] `strictNullChecks` ativo.
- [ ] `npm run build` passa.
- [ ] Não foram adicionados `any`.
- [ ] Não foram adicionados ignores de TypeScript.

### Validação

```bash
npm run build
npm run lint
```

---

## História 5.2 — Ativar `noImplicitAny`

### Arquivos alvo

- `tsconfig.json`
- `tsconfig.app.json`
- arquivos impactados pelo compilador

### Tasks técnicas

- [ ] Ativar `noImplicitAny`.
- [ ] Tipar parâmetros implícitos.
- [ ] Tipar callbacks.
- [ ] Tipar responses de services.
- [ ] Tipar handlers de eventos.
- [ ] Rodar build.

### Critérios de aceite

- [ ] `noImplicitAny` ativo.
- [ ] Nenhum `any` explícito foi adicionado.
- [ ] Build passa.
- [ ] Lint passa.

### Validação

```bash
npm run lint
npm run build
```

---

## História 5.3 — Fortalecer ESLint

### Arquivos alvo

- `eslint.config.js`

### Tasks técnicas

- [ ] Adicionar `eqeqeq`.
- [ ] Adicionar `prefer-const`.
- [ ] Adicionar `@typescript-eslint/consistent-type-imports`.
- [ ] Avaliar `@typescript-eslint/no-floating-promises`.
- [ ] Avaliar `@typescript-eslint/no-misused-promises`.
- [ ] Corrigir violações.
- [ ] Manter exceções somente em testes quando necessário.

### Critérios de aceite

- [ ] Regras novas ativas.
- [ ] Lint passa.
- [ ] Nenhuma regra importante é desligada globalmente sem justificativa.

### Validação

```bash
npm run lint
npm run build
```

---

# Sprint 6 — CI/CD e documentação enterprise

## Objetivo da sprint

Garantir que toda alteração futura passe por validação automatizada e que o projeto seja compreensível para novos desenvolvedores.

---

## História 6.1 — Criar pipeline CI para Pull Requests

### Arquivos alvo

- `.github/workflows/ci.yml`

### Tasks técnicas

- [ ] Criar workflow `ci.yml`.
- [ ] Configurar trigger em `pull_request`.
- [ ] Configurar trigger em push para branches principais.
- [ ] Usar Node LTS.
- [ ] Rodar `npm ci`.
- [ ] Rodar `npm run lint`.
- [ ] Rodar `npm run test`.
- [ ] Rodar `npm run build`.
- [ ] Cachear dependências npm.

### Workflow esperado

```yaml
name: Frontend CI

on:
  pull_request:
  push:
    branches:
      - main
      - v4/fase4/limpeza

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test

      - name: Build
        run: npm run build
```

### Critérios de aceite

- [ ] Workflow existe.
- [ ] PR executa lint, testes e build.
- [ ] Pipeline falha se teste falhar.
- [ ] Pipeline falha se build falhar.
- [ ] Pipeline falha se lint falhar.

### Validação

```bash
npm run lint
npm run test
npm run build
```

---

## História 6.2 — Reescrever README técnico

### Arquivos alvo

- `README.md`

### Tasks técnicas

- [ ] Remover conteúdo genérico do Lovable.
- [ ] Documentar objetivo do projeto.
- [ ] Documentar stack.
- [ ] Documentar instalação local.
- [ ] Documentar variáveis de ambiente.
- [ ] Documentar comandos.
- [ ] Documentar arquitetura de pastas.
- [ ] Documentar fluxo de autenticação.
- [ ] Documentar integração com backend.
- [ ] Documentar testes.
- [ ] Documentar troubleshooting.

### Estrutura esperada

```md
# Kronos User Platform

## Visão geral
## Stack
## Requisitos
## Variáveis de ambiente
## Como rodar localmente
## Como rodar testes
## Como gerar build
## Arquitetura
## Integração com backend
## Autenticação e sessão
## Padrões de service
## Testes
## Troubleshooting
```

### Critérios de aceite

- [ ] README não contém mais texto genérico do Lovable como documentação principal.
- [ ] Novo desenvolvedor consegue rodar o projeto localmente.
- [ ] Variáveis de ambiente estão claras.
- [ ] Comandos principais estão documentados.

### Validação

```bash
cat README.md
npm run build
```

---

## História 6.3 — Criar documentação de contrato front x backend

### Arquivos alvo

- `docs/api-contract-map.md`

### Tasks técnicas

- [ ] Criar tabela de endpoints consumidos.
- [ ] Informar service responsável por endpoint.
- [ ] Informar tela/hook consumidor.
- [ ] Informar método HTTP.
- [ ] Informar payload esperado.
- [ ] Informar retorno esperado.
- [ ] Marcar endpoints pendentes ou divergentes.

### Estrutura esperada

```md
# API Contract Map

| Domínio | Método | Endpoint | Service | Tela/Hook | Payload | Retorno | Status |
|---|---|---|---|---|---|---|---|
```

### Critérios de aceite

- [ ] Documento cobre todos os services.
- [ ] Nenhum endpoint interno fica sem mapeamento.
- [ ] Divergências são marcadas.
- [ ] Documento ajuda revisão futura.

### Validação

```bash
grep -R "api\." src/service src/hooks src/pages
```

---

# Sprint 7 — Hardening final e limpeza

## Objetivo da sprint

Remover resíduos, padronizar arquitetura e garantir previsibilidade para manutenção futura.

---

## História 7.1 — Remover endpoints legados e código morto

### Arquivos alvo

- `src/service`
- `src/pages`
- `src/hooks`
- `src/components`

### Tasks técnicas

- [ ] Buscar endpoints antigos.
- [ ] Remover services mortos.
- [ ] Remover imports não utilizados.
- [ ] Remover helpers duplicados.
- [ ] Remover comentários obsoletos.
- [ ] Garantir que todo service ativo usa `api.ts`.
- [ ] Garantir que todo endpoint usa `API_ROUTES`.

### Buscas obrigatórias

```bash
grep -R "fetch(" src || true
grep -R "auth/username-availability" src || true
grep -R "companies/list-basic" src || true
grep -R "employees/create-partner" src || true
grep -R "employees/create-manager" src || true
grep -R "employees/" src || true
grep -R "documents/me" src || true
grep -R "documents/employee" src || true
grep -R "documents/upload" src || true
grep -R "records/time-off-request" src || true
```

### Critérios de aceite

- [ ] Nenhum endpoint inexistente permanece.
- [ ] Nenhum `fetch` interno para backend Kronos permanece.
- [ ] Services duplicados foram removidos.
- [ ] Build passa.
- [ ] Lint passa.
- [ ] Testes passam.

### Validação

```bash
npm run lint
npm run test
npm run build
```

---

## História 7.2 — Padronizar nomenclatura de services

### Arquivos alvo

- `src/service`

### Tasks técnicas

- [ ] Padronizar nomes em kebab-case ou camel-case.
- [ ] Escolher padrão único: recomendado `*.service.ts`.
- [ ] Renomear arquivos divergentes.
- [ ] Atualizar imports.
- [ ] Garantir que barrel exports não quebrem, se existirem.
- [ ] Rodar build.

### Padrão esperado

```txt
auth.service.ts
company.service.ts
collaborator-management.service.ts
dashboard.service.ts
document.service.ts
fiscal.service.ts
message.service.ts
records.service.ts
session-profile.service.ts
terms.service.ts
user.service.ts
```

### Critérios de aceite

- [ ] Services seguem padrão único.
- [ ] Imports atualizados.
- [ ] Build passa.
- [ ] Testes passam.

### Validação

```bash
find src/service -maxdepth 1 -type f
npm run lint
npm run test
npm run build
```

---

## História 7.3 — Checklist final de aderência ao backend

### Arquivos alvo

- `docs/api-contract-map.md`
- `src/service/*`
- `src/config/api-routes.ts`

### Tasks técnicas

- [ ] Conferir todos os endpoints de auth.
- [ ] Conferir todos os endpoints de terms.
- [ ] Conferir todos os endpoints de companies.
- [ ] Conferir todos os endpoints de employee.
- [ ] Conferir todos os endpoints de users.
- [ ] Conferir todos os endpoints de documents.
- [ ] Conferir todos os endpoints de messages.
- [ ] Conferir todos os endpoints de records.
- [ ] Conferir todos os endpoints de legal.
- [ ] Marcar divergências que dependem do backend.
- [ ] Garantir testes mínimos por domínio.

### Critérios de aceite

- [ ] Documento de contrato está completo.
- [ ] Services refletem o backend real.
- [ ] Não há endpoint inexistente.
- [ ] Não há payload incompatível conhecido.
- [ ] Testes cobrem fluxos críticos.
- [ ] CI passa.

### Validação final

```bash
npm ci
npm run lint
npm run test
npm run build
```

---

# Checklist final para considerar o front-end enterprise-ready

- [ ] API base configurável por ambiente.
- [ ] Nenhum segredo no código.
- [ ] Nenhum endpoint legado.
- [ ] Nenhum `fetch` interno para backend Kronos.
- [ ] `AuthProvider` centraliza sessão.
- [ ] `ProtectedRoute` usa estado real de autenticação.
- [ ] `RoleRoute` respeita matriz de permissões.
- [ ] Termo biométrico trata boolean e token corretamente.
- [ ] Services têm testes com MSW.
- [ ] Uploads e downloads são testados.
- [ ] Relatórios são testados.
- [ ] Férias são testadas.
- [ ] Abonos são testados.
- [ ] Documentos são testados.
- [ ] Fiscal/legal é testado.
- [ ] CI executa lint, test e build.
- [ ] README técnico atualizado.
- [ ] `docs/api-contract-map.md` criado.
- [ ] `docs/permissions.md` criado.
- [ ] TypeScript mais restritivo.
- [ ] ESLint fortalecido.
- [ ] Build de produção validado.

---

# Ordem recomendada para Codex CLI

Executar nesta ordem:

```txt
1. Sprint 1 — Correções críticas de contrato e ambiente
2. Sprint 2 — Testes de contrato e MSW
3. Sprint 3 — Documentos, férias, abonos e relatórios
4. Sprint 4 — Segurança, geolocalização e configuração enterprise
5. Sprint 5 — TypeScript strict e qualidade de código
6. Sprint 6 — CI/CD e documentação enterprise
7. Sprint 7 — Hardening final e limpeza
```

Não executar Sprint 5 antes de Sprint 1, 2 e 3, para evitar excesso de refatoração sem estabilizar contrato.
