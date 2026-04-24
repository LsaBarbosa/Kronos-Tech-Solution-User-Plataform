

# Backlog operacional — Refatoração Front-end Kronos

## Objetivo macro

Garantir que o front-end consuma corretamente o contrato real do backend, removendo chamadas antigas, padronizando autenticação, centralizando comunicação HTTP, consolidando services por domínio e cobrindo os fluxos críticos com testes.

## Prioridades

| Prioridade | Descrição                                     |
| ---------- | --------------------------------------------- |
| P0         | Bloqueia funcionamento correto do sistema     |
| P1         | Importante para estabilidade e manutenção     |
| P2         | Melhoria estrutural ou técnica não bloqueante |

---

# Sprint 0 — Validação técnica e contrato real da API

## Objetivo da sprint

Criar uma visão objetiva entre o que o front-end chama hoje e o que o backend realmente expõe. Antes de refatorar, é necessário impedir alterações baseadas em suposição.

---

## História S0-H01 — Mapear chamadas atuais do front-end

**Como** desenvolvedor,
**quero** identificar todas as chamadas HTTP existentes no front-end,
**para** saber quais services, hooks e componentes estão consumindo APIs do backend.

### Tasks técnicas

* Procurar no projeto por:

  * `fetch(`
  * `axios.`
  * `api.get`
  * `api.post`
  * `api.put`
  * `api.patch`
  * `api.delete`
  * strings contendo `/auth`, `/users`, `/employee`, `/records`, `/documents`, `/companies`, `/messages`, `/legal`, `/terms`.
* Criar uma matriz com:

  * arquivo
  * método HTTP
  * endpoint chamado
  * domínio funcional
  * se usa `api.ts`
  * se usa `fetch`
  * se exige token
  * se existe no backend.
* Separar chamadas por domínio:

  * autenticação
  * empresas
  * colaboradores
  * usuários
  * documentos
  * mensagens
  * ponto
  * férias
  * abonos
  * legal/fiscal
  * termos.

### Critérios de aceite

* Existe uma planilha ou markdown com todas as chamadas HTTP do front-end.
* Cada chamada está classificada como:

  * válida
  * inválida
  * duplicada
  * obsoleta
  * pendente de confirmação.
* Nenhum endpoint crítico fica sem classificação.

### Prioridade

P0

---

## História S0-H02 — Validar contrato real do backend

**Como** desenvolvedor,
**quero** comparar as chamadas do front com os endpoints reais do backend,
**para** remover integrações que não existem na branch `main`.

### Tasks técnicas

* Usar como referência os endpoints mapeados do backend:

  * `POST /auth/login`
  * `POST /auth/login-face`
  * `POST /auth/recover-password`
  * `POST /auth/reset-password`
  * `POST /companies`
  * `GET /companies`
  * `PATCH /companies/{cnpj}`
  * `POST /employee`
  * `GET /employee`
  * `GET /employee/check-cpf`
  * `POST /users`
  * `GET /users/check-username`
  * `POST /documents`
  * `GET /documents`
  * `POST /records/report`
  * `POST /records/report/simple`
  * `POST /records/vacation-request`
  * `POST /records/time-off/request`
  * `GET /legal/afd`
  * `GET /legal/aej`
  * `GET /legal/espelho-ponto`.
* Marcar endpoints inexistentes no front.
* Marcar endpoints reais que ainda não possuem service no front.
* Criar lista de correções por domínio.

O backend possui fluxos específicos para autenticação, empresas, colaboradores, usuários, documentos, ponto, férias, abonos, termos e legal/fiscal, incluindo os endpoints operacionais de cada domínio .

### Critérios de aceite

* Toda chamada do front tem correspondência ou justificativa.
* Endpoints inexistentes estão listados.
* Endpoints oficiais estão documentados.
* Existe uma ordem de correção por risco.

### Prioridade

P0

---

# Sprint 1 — Fundação de testes, autenticação e sessão

## Objetivo da sprint

Corrigir a base mais crítica: autenticação, sessão global, rotas protegidas, login, login facial e logout local.

O próprio plano técnico já define que a ordem mais segura começa por testes, `AuthProvider`, `ProtectedRoute`, login e logout .

---

## História S1-H01 — Criar base de testes do front-end

**Como** desenvolvedor,
**quero** adicionar uma stack mínima de testes,
**para** validar as refatorações sem quebrar fluxos críticos.

### Tasks técnicas

* Instalar:

  * `vitest`
  * `@testing-library/react`
  * `@testing-library/jest-dom`
  * `@testing-library/user-event`
  * `msw`
  * `jsdom`.
* Criar:

  * `src/test/setup.ts`
  * `src/test/server.ts`
  * `src/test/handlers.ts`
  * `vitest.config.ts`.
* Adicionar scripts no `package.json`:

  * `test`
  * `test:watch`
  * `test:coverage`.
* Criar primeiro teste simples para garantir setup.
* Criar mock de backend com MSW para `/auth/login`.

### Critérios de aceite

* `npm run test` executa localmente.
* Existe pelo menos um teste passando.
* MSW está configurado.
* O setup permite testar componentes com React Testing Library.
* O projeto continua buildando.

### Prioridade

P0

---

## História S1-H02 — Envolver aplicação com `AuthProvider`

**Como** usuário autenticado,
**quero** que minha sessão seja carregada em um contexto global,
**para** que todas as telas usem a mesma fonte de autenticação.

