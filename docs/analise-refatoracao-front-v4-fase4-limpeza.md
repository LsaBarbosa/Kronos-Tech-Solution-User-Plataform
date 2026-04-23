# Análise técnica e plano de refatoração do front-end

## Projeto analisado
- **Front-end:** `Kronos-Tech-Solution-User-Plataform`
- **Branch do front-end:** `v4/fase4/limpeza`
- **Back-end de referência:** `Kronos-Tech-Solutions-KTS`
- **Branch do back-end:** `main`

---

## 1. Objetivo deste documento

Este documento consolida a análise técnica do front-end atual com foco em:

1. garantir aderência real ao contrato das APIs do back-end;
2. identificar pontos já corretos e que devem ser preservados;
3. identificar erros estruturais, arquiteturais e de integração ainda restantes;
4. transformar os achados em um plano de execução utilizável pelo **Codex CLI**.

> **Diretriz obrigatória:** toda alteração deve permanecer alinhada ao consumo das APIs expostas pelo back-end `main`. O front-end não deve inventar contratos, payloads, regras de autenticação ou fluxos que não estejam sustentados pelo back-end.

---

## 2. Resumo executivo

A branch `v4/fase4/limpeza` já está consideravelmente mais madura do que o estado anterior do front-end.

O núcleo de autenticação, sessão, client HTTP, domínio de registros (`records`), documentos e fiscal/legal já se encontra razoavelmente bem alinhado ao back-end. Isso significa que o problema atual não é mais um desalinhamento generalizado da aplicação inteira.

Os principais desvios remanescentes estão concentrados em poucos pontos críticos:

- domínio de **empresa**, ainda com lógica de infraestrutura e integração externa espalhada na UI;
- fluxo de **criação de administrador**, ainda com comportamento parcialmente desalinhado do contrato real de criação de usuário;
- ausência de **proteção de rota por role** no front-end;
- geocodificação reversa no **relatório detalhado**, sendo feita diretamente pelo navegador;
- alguns pontos de acoplamento, casting inseguro, heurística frágil de autenticação e responsabilidades duplicadas.

Em outras palavras:

> o projeto já saiu da fase de correção ampla de integrações e entrou em uma fase de **refino estrutural**, com foco em **empresa**, **administração**, **autorização**, **remoção de lógica externa do navegador** e **endurecimento arquitetural**.

---

## 3. O que já está correto e deve ser preservado

Os itens abaixo estão adequados e devem continuar sendo tratados como padrão oficial do projeto.

### 3.1 Autenticação e sessão

Preservar:

- `AuthProvider` envolvendo a aplicação no `App.tsx`;
- `ProtectedRoute` baseado em estado real de sessão;
- `AuthContext` centralizando token, status e carregamento de sessão;
- `session-profile.service.ts` compondo sessão a partir de `/users/own-profile` e `/employee/own-profile`;
- `auth.service.ts` como serviço oficial para login, login facial, recover/reset password.

### 3.2 Client HTTP

Preservar:

- `api.ts` como client HTTP oficial;
- interceptor para injeção automática de `Authorization`;
- remoção automática de `Content-Type` em payload `FormData`;
- normalização de erros via `ServiceError`;
- tratamento específico de `TERMS_NOT_ACCEPTED` com redirecionamento controlado.

### 3.3 Centralização de rotas

Preservar:

- `API_ROUTES`;
- `buildRoute()`;
- estratégia de evitar strings de endpoint espalhadas pela aplicação.

### 3.4 Domínio de registros (`records`)

Preservar:

- concentração do domínio de registros em `records.service.ts`;
- rotas compatíveis com o back-end, incluindo:
  - `/records/pending-approvals`
  - `/records/report`
  - `/records/time-off/request`
  - `/records/time-off/requests`
  - `/records/vacation-request`
  - `/records/vacation-request/approve`
  - `/records/vacation-request/reject`

### 3.5 Domínio de documentos

Preservar:

- `document.service.ts` como serviço oficial de documentos;
- uso de `/documents` e `/documents/{id}`;
- upload multipart com `FormData`;
- listagem de colaboradores via `/employee?active=true`.