### Tasks técnicas

* Alterar `src/App.tsx`.
* Garantir hierarquia recomendada:

  * `QueryClientProvider`
  * `ThemeProvider`
  * `AuthProvider`
  * `BrowserRouter`.
* Validar se componentes como `Sidebar`, rotas protegidas e layout acessam `useAuth()`.
* Remover leituras diretas de token quando forem substituíveis pelo contexto.
* Garantir estado de sessão:

  * `checking`
  * `authenticated`
  * `unauthenticated`.

### Critérios de aceite

* Nenhum componente que usa `useAuth()` quebra.
* A aplicação carrega sessão ao iniciar.
* Token válido mantém usuário autenticado.
* Token inválido leva para estado `unauthenticated`.
* Componentes globais acessam usuário e role via contexto.

### Testes

* Deve iniciar com status `checking`.
* Deve virar `authenticated` com sessão válida.
* Deve virar `unauthenticated` em erro `401` ou `403`.

### Prioridade

P0

---

## História S1-H03 — Refatorar `ProtectedRoute`

**Como** usuário do sistema,
**quero** que rotas protegidas sejam liberadas apenas com sessão válida,
**para** impedir acesso baseado somente em token salvo no navegador.

### Tasks técnicas

* Alterar `src/components/ProtectedRoute.tsx`.
* Remover decisão baseada somente em `localStorage.getItem`.
* Usar `useAuth()`.
* Implementar comportamento:

  * `checking`: exibir loading.
  * `unauthenticated`: redirecionar para login.
  * `authenticated`: renderizar children/outlet.
* Garantir que conteúdo protegido não pisque antes da validação.

### Critérios de aceite

* Sem token, usuário vai para login.
* Com token inválido, usuário vai para login.
* Com token válido, rota é liberada.
* Durante validação, conteúdo protegido não aparece.
* Não existe lógica duplicada de autenticação dentro da rota.

### Testes

* Renderiza loading quando `checking`.
* Redireciona quando `unauthenticated`.
* Renderiza conteúdo quando `authenticated`.

### Prioridade

P0

---

## História S1-H04 — Unificar login com senha

**Como** usuário,
**quero** fazer login usando o service oficial de autenticação,
**para** que token, erro e sessão sejam tratados de forma padronizada.

O backend espera `username` e `password` em `POST /auth/login` e retorna `LoginResponse` com token JWT .

### Tasks técnicas

* Alterar `src/components/LoginForm.tsx`.
* Alterar ou consolidar `src/service/auth.Service.ts`.
* Remover `fetch` direto do componente.
* Criar função:

  * `login(credentials: LoginRequest): Promise<LoginResponse>`.
* Garantir que o service use `api.ts`.
* Após sucesso:

  * salvar token.
  * atualizar contexto.
  * redirecionar.
* Em erro:

  * exibir mensagem padronizada.

### Critérios de aceite

* `LoginForm` não usa `fetch`.
* `LoginForm` chama apenas `auth.Service.ts`.
* Login válido salva token e autentica sessão.
* Login inválido mostra erro.
* Erro não fica duplicado entre componente e service.

### Testes

* Login com sucesso.
* Login com credenciais inválidas.
* Token salvo corretamente.
* Sessão atualizada após login.

### Prioridade

P0

---

## História S1-H05 — Unificar login facial

**Como** usuário com biometria cadastrada,
**quero** fazer login facial usando o service oficial,
**para** manter o mesmo padrão do login com senha.

O backend expõe `POST /auth/login-face`, recebendo `faceImageBase64` e retornando token em caso de reconhecimento válido .

### Tasks técnicas

* Alterar `src/components/FaceLoginModal.tsx`.
* Criar ou ajustar no `auth.Service.ts`:

  * `loginWithFace(faceImageBase64: string): Promise<LoginResponse>`.
* Remover `fetch` direto do modal.
* Padronizar loading e erro.
* Atualizar sessão global após sucesso.

### Critérios de aceite

* Login facial usa apenas `auth.Service.ts`.
* Sucesso salva token.
* Sucesso atualiza `AuthContext`.
* Falha mostra erro padronizado.
* Modal não conhece detalhes de endpoint.

### Testes

* Login facial com sucesso.
* Face inválida.
* Erro de usuário inativo.
* Service chamado com `faceImageBase64`.

### Prioridade

P0

---

## História S1-H06 — Corrigir logout local

**Como** usuário autenticado,
**quero** sair do sistema sem depender de endpoint inexistente,
**para** encerrar a sessão corretamente no front-end.

### Tasks técnicas

* Remover chamada a `POST /auth/logout`, caso exista.
* Implementar logout local:

  * remover token do storage.
  * limpar estado do `AuthContext`.
  * limpar cache sensível do React Query, se aplicável.
  * redirecionar para login.
* Ajustar componentes que executam logout:

  * `Sidebar`
  * menu de usuário
  * layout principal.

### Critérios de aceite

* Logout funciona sem chamada ao backend.
* Após logout, usuário não acessa rota protegida.
* Dados de sessão somem do contexto.
* Cache sensível não fica visível depois do logout.

### Testes

* Logout remove token.
* Logout muda status para `unauthenticated`.
* Logout redireciona para login.

### Prioridade

P0

---

# Sprint 2 — Comunicação HTTP e padronização de services