### 3.6 Domínio fiscal/legal

Preservar:

- `fiscal.service.ts`;
- consumo das rotas do back-end:
  - `/legal/espelho-ponto`
  - `/legal/technical-certificate`
  - `/legal/afd`
  - `/legal/aej`

---

## 4. Achados principais de refatoração

---

## 4.1 P0 — Ajustes obrigatórios

Estes itens devem ser tratados primeiro, pois combinam risco estrutural, desalinhamento com a arquitetura adotada e/ou inconsistência com o contrato do back-end.

### P0.1 Refatorar o fluxo de empresa

#### Problema

O domínio de empresa ainda é o maior ponto de desvio estrutural.

A página `CriarEmpresa.tsx` ainda concentra responsabilidades demais:

- chamada direta ao back-end com `api.post("/companies", ...)`;
- chamada direta ao back-end com `api.get("/companies/check-cnpj", ...)`;
- uso de `fetch` para ViaCEP;
- uso de `fetch` para HERE Geocoding;
- geolocalização e validação de CNPJ acopladas à página.

#### Por que isso é um problema

Isso quebra o padrão que o resto do projeto já vem adotando:

- UI fina;
- regra de integração centralizada em service;
- lógica de fluxo em hook;
- tratamento de erro padronizado;
- menor acoplamento com infraestrutura.

Além disso:

- torna o fluxo difícil de testar;
- aumenta chance de divergência entre telas;
- espalha detalhes técnicos na camada errada;
- mantém dependência externa sensível no front-end.

#### O que implementar

1. criar um hook específico para o fluxo, por exemplo `useCreateCompany`;
2. mover toda a comunicação com o back-end para `company.service.ts`;
3. remover chamadas diretas de `api` da página;
4. remover `fetch` direto do componente;
5. encapsular geocodificação no service, no mínimo;
6. preferencialmente, planejar futura migração da geocodificação para o back-end.

#### Arquivos impactados

- `src/pages/CriarEmpresa.tsx`
- `src/service/company.service.ts`
- opcionalmente novo hook: `src/hooks/useCreateCompany.ts`

#### Critério de aceite

- a página não chama `api` diretamente;
- a página não usa `fetch` diretamente;
- validação de CNPJ e criação de empresa passam por service/hook;
- erros seguem padrão centralizado.

---

### P0.2 Corrigir busca/edição/visualização de empresa

#### Problema

`BuscarEmpresa.tsx` e `useCompanySearch.ts` estão usando casting inseguro (`as any`, `as CompanyData`) e assumindo que a listagem já devolve dados completos de detalhe.

Isso é inconsistente com a separação natural do contrato do back-end:

- `GET /companies` → lista;
- `GET /companies/{cnpj}` → detalhe.

#### Por que isso é um problema

- risco de campos obrigatórios ausentes em runtime;
- dependência de comportamento implícito da API;
- perda de segurança de tipos;
- manutenção frágil.

#### O que implementar

1. manter `fetchCompanyList()` apenas para a grade/listagem;
2. ao abrir edição ou visualização, buscar o detalhe real com `GET /companies/{cnpj}`;
3. preencher modal com `CompanyData` real, não derivado por casting;
4. eliminar `as any` e casts inseguros.

#### Arquivos impactados

- `src/pages/BuscarEmpresa.tsx`
- `src/hooks/useCompanySearch.ts`
- `src/service/company.service.ts`
- `src/types/company.ts`

#### Critério de aceite

- edição e visualização usam payload de detalhe real;
- nenhum `as any` permanece nesse fluxo;
- o tipo `CompanyData` só é usado quando a API realmente devolve detalhe.

---

### P0.3 Corrigir o fluxo de criação de administrador

#### Problema

`CriarManager.tsx` ainda mistura responsabilidades e mantém regra parcialmente desalinhada do contrato real.

Pontos críticos:

- `userSchema` da tela exige `password`;
- a tela permite `role = PARTNER` mesmo sendo uma tela de criação de administrador;
- a lógica está excessivamente concentrada na própria página.

#### Por que isso é um problema

Se a tela é de criação de **administrador**, ela não deveria permitir criar outro papel genérico.

Além disso, o fluxo de criação de usuário precisa respeitar o comportamento real do back-end, sem o front criar regras próprias não sustentadas pela API.

#### O que implementar

1. fixar o `role` como `MANAGER` nessa tela;
2. remover obrigatoriedade de senha na criação inicial do usuário, caso o contrato atual do back-end não exija isso para `POST /users`;
3. manter o fluxo em duas etapas:
   - cria colaborador;
   - cria usuário usando `employeeId` retornado;
4. extrair a lógica da página para hook próprio, reduzindo o tamanho e o acoplamento da UI.

#### Arquivos impactados

- `src/pages/CriarManager.tsx`
- `src/service/collaborator-management.service.ts`
- opcionalmente novo hook: `src/hooks/useCreateManager.ts`

#### Critério de aceite

- a tela cria apenas `MANAGER`;
- o payload de criação de usuário respeita o contrato real do back-end;
- a página fica menos monolítica;
- não há regra inventada pelo front para criação de usuário.

---

### P0.4 Implementar proteção de rota por role

#### Problema

O front-end já protege sessão autenticada, mas ainda não protege autorização por papel. Hoje o menu esconde itens conforme `role`, mas isso não bloqueia a navegação direta por URL.

#### Por que isso é um problema

- UX inconsistente;
- round-trip desnecessário até o back-end;
- falta de coerência entre navegação e regras da aplicação.

> Observação: o back-end continua sendo a fonte final da autorização. A proteção no front não substitui a proteção do servidor. Ela apenas reforça a consistência da aplicação.

#### O que implementar

1. criar um guard por role, como `RoleRoute`, ou evoluir `ProtectedRoute`;
2. aplicar proteção por papel nas rotas administrativas;
3. manter `Sidebar` apenas como representação visual, não como mecanismo exclusivo de bloqueio.

#### Rotas candidatas

- empresa;
- criação de colaborador;
- criação de administrador;
- aprovações;
- gestão de férias;
- auditoria fiscal.

#### Critério de aceite

- usuário autenticado, mas sem role adequada, não acessa rota administrativa pelo front;
- menus e rotas ficam coerentes entre si.

---

### P0.5 Remover geocodificação reversa direta no relatório detalhado

#### Problema

`ResultadosRelatorioDetalhado.tsx` resolve coordenadas em endereço usando serviço externo diretamente do navegador.

#### Por que isso é um problema

- gera múltiplas chamadas externas por renderização;
- aumenta latência da tela;
- expõe coordenadas do colaborador a terceiros;
- cria acoplamento com serviço externo fora do contrato do back-end;
- mistura enriquecimento de domínio com apresentação.

#### O que implementar

Alternativas:

1. **melhor opção:** mover a resolução de endereço para o back-end/BFF e fazer o front consumir o dado pronto;
2. **opção mínima:** remover a resolução textual e trabalhar apenas com coordenadas ou informação já vinda da API.

#### Arquivos impactados

- `src/components/ResultadosRelatorioDetalhado.tsx`
- eventualmente contratos/tipos relacionados a `DetailedReportItem`

#### Critério de aceite

- o componente não dispara mais requisições externas para resolver endereço;
- o relatório não depende de enriquecimento feito diretamente no navegador.

---

## 4.2 P1 — Ajustes importantes

### P1.1 Remover heurística de autenticação baseada em texto de erro

#### Problema

`useCompanySearch.ts` ainda usa regra frágil baseada em conteúdo textual de erro para decidir navegação ao login.

#### O que implementar

- usar `normalizeServiceError` + `isAuthServiceError`;
- remover qualquer decisão baseada em `message.includes(...)`.

#### Critério de aceite

- autenticação expirada é tratada por mecanismo estruturado, não por texto livre.

---

### P1.2 Consolidar responsabilidades por domínio

#### Problema

Ainda existem responsabilidades duplicadas entre services, especialmente listagens e fluxos parcialmente repetidos.

#### O que implementar

- definir claramente um service oficial por domínio;
- evitar duplicidade de listagem de empresas, colaboradores, usuários, documentos etc.;
- onde possível, concentrar operações de mesmo domínio em um único service principal.