## Objetivo da sprint

Eliminar a duplicidade `fetch`/`axios`, centralizar interceptors, normalizar erro e criar rotas constantes.

A diretriz técnica recomendada é manter `api.ts + axios + interceptors + AuthContext + helpers de normalização` e eliminar código legado baseado em `fetch` manual e endpoints antigos .

---

## História S2-H01 — Tornar `api.ts` o único client HTTP interno

**Como** desenvolvedor,
**quero** que toda chamada ao backend passe por `api.ts`,
**para** centralizar token, erro, interceptors e comportamento de sessão.

### Tasks técnicas

* Revisar todos os services.
* Substituir `fetch` por `api`.
* Garantir interceptor de request:

  * adiciona `Authorization: Bearer <token>`.
* Garantir interceptor de response:

  * trata `401`.
  * trata `403`.
  * trata erro de termo biométrico, se existir no contrato de erro.
* Bloquear uso de `fetch` para backend interno.
* Permitir exceção apenas para chamadas externas explícitas, se houver.

### Critérios de aceite

* Nenhum service interno usa `fetch`.
* Todas as chamadas autenticadas recebem token automaticamente.
* `401` limpa sessão ou força logout.
* `403` é tratado de forma padronizada.
* Componentes não montam headers manualmente.

### Testes

* Interceptor adiciona token.
* Sem token, header não é enviado.
* `401` dispara fluxo de sessão inválida.
* Erro HTTP é propagado no formato esperado.

### Prioridade

P0

---

## História S2-H02 — Criar helper único de erro

**Como** desenvolvedor,
**quero** converter erros HTTP em erros de UI padronizados,
**para** evitar mensagens inconsistentes entre telas.

### Tasks técnicas

* Criar:

  * `src/service/helpers/service-error.helper.ts`.
* Definir tipo:

  * `ServiceError`.
* Mapear:

  * `400`: validação.
  * `401`: não autenticado.
  * `403`: não autorizado.
  * `404`: não encontrado.
  * `409`: conflito.
  * `500`: erro interno.
  * fallback genérico.
* Adaptar services para lançar erro padronizado.
* Adaptar componentes para consumir mensagem comum.

### Critérios de aceite

* Services não fazem parsing manual repetido.
* Componentes recebem erro previsível.
* Mensagens de erro seguem padrão único.
* Erro sem body legível tem fallback.

### Testes

* Converte `400`.
* Converte `401`.
* Converte `403`.
* Converte erro sem response.
* Converte erro com body inesperado.

### Prioridade

P0

---

## História S2-H03 — Criar helper de normalização de resposta

**Como** desenvolvedor,
**quero** normalizar respostas diferentes do backend,
**para** evitar parsing espalhado entre telas.

### Tasks técnicas

* Criar:

  * `src/service/helpers/response-normalizer.helper.ts`.
* Implementar helpers:

  * `extractArray<T>(data, keys[])`
  * `extractObject<T>(data)`
  * `extractPage<T>(data)`
  * `safeString`
  * `safeBoolean`
  * `safeDate`.
* Cobrir envelopes:

  * `{ companies: [] }`
  * `{ employees: [] }`
  * `{ users: [] }`
  * `{ documents: [] }`
  * arrays diretos.
* Aplicar em services refatorados.

### Critérios de aceite

* Services usam helper para listas.
* Componentes não interpretam envelope manualmente.
* Respostas vazias são tratadas sem quebrar tela.
* Arrays diretos e envelopados funcionam.

### Testes

* Extrai array direto.
* Extrai array envelopado.
* Retorna array vazio quando payload é nulo.
* Extrai objeto simples.

### Prioridade

P1

---

## História S2-H04 — Criar arquivo central de rotas da API

**Como** desenvolvedor,
**quero** concentrar endpoints em constantes,
**para** reduzir erro de digitação e facilitar manutenção.

### Tasks técnicas

* Criar:

  * `src/service/api-routes.ts`.
* Definir constantes por domínio:

  * `AUTH`
  * `COMPANIES`
  * `EMPLOYEE`
  * `USERS`
  * `DOCUMENTS`
  * `MESSAGES`
  * `RECORDS`
  * `TERMS`
  * `LEGAL`.
* Substituir strings soltas nos services.
* Manter path params via função:

  * `employeeById(id)`
  * `companyByCnpj(cnpj)`
  * `documentById(id)`
  * `approveRecord(id)`.

### Critérios de aceite

* Services usam rotas centralizadas.
* Endpoints críticos não ficam duplicados em string.
* Rotas com path param são funções.
* Busca textual por endpoints antigos não retorna uso ativo.

### Prioridade

P1

---

# Sprint 3 — Domínios críticos: empresas, colaboradores, usuários e documentos

## Objetivo da sprint

Corrigir os domínios que sustentam cadastro, sessão, gestão operacional e documentos. Esses módulos impactam diretamente o funcionamento das telas administrativas.

---

## História S3-H01 — Refatorar service de empresas

**Como** CTO ou gestor autorizado,
**quero** listar, criar, consultar, atualizar e ativar/desativar empresas usando endpoints reais,
**para** manter o front alinhado ao backend.

O backend prevê gestão de empresas com `POST /companies`, `GET /companies/{cnpj}`, `GET /companies`, `PATCH /companies/{cnpj}`, `PATCH /companies/{cnpj}/toggle-activate`, `DELETE /companies/{cnpj}` e `GET /companies/check-cnpj` .