#### Critério de aceite

- o time sabe qual é o arquivo oficial por domínio;
- o mesmo endpoint não é encapsulado por múltiplos services sem necessidade.

---

### P1.3 Padronizar sistema de feedback/toast

#### Problema

O projeto ainda mistura `sonner`, `useToast` e variações de feedback em camadas diferentes.

#### O que implementar

- escolher um padrão oficial;
- padronizar mensagens de sucesso, erro e warning;
- documentar a convenção.

#### Critério de aceite

- feedback visual consistente em toda a aplicação.

---

### P1.4 Refatorar páginas grandes e monolíticas

#### Problema

Algumas páginas ainda carregam lógica demais:

- `CriarEmpresa.tsx`
- `CriarManager.tsx`
- possivelmente outros fluxos administrativos maiores

#### O que implementar

- decompor em `page + hook + service`;
- manter a página focada em renderização e interação;
- manter hook focado em fluxo/estado;
- manter service focado em integração.

#### Critério de aceite

- páginas mais curtas, mais testáveis e previsíveis.

---

## 4.3 P2 — Melhorias adicionais

### P2.1 Melhorar estratégia de contagem/paginação

#### Problema

Existem pontos onde o front depende de paginação artificial grande para simular contagem, como em pendências de férias.

#### O que implementar

- rever estratégia;
- evitar suposições como `size: 500` para contar pendências;
- se o back-end não fornecer contagem dedicada, documentar limitação de forma explícita.

---

### P2.2 Expandir cobertura de testes

A base de testes já existe, o que é positivo. O próximo passo é cobertura mais significativa nos domínios críticos.

#### Prioridades

- autenticação e sessão;
- empresas;
- criação de colaborador e administrador;
- records;
- documentos;
- guards de rota.

---

### P2.3 Centralizar metadata de rotas

#### O que implementar

Criar metadata centralizada por rota, por exemplo:

- path;
- label;
- role necessária;
- visibilidade em menu;
- breadcrumbs.

#### Benefício

- reduz divergência entre `Sidebar`, rotas e autorização.

---

## 5. Erros estruturais e arquiteturais identificados

### 5.1 Responsabilidade excessiva na camada de UI

Ainda há componentes e páginas tomando decisões que deveriam estar em hook/service.

### 5.2 Casting inseguro

O domínio de empresa está mascarando inconsistências com `as any` e `as CompanyData`.

### 5.3 Heurística frágil para autenticação

Ainda existem pontos onde decisão de sessão expirada depende de texto de erro.

### 5.4 Dependência externa disparada pelo navegador

Geocodificação e reverse geocoding no front criam acoplamento estrutural inadequado.

### 5.5 Duplicação de responsabilidade entre services

Alguns services ainda encapsulam operações que poderiam estar melhor concentradas.

### 5.6 Falta de autorização explícita no roteamento

Hoje a role influencia menu, mas não protege a navegação por si só.

---

## 6. Estratégia recomendada de execução para o Codex CLI

Abaixo está a ordem recomendada de implementação para reduzir risco e evitar retrabalho.

### Etapa 1 — Empresas

#### Task 1.1
Refatorar `CriarEmpresa.tsx` para remover chamadas diretas de `api` e `fetch` da página.

#### Task 1.2
Criar `useCreateCompany` para controlar:

- formulário;
- verificação de CNPJ;
- geolocalização;
- submissão.

#### Task 1.3
Consolidar operações de empresa em `company.service.ts`.

#### Task 1.4
Corrigir `useCompanySearch` para usar detalhe real por CNPJ ao editar/visualizar.

---

### Etapa 2 — Administração e autorização

#### Task 2.1
Refatorar `CriarManager.tsx` para desacoplar a lógica e alinhar o fluxo ao contrato real do back-end.

#### Task 2.2
Criar guard por role.

#### Task 2.3
Aplicar autorização por role nas rotas administrativas.

---

### Etapa 3 — Endurecimento arquitetural

#### Task 3.1
Remover heurística por texto em hooks que tratam auth.

#### Task 3.2
Padronizar toasts/feedback.

#### Task 3.3
Consolidar duplicações entre services.

---

### Etapa 4 — Relatório detalhado

#### Task 4.1
Remover reverse geocoding do componente.

#### Task 4.2
Ajustar a UI para consumir apenas o que o back-end entrega de forma oficial.

---

### Etapa 5 — Testes

#### Task 5.1
Adicionar testes para:

- `ProtectedRoute` / guards por role;
- `useCreateCompany`;
- `useCompanySearch`;
- `useCreateManager`;
- `records.service.ts`;
- `document.service.ts`.

---

## 7. Regras operacionais para execução das tasks

Estas regras devem ser seguidas durante a implementação.

### 7.1 Não alterar o contrato do back-end pelo front-end

O front deve se adaptar ao contrato exposto pelo back-end, não o contrário.

### 7.2 Evitar chamadas diretas à API em páginas

Páginas devem usar hooks e services.

### 7.3 Evitar `fetch` direto na UI

Se houver necessidade de integração externa transitória, encapsular em service.

### 7.4 Evitar `as any`

Ajustar tipos ou buscar o payload correto da API.

### 7.5 Não usar menu como mecanismo de autorização

Menu é representação visual. A autorização deve existir no roteamento e continuar validada no back-end.

### 7.6 Preservar o que já está correto

Não reverter:

- `AuthContext`;
- `ProtectedRoute` atual para sessão;
- `api.ts` com interceptors;
- `records.service.ts`;
- `document.service.ts`;
- `fiscal.service.ts`.

---

## 8. Critérios gerais de aceite

O front-end pode ser considerado devidamente ajustado quando:

1. nenhum fluxo crítico da UI chama `api` diretamente a partir de página, exceto casos deliberadamente documentados;
2. não houver mais `fetch` direto em componentes críticos;
3. fluxos de empresa estiverem alinhados ao padrão `page + hook + service`;
4. edição/visualização de empresa usarem payload real de detalhe;
5. criação de administrador respeitar o contrato real de criação de usuário;
6. rotas administrativas estiverem protegidas por role no front;
7. relatório detalhado não fizer reverse geocoding externo no navegador;
8. erros de autenticação forem tratados por mecanismo padronizado;
9. não houver `as any` mascarando ausência de contrato;
10. a aplicação continuar aderente às APIs reais do back-end `main`.

---

## 9. Backlog resumido

### P0
- refatorar domínio de empresa;
- corrigir edição/visualização de empresa por detalhe real;
- corrigir fluxo de criação de administrador;
- implementar proteção de rota por role;
- remover reverse geocoding do relatório detalhado.

### P1
- remover heurística textual de auth;
- consolidar services por domínio;
- padronizar feedback/toast;
- refatorar páginas grandes.

### P2
- melhorar estratégia de contagem/paginação;
- ampliar testes;
- centralizar metadata de rotas.

---

## 10. Conclusão

A branch `v4/fase4/limpeza` já resolveu uma parte relevante dos problemas históricos do front-end, principalmente na base de autenticação, sessão, integração HTTP e consumo dos domínios mais importantes do back-end.

Os problemas remanescentes não exigem reconstrução do projeto. Eles exigem **endurecimento arquitetural e alinhamento fino**.

A prioridade real agora é:

1. consolidar o domínio de empresa;
2. corrigir o fluxo administrativo;
3. proteger rotas por role;
4. remover integrações externas indevidas do navegador;
5. eliminar pontos frágeis de tipagem e tratamento de erro.

---

# Contexto detalhado para o Codex CLI

Abaixo está, de forma ampliada, a explicação detalhada da análise anterior, preservada para fornecer ao **Codex CLI** o contexto necessário para execução das tasks.

## Diagnóstico executivo detalhado

A branch atual já corrigiu parte importante da dívida que existia no front anterior. Hoje já estão alinhados com o backend:

- autenticação centralizada com `AuthProvider` em `App.tsx`;
- proteção de rota baseada em estado real de sessão, não só token bruto em storage, em `ProtectedRoute.tsx`;
- sessão centralizada em `AuthContext.tsx`, com `loadSessionProfile()` e logout local;
- client HTTP centralizado em `api.ts`, com interceptor de `Authorization`, tratamento de `FormData` e redirecionamento para termos não aceitos;
- login e login facial consumindo `/auth/login` e `/auth/login-face` via service, sem `fetch` direto no componente;
- sessão composta a partir de `/users/own-profile` e `/employee/own-profile`;
- domínio de `records` consolidado em um service único, usando as rotas corretas do backend, inclusive `/records/time-off/request`, `/records/vacation-request`, `/records/pending-approvals` e `/records/report`;
- domínio de documentos corrigido para `/documents` e `/documents/{id}` com multipart via `FormData`;
- downloads legais/fiscais alinhados com `/legal/technical-certificate`, `/legal/afd`, `/legal/aej` e `/legal/espelho-ponto`.

Isso está coerente com o contrato real do backend, que expõe exatamente esses fluxos e endpoints em `main`.

## O que ainda precisa ser refatorado para consumir o backend corretamente

### 1. Fluxo de empresa ainda quebra o padrão arquitetural do projeto

Esse é hoje o principal desvio.

O arquivo `CriarEmpresa.tsx` ainda concentra lógica de API e integração externa dentro da própria página. Ele:

- chama `api.post("/companies", ...)` direto
- chama `api.get("/companies/check-cnpj", ...)` direto
- usa `fetch` para ViaCEP
- usa `fetch` para HERE Geocoding
- mantém lógica de geolocalização e validação de CNPJ dentro do componente

Enquanto isso, o projeto já tem `company.service.ts`, mas a geocodificação também ficou lá, ainda no front, via `fetch` para ViaCEP e HERE, usando `VITE_HERE_API_KEY`.

#### Problema real
Esse fluxo ficou funcional, mas estruturalmente desalinhado do resto da aplicação.

Impactos:

- regra de negócio espalhada em página e service
- tratamento de erro inconsistente
- dependência externa sensível exposta ao front
- dificuldade de teste
- risco de divergência entre tela de criação e tela de busca/edição

#### O que refatorar

- mover toda chamada ao backend de empresa para `company.service.ts`
- criar um hook específico, por exemplo `useCreateCompany`
- remover `fetch` direto do componente
- remover geocodificação da página
- manter, no mínimo, a geocodificação encapsulada em service
- idealmente, mover geolocalização para o backend no futuro

#### Observação crítica
Se a regra de negócio do projeto é “toda alteração deve estar alinhada ao consumo do backend”, então a geolocalização no front precisa ser tratada com cuidado. Hoje ela não quebra o contrato HTTP com o backend, mas quebra a diretriz arquitetural de centralização do consumo da aplicação.

### 2. Busca/edição/visualização de empresa está usando tipagem incorreta e casting inseguro

`BuscarEmpresa.tsx` usa `useCompanySearch()` e melhorou a separação de UI, mas o hook ainda trabalha de forma inconsistente com os tipos.

O problema é este:

- `fetchCompanyList()` retorna `CompanyListItem[]`
- `CompanyData` exige mais dados que `CompanyListItem`, inclusive endereço completo e contadores obrigatórios `activeEmployees` e `inactiveEmployees`
- mesmo assim, o hook e a tela fazem `empresa as any` / `empresa as CompanyData` para abrir edição e visualização

#### Problema real
Hoje o front está assumindo que a listagem já devolve dados completos de detalhe. O backend, porém, separa claramente:

- `GET /companies` para lista
- `GET /companies/{cnpj}` para detalhe/enriquecimento com contagem de ativos/inativos

#### O que refatorar
Ao clicar em visualizar ou editar empresa:

- buscar o detalhe real com `GET /companies/{cnpj}`
- preencher modal de view/edit somente com `CompanyData` de verdade
- eliminar `as any`
- não inferir detalhe a partir da listagem

#### Ganho

- remove bug silencioso de tipagem
- evita campos ausentes em runtime
- respeita melhor o contrato do backend

### 3. Tela de criação de administrador está desalinhada com o contrato de criação de usuário