### Tasks técnicas

* Refatorar `src/service/company.Service.ts`.
* Remover `fetch`.
* Remover chave externa hardcoded, se houver.
* Usar `api.ts`.
* Criar métodos:

  * `listCompanies(active?)`
  * `getCompanyByCnpj(cnpj)`
  * `createCompany(payload)`
  * `updateCompany(cnpj, payload)`
  * `toggleCompany(cnpj)`
  * `deleteCompany(cnpj)`
  * `checkCnpj(cnpj)`.
* Normalizar resposta de listagem.
* Padronizar erro de CNPJ duplicado ou inexistente.

### Critérios de aceite

* Listagem funciona com e sem filtro `active`.
* Consulta por CNPJ funciona.
* Criação usa payload compatível com backend.
* Atualização envia apenas campos editáveis.
* Toggle usa endpoint correto.
* Não existe chave de API externa exposta no código-fonte.

### Testes

* Listar empresas.
* Buscar por CNPJ.
* Criar empresa.
* Atualizar empresa.
* Alternar status.
* CNPJ existente e inexistente.

### Prioridade

P0

---

## História S3-H02 — Consolidar service oficial de colaboradores

**Como** gestor,
**quero** cadastrar e manter colaboradores com o contrato correto do backend,
**para** evitar falhas em criação de colaborador e vínculo com usuário.

O backend prevê `POST /employee`, `GET /employee`, `GET /employee/{employeeId}`, `PATCH /employee/manager/update-employee/{employeeId}`, `DELETE /employee/{employeeId}` e `GET /employee/check-cpf` .

### Tasks técnicas

* Definir service oficial:

  * manter `collaborator-management.service.ts`, se for o mais aderente.
  * descontinuar `employee.Service.ts`, se estiver apontando para endpoints antigos.
* Remover uso de endpoints inexistentes:

  * `/employees/create-partner`
  * `/employees/create-manager`
  * `/companies/list-basic`
  * `/auth/username-availability`
  * `/employees/{employeeId}`.
* Criar métodos:

  * `checkCpf(cpf)`
  * `createEmployee(payload)`
  * `listEmployees(active?)`
  * `getEmployee(employeeId)`
  * `updateEmployee(employeeId, payload)`
  * `deleteEmployee(employeeId)`.
* Garantir suporte a:

  * dados pessoais
  * endereço
  * jornada
  * escala
  * `homeOffice`
  * `faceImageBase64`.
* Normalizar resposta `EmployeeResponse`.

### Critérios de aceite

* CPF é validado via `/employee/check-cpf`.
* Cadastro usa `POST /employee`.
* Listagem usa `GET /employee`.
* Edição usa `PATCH /employee/manager/update-employee/{employeeId}`.
* Nenhum endpoint legado permanece ativo.
* Payload do front reflete os campos esperados pelo backend.

### Testes

* CPF disponível.
* CPF já existente.
* Criar colaborador sem biometria.
* Criar colaborador com `faceImageBase64`.
* Atualizar colaborador.
* Excluir colaborador.

### Prioridade

P0

---

## História S3-H03 — Corrigir fluxo da tela `CriarColaborador`

**Como** gestor,
**quero** criar colaborador e usuário em etapas consistentes,
**para** garantir vínculo correto entre `employee` e `user`.

O backend separa cadastro de colaborador e cadastro de usuário: colaborador em `/employee` e conta de acesso em `/users` .

### Tasks técnicas

* Refatorar `src/pages/CriarColaborador.tsx`.
* Remover imports duplicados.
* Usar apenas service oficial de colaboradores.
* Usar apenas service oficial de usuários.
* Separar fluxo:

  * etapa 1: validar CPF.
  * etapa 2: criar colaborador.
  * etapa 3: validar username.
  * etapa 4: criar usuário vinculado ao `employeeId`.
* Bloquear criação de usuário sem `employeeId`.
* Tratar erro em cada etapa sem perder dados preenchidos.

### Critérios de aceite

* Tela não usa endpoints antigos.
* Não permite criar usuário antes do colaborador.
* `employeeId` retornado é usado no payload de criação de usuário.
* Username é validado via endpoint real.
* Erros de CPF e username são exibidos corretamente.

### Testes

* Avança para etapa de usuário após criar colaborador.
* Bloqueia etapa 2 sem CPF válido.
* Bloqueia criação de usuário sem username.
* Finaliza cadastro completo com sucesso.
* Mantém dados na tela após erro de criação de usuário.

### Prioridade

P0

---

## História S3-H04 — Consolidar service de usuários e perfil de sessão

**Como** usuário autenticado,
**quero** acessar e atualizar meus dados com endpoints reais,
**para** manter sessão e perfil consistentes.

O backend expõe fluxos de usuários como criação, consulta, listagem, atualização, ativação/desativação, exclusão, perfil próprio, troca de senha e checagem de username .

### Tasks técnicas

* Refatorar:

  * `src/service/user.Service.ts`
  * `src/service/session-profile.service.ts`
  * `src/hooks/useUser.ts`.
* Criar métodos:

  * `createUser(payload)`
  * `checkUsername(username)`
  * `getOwnUserProfile()`
  * `getOwnEmployeeProfile()`
  * `changeOwnPassword(payload)`
  * `updateOwnEmployeeProfile(payload)`.