A página `CriarManager.tsx` ainda está muito monolítica e possui um desalinhamento importante de regra.

Ela define um `userSchema` com:

- `password` obrigatório
- `role` podendo ser `MANAGER` ou `PARTNER`

Mas o backend, no fluxo de criação de usuário, trata `POST /users` com foco em:

- `username`
- `role`
- `employeeId`
- geração de senha inicial pelo sistema
  e deixa senha explícita como opcional apenas em update ou na troca da própria senha.

#### Problema real
Para uma tela chamada **Criar Administrador**, permitir `PARTNER` como role e exigir senha manual na criação é um desvio funcional e contratual.

#### O que refatorar

- se a tela é de “criar administrador”, fixar `role = MANAGER`
- remover senha obrigatória do fluxo de criação
- criar o colaborador
- depois criar o usuário com `username`, `role`, `employeeId`
- tratar eventual definição de senha por fluxo próprio do backend, não no create inicial

#### Efeito colateral positivo
Esse ajuste aproxima a tela do comportamento real do backend e elimina regra de front que hoje está inventando um contrato não garantido pelo serviço.

### 4. O front ainda não protege rotas por role, só por autenticação

`App.tsx` já usa `ProtectedRoute`, mas essa proteção é apenas de sessão autenticada. Não há guarda por papel de acesso. Todas as rotas protegidas entram sob o mesmo wrapper.

Já `Sidebar.tsx` apenas esconde ou mostra menus conforme `role`, com base em `useAuth()`.

#### Problema real
Esconder item de menu não equivale a proteger navegação. Hoje um usuário pode tentar acessar a URL diretamente, e o bloqueio fica só no backend.

O backend continua sendo a fonte da verdade, mas o front deveria:

- bloquear navegação inválida
- evitar round-trip desnecessário
- evitar UX inconsistente

#### O que refatorar
Criar um guard de autorização por role, por exemplo:

- `RoleRoute`
- ou estender `ProtectedRoute` com `allowedRoles`

Aplicar isso nas rotas administrativas:

- empresa
- criar colaborador
- criar administrador
- aprovações
- férias gerenciais
- auditoria fiscal

#### Benefício

- front mais coerente com a matriz de atores do backend `CTO`, `MANAGER`, `PARTNER`

### 5. Relatório detalhado faz geocodificação reversa direto no navegador para cada registro

`ResultadosRelatorioDetalhado.tsx` faz `fetch` para `https://nominatim.openstreetmap.org/reverse` para converter coordenadas em endereço por item exibido no relatório.

#### Problema real
Isso é um problema estrutural forte:

- cada renderização pode disparar várias chamadas externas
- aumenta latência da tela
- cria dependência de terceiro fora do backend
- expõe coordenadas sensíveis do colaborador para serviço externo
- foge do contrato da aplicação
- coloca lógica de enriquecimento de domínio dentro do componente

#### O que refatorar
Há duas alternativas:

1. **Melhor opção**
   mover esse enriquecimento para backend/BFF e o front consumir já pronto.

2. **Opção mínima**
   remover a resolução textual do endereço do relatório e exibir apenas coordenadas ou mapa local simplificado.

#### Recomendação
Como a observação exige alinhamento ao consumo das APIs do backend, esse item deve ser tratado como **P0 estrutural**.

## Erros estruturais e arquiteturais no front

### 1. Mistura entre camada de página, hook e service
Boa parte do projeto já migrou para:

- `service`
- `hook`
- componente/página fina

Mas ainda há exceções fortes:

- `CriarEmpresa.tsx` concentra lógica demais
- `CriarManager.tsx` continua grande, acoplada e difícil de manter

### 2. Uso de `as any` e contratos frouxos
O domínio de empresa está mascarando inconsistência de payload com casting forçado, especialmente no `useCompanySearch` e `BuscarEmpresa`.

### 3. Heurística frágil de autenticação baseada em mensagem de erro
`useCompanySearch` ainda faz navegação com lógica do tipo “se a mensagem contém Token, manda para login”.

Isso é frágil. O projeto já possui:

- `AuthContext`
- `normalizeServiceError`
- `isAuthServiceError`
- interceptor centralizado