* Garantir composição de sessão:

  * dados do usuário de `/users/own-profile`
  * dados do colaborador de `/employee/own-profile`.
* Padronizar role.
* Padronizar status ativo.
* Padronizar campos opcionais.

### Critérios de aceite

* Perfil do usuário carrega corretamente.
* Perfil do colaborador carrega corretamente.
* Sessão composta possui `userId`, `employeeId`, `username`, `role`, `companyId` ou `companyName`, quando disponível.
* Troca de senha usa `PUT /users/password`.
* Username é validado via `/users/check-username`.

### Testes

* Monta sessão composta.
* Atualiza telefone.
* Atualiza email.
* Troca senha com sucesso.
* Troca senha com confirmação inválida.
* Username disponível e indisponível.

### Prioridade

P0

---

## História S3-H05 — Refatorar documentos

**Como** colaborador ou gestor,
**quero** enviar, listar, baixar e excluir documentos usando endpoints reais,
**para** garantir que documentos e anexos funcionem corretamente.

O backend prevê `POST /documents`, `GET /documents`, `GET /documents/{documentId}` e `DELETE /documents/{documentId}` para upload, listagem, download e exclusão lógica/física de documentos .

### Tasks técnicas

* Refatorar `src/service/document.Service.ts`.
* Remover endpoints inexistentes:

  * `/documents/me`
  * `/documents/employee/{employeeId}`
  * `/documents/upload`
  * `/employees?active=true`.
* Criar métodos:

  * `listDocuments({ employeeId, date, type })`
  * `uploadDocument({ employeeId, type, file })`
  * `downloadDocument(documentId, employeeId?)`
  * `deleteDocument(documentId, employeeId?)`.
* Garantir upload `multipart/form-data`.
* Garantir download como `blob`.
* Ajustar nome do arquivo baixado.
* Buscar colaboradores via `/employee?active=true`, não via endpoint inexistente.

### Critérios de aceite

* Upload funciona via `POST /documents`.
* Listagem funciona via `GET /documents`.
* Download funciona via `GET /documents/{documentId}`.
* Exclusão funciona via `DELETE /documents/{documentId}`.
* Service usa `api.ts`.
* Nenhum endpoint inexistente permanece no service.

### Testes

* Listar documentos.
* Upload com arquivo.
* Upload com `employeeId`.
* Download blob.
* Exclusão.
* Erro de tipo de documento inválido.

### Prioridade

P0

---

# Sprint 4 — Domínio operacional: ponto, relatórios, aprovações, férias e abonos

## Objetivo da sprint

Consolidar o domínio mais sensível do sistema: ponto eletrônico, relatórios, ajustes, férias e abonos.

O backend trata registro de ponto como fluxo crítico porque combina autenticação contextual, biometria, geolocalização, NSR, AFD e comprovante .

---

## História S4-H01 — Criar service único para domínio `records`

**Como** desenvolvedor,
**quero** concentrar chamadas de ponto em um único service,
**para** evitar duplicidade e divergência entre relatórios, aprovações, férias e abonos.

### Tasks técnicas

* Criar ou consolidar:

  * `src/service/records.service.ts`.
* Migrar chamadas de:

  * `pendingApproval.service.ts`
  * `vacation.service.ts`
  * `report.service.ts`
  * `reportPortal.service.ts`
  * services duplicados de abono.
* Organizar métodos por grupo:

  * ponto
  * relatórios
  * ajustes
  * férias
  * abonos.
* Padronizar paginação.
* Padronizar filtros.

### Critérios de aceite

* Existe um service oficial para `/records`.
* Não existem duas implementações ativas para o mesmo endpoint.
* Hooks usam o service oficial.
* Componentes não chamam endpoints diretamente.

### Prioridade

P0

---

## História S4-H02 — Corrigir relatórios de ponto

**Como** gestor ou colaborador,
**quero** gerar relatório detalhado e resumido com payload correto,
**para** visualizar jornada, pausas, status e saldo.

O backend prevê `POST /records/report` e `POST /records/report/simple`, com entradas como `employeeId`, `reference`, `dates`, `statuses` e `active` .

### Tasks técnicas

* Implementar:

  * `getDetailedReport(payload, employeeId?)`
  * `getSimpleReport(payload, employeeId?)`.
* Garantir query param `employeeId` opcional.
* Garantir body com:

  * `dates`
  * `reference`
  * `statuses`
  * `active`.
* Normalizar retorno:

  * `TimeRecordResponse[]`
  * `SimpleReportResponse`.
* Ajustar telas:

  * relatório detalhado
  * portal do colaborador
  * dashboard, se consumir relatório.

### Critérios de aceite

* Relatório detalhado chama `POST /records/report`.
* Relatório simples chama `POST /records/report/simple`.
* Filtro por datas funciona.
* Filtro por status funciona.
* `employeeId` é omitido para próprio colaborador.
* Erros são exibidos de forma padronizada.

### Testes

* Relatório detalhado com funcionário selecionado.
* Relatório detalhado sem funcionário.
* Relatório simples por período.
* Payload de `reference` em formato correto.
* Erro de colaborador não encontrado.

### Prioridade

P0

---

## História S4-H03 — Corrigir aprovações de ajuste de ponto

**Como** gestor,
**quero** listar, aprovar e rejeitar ajustes pendentes,
**para** resolver solicitações de alteração de ponto.

O backend expõe `GET /records/pending-approvals`, `PATCH /records/approve/{timeRecordId}` e `PATCH /records/reject/{timeRecordId}` para esse fluxo .

### Tasks técnicas

* Implementar no `records.service.ts`:

  * `listPendingApprovals({ page, employeeName })`
  * `approveTimeRecord(timeRecordId)`
  * `rejectTimeRecord(timeRecordId)`.
* Ajustar hook:

  * `usePendingApprovals`.
* Ajustar tela de aprovações.
* Garantir atualização de cache após aprovar/rejeitar.
* Garantir tratamento de status incompatível.

### Critérios de aceite

* Lista pendências reais do backend.
* Aprovação usa endpoint correto.
* Rejeição usa endpoint correto.
* Após aprovar/rejeitar, item sai da lista.
* Mensagem de erro aparece quando registro não está pendente.

### Testes

* Listar aprovações.
* Aprovar ajuste.
* Rejeitar ajuste.
* Atualizar cache local.
* Erro em status inválido.

### Prioridade

P0

---

## História S4-H04 — Corrigir solicitação e aprovação de férias

**Como** colaborador,
**quero** solicitar férias,
**e como** gestor,
**quero** aprovar ou rejeitar,
**para** refletir corretamente os status no ponto.

O backend expõe `POST /records/vacation-request`, `PATCH /records/vacation-request/approve`, `PATCH /records/vacation-request/reject` e `GET /records/vacation-request` .

### Tasks técnicas

* Implementar:

  * `requestVacation({ startDate, endDate, managerId })`
  * `listVacationRequests({ status, employeeName, page, size })`
  * `approveVacation(timeRecordIds[])`
  * `rejectVacation(timeRecordIds[])`.
* Ajustar payload de aprovação/rejeição.
* Ajustar filtros:

  * pending
  * approved
  * rejected.
* Ajustar telas de férias.
* Garantir que o retorno de períodos consolidados seja renderizado corretamente.

### Critérios de aceite

* Solicitação cria registros por período.
* Listagem mostra solicitações agrupadas/consolidadas.
* Aprovação envia lista de IDs.
* Rejeição envia lista de IDs.
* Tela reflete status após decisão.

### Testes

* Solicitar férias.
* Listar férias pendentes.
* Aprovar férias.
* Rejeitar férias.
* Filtro por nome.
* Filtro por status.

### Prioridade

P0

---

## História S4-H05 — Corrigir solicitação de abono e esquecimento de marcação

**Como** colaborador,
**quero** solicitar abono ou correção por esquecimento,
**para** justificar ausência ou ajustar marcação faltante.

O backend define o endpoint correto como `POST /records/time-off/request`, com multipart contendo request e documento opcional .

### Tasks técnicas

* Remover rota incorreta:

  * `/records/time-off-request`.
* Implementar rota correta:

  * `/records/time-off/request`.
* Implementar multipart:

  * parte `request`
  * parte opcional `document`.
* Criar método:

  * `requestTimeOff(payload, document?)`.
* Garantir suporte aos tipos:

  * abono
  * esquecimento de marcação.
* Ajustar tela/formulário.
* Validar datas e horários antes de enviar.

### Critérios de aceite

* Service usa somente `/records/time-off/request`.
* Envia multipart corretamente.
* Documento é opcional.
* Solicitação sem documento funciona.
* Solicitação com documento funciona.
* Erros de horário inválido são tratados.

### Testes

* Solicitar abono sem documento.
* Solicitar abono com documento.
* Solicitar esquecimento de marcação.
* Bloquear fim anterior ao início.
* Erro de gestor inválido.

### Prioridade

P0

---

## História S4-H06 — Corrigir aprovação e rejeição de abonos

**Como** gestor,
**quero** listar, aprovar e rejeitar abonos ou esquecimentos,
**para** concluir solicitações operacionais.

O backend expõe `GET /records/time-off/requests`, `PATCH /records/time-off/approve/{timeRecordId}` e `PATCH /records/time-off/reject/{timeRecordId}` .

### Tasks técnicas

* Implementar:

  * `listTimeOffRequests({ status, employeeName, page, size })`
  * `approveTimeOff(timeRecordId)`
  * `rejectTimeOff(timeRecordId)`.
* Ajustar tela de gestão de abonos.
* Padronizar paginação.
* Renderizar documento vinculado, quando existir.
* Atualizar cache após decisão.

### Critérios de aceite

* Lista solicitações pendentes.
* Aprovação usa endpoint correto.
* Rejeição usa endpoint correto.
* Documento vinculado aparece quando retornado.
* Após decisão, status muda na UI.

### Testes

* Listar abonos.
* Aprovar abono.
* Rejeitar abono.
* Listar esquecimentos.
* Exibir documento vinculado.

### Prioridade

P0

---

# Sprint 5 — Mensagens, termos e legal/fiscal

## Objetivo da sprint

Finalizar domínios complementares: mensagens internas, aceite biométrico e downloads legais/fiscais.

---

## História S5-H01 — Padronizar mensagens internas

**Como** gestor,
**quero** enviar e excluir mensagens,
**e como** colaborador,
**quero** visualizar mensagens visíveis,
**para** manter comunicação interna no sistema.