Essa heurística deve ser removida.

### 4. Duplicação de responsabilidade entre services
Exemplo:

- `fetchCompanyList` aparece em `company.service.ts`
- também existe busca de lista de empresa dentro de `collaborator-management.service.ts`

Não quebra o consumo do backend, mas piora manutenção. O ideal é cada domínio ter uma fonte oficial.

### 5. Contagem e paginação improvisadas no front
Em `records.service.ts`, `fetchPendingVacationCount()` pede `size: 500` e conta o array retornado.

Isso é um smell de arquitetura:

- não escala
- depende de tamanho arbitrário
- mascara ausência de endpoint específico de contagem

### 6. Mistura de sistemas de notificação
O projeto usa:

- `sonner`
- `useToast`
- toast vindo de hook
- toast vindo direto de componente

Isso não quebra endpoint, mas fragmenta UX e tratamento de erro.

## O que está correto e deve ser preservado

Esses pontos estão bons e devem continuar como padrão oficial:

### Autenticação e sessão

- `AuthProvider` em `App.tsx`
- `ProtectedRoute` por status de sessão
- `auth.service.ts` para login, login facial, recover/reset password
- `session-profile.service.ts` para compor perfil de sessão

### Client HTTP

- `api.ts`
- interceptors
- remoção automática de `Content-Type` para multipart
- redirect de termos não aceitos
- normalização de erro via `ServiceError`

### Rotas centralizadas

- `API_ROUTES`
- `buildRoute()`

### Domínio de records

A consolidação em `records.service.ts` foi uma boa decisão. Hoje ele já fala com o backend em rotas compatíveis com o mapeamento oficial de `main`.

### Domínio de documentos

`document.service.ts` está coerente com:

- listagem
- upload multipart
- download
- exclusão
- busca de colaboradores por `/employee?active=true`

## Backlog recomendado, por prioridade

### P0 — corrigir imediatamente
1. Refatorar `CriarEmpresa.tsx` para remover chamadas diretas à API e `fetch` externo da página.
2. Corrigir `useCompanySearch` para buscar detalhe real em `/companies/{cnpj}` antes de editar/visualizar.
3. Corrigir `CriarManager.tsx` para não exigir senha em `POST /users` e não permitir `PARTNER` numa tela de administrador.
4. Remover geocodificação reversa do relatório detalhado do front.
5. Implementar guarda de rota por role no `App.tsx`.

### P1 — importante
1. Eliminar heurísticas de auth por texto de erro em hooks.
2. Consolidar services por domínio, removendo duplicação de listagem.
3. Unificar sistema de toast/feedback.
4. Quebrar páginas grandes em hook + page + service.

### P2 — evolução
1. Melhorar estratégia de contagem/paginação para férias pendentes.
2. Cobertura de testes real por domínio.
3. Role-based menu + route metadata centralizada.

## Conclusão detalhada

A branch `v4/fase4/limpeza` já está muito mais próxima do backend `main` do que o front analisado anteriormente. O núcleo de autenticação, sessão, records, documentos e legal/fiscal está em bom estado e aderente ao contrato exposto pelo backend.

Os principais problemas restantes não estão mais espalhados no projeto inteiro. Eles estão concentrados em alguns pontos específicos:

- domínio de empresa ainda com lógica de infraestrutura na UI
- fluxo de administrador ainda desalinhado do contrato real de criação de usuário
- ausência de guarda por role nas rotas
- enriquecimento externo indevido no relatório detalhado
- alguns hooks ainda com soluções frágeis de erro/autenticação

Em termos práticos:

**o front já passou da fase de correção generalizada e entrou na fase de ajuste fino estrutural**, com foco em **empresa**, **admin**, **autorização** e **remoção de lógica externa do navegador**.

---

## 11. Observação final para o Codex CLI

Ao executar as tasks deste documento:

- preserve o que já está corretamente alinhado;
- evite refatorações desnecessárias fora do escopo dos achados;
- não introduza novos contratos de API no front-end;
- trate as tasks P0 como prioridade máxima;
- sempre prefira refatoração incremental com baixo risco de regressão.