O backend expõe `POST /messages`, `GET /messages` e `DELETE /messages/{messageId}` .

### Tasks técnicas

* Refatorar `src/service/message.service.ts`.
* Garantir uso de `api.ts`.
* Implementar:

  * `listMessages()`
  * `createMessage(payload)`
  * `deleteMessage(messageId)`.
* Ajustar `useMessages`.
* Remover heurísticas locais de sessão.
* Atualizar estado após exclusão.

### Critérios de aceite

* Listagem funciona.
* Criação usa payload correto.
* Exclusão remove item da tela.
* Erro padronizado.
* Nenhum fetch direto.

### Testes

* Listar mensagens.
* Criar mensagem.
* Excluir mensagem.
* Atualizar estado local.

### Prioridade

P1

---

## História S5-H02 — Implementar status e aceite de termo biométrico

**Como** colaborador,
**quero** consultar e aceitar o termo biométrico,
**para** cumprir a exigência de consentimento antes de usar biometria.

O backend possui `POST /terms/accept-biometric` e `GET /terms/status`; o aceite gera documento e trilha de auditoria no backend .

### Tasks técnicas

* Criar ou ajustar:

  * `src/service/terms.service.ts`.
* Implementar:

  * `getBiometricTermStatus()`
  * `acceptBiometricTerms()`.
* Ajustar fluxo pós-login:

  * verificar status.
  * redirecionar para aceite, se necessário.
* Após aceitar:

  * atualizar sessão/token, se backend retornar novo token.
  * caso não retorne token, recarregar status.
* Exibir mensagem clara de aceite.

### Critérios de aceite

* Status é consultado em `/terms/status`.
* Aceite chama `/terms/accept-biometric`.
* Usuário sem aceite é direcionado ao fluxo correto.
* Usuário com aceite não vê bloqueio.
* Erro de aceite é tratado.

### Testes

* Status `true`.
* Status `false`.
* Aceite com sucesso.
* Erro ao aceitar termo.
* Redirecionamento condicional.

### Prioridade

P0

---

## História S5-H03 — Padronizar downloads legal/fiscal

**Como** gestor ou CTO,
**quero** baixar AFD, AEJ, espelho de ponto e atestado técnico,
**para** cumprir obrigações legais e fiscais.

O backend expõe `GET /legal/technical-certificate`, `GET /legal/afd`, `GET /legal/aej` e `GET /legal/espelho-ponto` .

### Tasks técnicas

* Refatorar `src/service/fiscal.service.ts`.
* Implementar:

  * `downloadTechnicalCertificate()`
  * `downloadAfd()`
  * `downloadAej({ startDate, endDate })`
  * `downloadPointMirror({ targetEmployeeId, startDate, endDate })`.
* Garantir `responseType: 'blob'`.
* Resolver nome do arquivo por header ou fallback.
* Tratar erro quando backend retorna JSON em vez de blob.
* Ajustar telas de download.

### Critérios de aceite

* AFD baixa `.txt`.
* AEJ baixa `.p7s`.
* Atestado técnico baixa `.p7s`.
* Espelho de ponto baixa `.pdf`.
* Erro de download aparece de forma clara.
* Datas são enviadas no formato esperado.

### Testes

* Download AFD.
* Download AEJ.
* Download atestado técnico.
* Download espelho de ponto.
* Erro em período inválido.
* Fallback de nome de arquivo.

### Prioridade

P1

---

# Sprint 6 — Limpeza arquitetural e remoção de legado

## Objetivo da sprint

Remover código obsoleto, padronizar estrutura e impedir regressão.

---

## História S6-H01 — Remover services legados

**Como** desenvolvedor,
**quero** apagar ou isolar services antigos,
**para** impedir que endpoints inválidos voltem a ser usados.

### Tasks técnicas

* Remover services substituídos.
* Remover exports antigos.
* Remover imports mortos.
* Rodar busca textual por endpoints inválidos.
* Validar build.
* Validar testes.
* Atualizar barrel files, se existirem.

### Critérios de aceite

* Nenhum endpoint inexistente aparece em código ativo.
* Nenhum service duplicado por domínio permanece ativo.
* Projeto compila.
* Testes passam.
* Imports mortos removidos.

### Prioridade

P0

---

## História S6-H02 — Padronizar nomenclatura de arquivos

**Como** desenvolvedor,
**quero** nomes previsíveis para services, hooks e helpers,
**para** facilitar manutenção.

### Tasks técnicas

* Definir padrão:

  * `auth.service.ts`
  * `company.service.ts`
  * `employee.service.ts`
  * `user.service.ts`
  * `document.service.ts`
  * `records.service.ts`
  * `message.service.ts`
  * `terms.service.ts`
  * `fiscal.service.ts`.
* Renomear arquivos inconsistentes:

  * `company.Service.ts`
  * `user.Service.ts`
  * variações com maiúsculas.
* Atualizar imports.
* Validar paths.

### Critérios de aceite

* Nomes seguem um padrão único.
* Imports funcionam.
* Build passa.
* Estrutura por domínio fica clara.

### Prioridade

P1

---

## História S6-H03 — Criar documentação técnica do front-end

**Como** novo desenvolvedor do projeto,
**quero** entender onde ficam services, rotas, hooks e contexto,
**para** conseguir manter o projeto sem reintroduzir padrões antigos.

### Tasks técnicas

* Criar `docs/frontend-architecture.md`.
* Documentar:

  * padrão de service.
  * uso obrigatório de `api.ts`.
  * uso de `AuthContext`.
  * padrão de erro.
  * padrão de normalização.
  * padrão de rotas.
  * como criar novo service.
  * como testar service com MSW.
* Incluir lista de endpoints oficiais por domínio.

### Critérios de aceite

* Documento existe.
* Explica o padrão atual.
* Cita que `fetch` não deve ser usado para backend interno.
* Cita onde cadastrar novas rotas.
* Cita como escrever testes.

### Prioridade

P1

---

# Sprint 7 — Reforço de testes e homologação funcional

## Objetivo da sprint

Validar os fluxos ponta a ponta com backend mockado e garantir que a refatoração não quebrou as jornadas principais.

---

## História S7-H01 — Cobrir services críticos com testes unitários

**Como** desenvolvedor,
**quero** testar os services principais,
**para** garantir que endpoints, payloads e erros estão corretos.

### Tasks técnicas

* Criar testes para:

  * `auth.service.ts`
  * `company.service.ts`
  * `employee.service.ts`
  * `user.service.ts`
  * `document.service.ts`
  * `records.service.ts`
  * `terms.service.ts`
  * `fiscal.service.ts`.
* Mockar backend com MSW.
* Validar método HTTP.
* Validar URL.
* Validar body.
* Validar query params.
* Validar erro.

### Critérios de aceite

* Services P0 têm testes.
* Erros são testados.
* Payloads críticos são testados.
* Testes passam localmente.

### Prioridade

P0

---

## História S7-H02 — Cobrir componentes críticos

**Como** desenvolvedor,
**quero** testar telas e componentes principais,
**para** garantir que os fluxos mais usados funcionam na UI.

### Tasks técnicas

* Testar:

  * `LoginForm`
  * `FaceLoginModal`
  * `ProtectedRoute`
  * `CriarColaborador`
  * tela de documentos
  * tela de relatório
  * tela de férias
  * tela de abonos.
* Validar:

  * loading.
  * erro.
  * sucesso.
  * submissão.
  * redirecionamento.
  * bloqueios de campos.

### Critérios de aceite

* Login tem teste de sucesso e erro.
* Rota protegida tem teste de acesso negado e permitido.
* Cadastro de colaborador cobre criação em etapas.
* Documentos cobrem upload e listagem.
* Relatórios cobrem busca por período.

### Prioridade

P0

---

## História S7-H03 — Criar checklist de homologação manual

**Como** QA ou desenvolvedor,
**quero** um checklist manual de validação,
**para** testar o sistema contra o backend real antes do merge.

### Tasks técnicas

* Criar `docs/homologation-checklist.md`.
* Incluir cenários:

  * login com senha.
  * login facial.
  * logout.
  * criação de empresa.
  * criação de colaborador.
  * criação de usuário.
  * upload de documento.
  * download de documento.
  * relatório detalhado.
  * solicitação de férias.
  * aprovação de férias.
  * solicitação de abono.
  * aprovação de abono.
  * aceite de termo biométrico.
  * download de AFD.
  * download de AEJ.
  * download de espelho de ponto.
* Para cada cenário:

  * pré-condição.
  * passos.
  * resultado esperado.
  * evidência.

### Critérios de aceite

* Checklist cobre todos os fluxos P0.
* Checklist pode ser executado em homologação.
* Cada item tem resultado esperado.
* Bloqueadores são identificáveis.

### Prioridade

P1

---

# Ordem final recomendada

| Sprint   | Tema                                           | Prioridade |
| -------- | ---------------------------------------------- | ---------- |
| Sprint 0 | Mapeamento e contrato API                      | P0         |
| Sprint 1 | Testes base, autenticação e sessão             | P0         |
| Sprint 2 | Client HTTP, erro, normalização e rotas        | P0         |
| Sprint 3 | Empresas, colaboradores, usuários e documentos | P0         |
| Sprint 4 | Ponto, relatórios, aprovações, férias e abonos | P0         |
| Sprint 5 | Mensagens, termos e legal/fiscal               | P0/P1      |
| Sprint 6 | Limpeza arquitetural                           | P0/P1      |
| Sprint 7 | Testes e homologação                           | P0/P1      |

---

# Definition of Done geral

O backlog pode ser considerado concluído quando:

* Nenhum service interno usa `fetch`.
* Todas as chamadas passam por `api.ts`.
* Nenhum endpoint inexistente do backend permanece em uso.
* `AuthProvider` envolve a aplicação.
* `ProtectedRoute` usa `AuthContext`.
* Login com senha usa `POST /auth/login`.
* Login facial usa `POST /auth/login-face`.
* Logout é local, sem depender de endpoint inexistente.
* Cadastro de colaborador usa `POST /employee`.
* Criação de usuário usa `POST /users`.
* Documentos usam apenas `/documents`.
* Relatórios usam `/records/report` e `/records/report/simple`.
* Abonos usam `/records/time-off/request`.
* Férias usam `/records/vacation-request`.
* Legal/fiscal usa `/legal/*`.
* Services duplicados foram removidos.
* Rotas estão centralizadas.
* Erros estão padronizados.
* Respostas estão normalizadas.
* Testes unitários e de componentes executam com sucesso.
* Existe checklist de homologação manual.
