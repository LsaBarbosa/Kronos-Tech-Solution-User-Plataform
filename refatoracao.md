# Plano de Refatoração do Front-end  
## Projeto: `Kronos-Tech-Solution-User-Plataform`  
## Branch analisada: `fix2026`  
## Backend de referência: `Kronos-Tech-Solutions-KTS`  
## Branch de referência do backend: `main`

---

## 1. Objetivo deste plano

Este documento descreve, de forma detalhada, o que deve ser refatorado no front-end para que ele consuma corretamente os serviços do backend.

O foco é:

- alinhar o front-end com os endpoints reais do backend
- eliminar integrações antigas e inconsistentes
- centralizar autenticação, sessão e tratamento de erro
- reduzir risco de quebra entre telas
- criar base mínima de testes unitários e de integração

Este plano foi escrito pensando em alguém com pouca familiaridade com front-end.

---

## 2. Explicação simples de alguns conceitos

### 2.1 Service
No front-end, um **service** é um arquivo responsável por conversar com o backend.

Exemplo:
- listar empresas
- criar colaborador
- buscar documentos
- aprovar férias

Ou seja, em vez de a tela chamar a API diretamente, ela chama um service.

### 2.2 Context / Provider
No React, isso é uma forma de compartilhar informação global.

Exemplo:
- usuário logado
- role do usuário
- status da sessão

Assim, várias telas conseguem acessar essa informação sem cada uma precisar fazer sua própria lógica.

### 2.3 Interceptor
É uma lógica automática que roda antes ou depois de uma requisição HTTP.

Exemplos:
- adicionar token no cabeçalho
- interceptar erro 401 ou 403
- redirecionar o usuário quando faltar aceite de termos

### 2.4 Fetch x Axios
Hoje o projeto mistura dois jeitos de fazer requisição:

- `fetch`
- `axios`

Isso é um problema porque cada um acaba tratando erro, token e payload de forma diferente.

O ideal é escolher um só padrão e usar em toda a aplicação.

---

## 3. Diagnóstico resumido

O front-end da branch `fix2026` está em um estado híbrido.

Existe uma parte mais nova, mais organizada, baseada em:

- `api.ts`
- `axios`
- interceptors
- helpers de normalização
- `AuthContext`

Mas ainda coexistem arquivos antigos usando:

- `fetch` manual
- montagem manual de headers
- parsing próprio de erro
- endpoints que não existem no backend atual

### 3.1 Consequência prática disso

O projeto fica com estes riscos:

- uma tela funciona e outra equivalente quebra
- o login trata sessão de um jeito e outras telas tratam de outro
- erros do backend aparecem de forma diferente por tela
- algumas rotas chamadas pelo front nem existem no backend
- manutenção fica muito mais difícil

---

## 4. Diretriz técnica principal

A decisão arquitetural recomendada é:

> Manter como padrão oficial a arquitetura nova baseada em `api.ts + axios + interceptors + AuthContext + helpers de normalização`, e eliminar o código legado baseado em `fetch` manual e endpoints antigos.

Essa decisão é o que mais reduz complexidade e risco no projeto.

---

# 5. Plano de refatoração por fases

---

# Fase 0 — Preparação técnica

## 5.0.1 Criar base de testes do front-end

### O que alterar
Adicionar stack de testes ao projeto.

### Por que isso deve ser alterado
Hoje o front não possui uma base clara de testes automatizados. Sem isso, qualquer refatoração corre o risco de quebrar fluxo já existente sem percepção imediata.

### O que implementar
Adicionar:

- `Vitest` para execução dos testes
- `React Testing Library` para testes de componentes
- `MSW` para simular backend
- script `test` no `package.json`

### Benefício prático
Isso permite validar rapidamente se:

- login continua funcionando
- rotas protegidas continuam seguras
- payloads continuam corretos
- services continuam chamando os endpoints certos

### Critérios de aceite
- `npm run test` executa localmente
- existe ao menos um teste simples passando
- estrutura de testes está criada e documentada

### Testes unitários mínimos desta fase
- helper de normalização
- rota protegida
- client HTTP centralizado

---

# Fase 1 — Autenticação e sessão

Essa é a fase mais importante do projeto.

Se autenticação e sessão não forem centralizadas, todo o resto continua inconsistente.

---

## 5.1.1 Envolver a aplicação com `AuthProvider`

### Arquivos envolvidos
- `src/App.tsx`
- `src/context/AuthContext.tsx`

### Problema atual
O projeto possui um `AuthContext` estruturado, mas o `App.tsx` não envolve a aplicação com o `AuthProvider`.

Isso significa que vários componentes dependem de um contexto que nem sempre está garantido na árvore principal da aplicação.

### Por que isso deve ser alterado
Sem o provider:

- o app não possui uma fonte global oficial da sessão
- cada parte tende a descobrir a autenticação do seu jeito
- aumenta a chance de comportamento inconsistente entre telas

### O que implementar
No `App.tsx`, envolver a aplicação com `AuthProvider`.

Ordem recomendada da árvore:

- `QueryClientProvider`
  - `ThemeProvider`
    - `AuthProvider`
      - `BrowserRouter`

### Resultado esperado
Toda a aplicação passa a ter acesso centralizado a:

- status da sessão
- usuário autenticado
- role do usuário
- ações de logout
- checagem de sessão

### Critérios de aceite
- nenhuma tela que usa `useAuth()` quebra
- a sessão é carregada ao abrir a aplicação
- componentes globais como `Sidebar` conseguem acessar sessão via contexto

### Testes unitários
- deve iniciar com status `checking`
- deve mudar para `authenticated` quando a sessão for válida
- deve mudar para `unauthenticated` em caso de `401/403`

---

## 5.1.2 Refatorar `ProtectedRoute`

### Arquivo envolvido
- `src/components/ProtectedRoute.tsx`

### Problema atual
A rota protegida verifica apenas se existe token em `localStorage`.

### Por que isso deve ser alterado
Ter token salvo não significa que:

- o token é válido
- o token não expirou
- o usuário ainda está autorizado
- o backend aceita a sessão

Então hoje a aplicação pode “achar” que o usuário está autenticado quando, na prática, o backend já rejeitaria as chamadas.

### O que implementar
O `ProtectedRoute` deve usar `useAuth()` e tomar a decisão com base no contexto:

- se `status === "checking"`: exibir loading
- se `status === "unauthenticated"`: redirecionar para login
- se `status === "authenticated"`: renderizar conteúdo

### Resultado esperado
A regra de acesso deixa de depender apenas de armazenamento local e passa a depender da sessão real.

### Critérios de aceite
- token inválido não permite entrada em rota protegida
- sessão válida permite navegação
- durante a checagem, não há vazamento visual de conteúdo protegido

### Testes unitários
- renderiza loader quando sessão está em análise
- redireciona quando não autenticado
- libera conteúdo quando autenticado

---

## 5.1.3 Unificar login com senha

### Arquivos envolvidos
- `src/components/LoginForm.tsx`
- `src/service/auth.Service.ts`

### Problema atual
O componente de login usa `fetch` manual diretamente.

### Por que isso deve ser alterado
Quando o componente chama a API diretamente:

- a lógica de autenticação fica presa na tela
- o tratamento de erro fica duplicado
- o padrão do client centralizado deixa de ser respeitado

### O que implementar
`LoginForm.tsx` deve chamar apenas o `auth.Service.ts`.

O service será responsável por:

- enviar credenciais
- receber resposta
- retornar token
- lançar erro padronizado

O componente deve apenas:

- coletar dados do formulário
- chamar o service
- salvar token
- acionar atualização de sessão
- redirecionar

### Critérios de aceite
- login usa apenas o service
- `fetch` direto não é usado mais
- erro do backend aparece de forma uniforme
- após login, a sessão global é atualizada

### Testes unitários
- login de sucesso
- login com erro de credenciais
- componente chama o service corretamente
- token é persistido com sucesso

---

## 5.1.4 Unificar login facial

### Arquivos envolvidos
- `src/components/FaceLoginModal.tsx`
- `src/service/auth.Service.ts`

### Problema atual
Assim como o login normal, o login facial usa `fetch` direto e mantém lógica própria de requisição.

### Por que isso deve ser alterado
O login facial é parte da mesma autenticação do sistema. Não deve existir como fluxo paralelo com outro padrão técnico.

### O que implementar
Fazer com que `FaceLoginModal.tsx` utilize apenas `loginWithFace()` do service.

### Critérios de aceite
- login facial usa apenas o service
- sucesso atualiza token e sessão global
- falha mostra mensagem padronizada

### Testes unitários
- sucesso no login facial
- erro no login facial
- componente chama corretamente o service

---

## 5.1.5 Corrigir logout

### Arquivos envolvidos
- `src/service/auth.Service.ts`
- `src/context/AuthContext.tsx`
- componentes que executam logout, como `Sidebar.tsx`

### Problema atual
O front tenta chamar `POST /auth/logout`, mas esse endpoint não está definido no contrato principal do backend analisado.

### Por que isso deve ser alterado
Se o endpoint não existe, o logout remoto falha.

### O que implementar
Enquanto não existir logout oficial no backend, o logout do front deve ser local:

- remover token
- limpar sessão do contexto
- redirecionar para login

### Critérios de aceite
- logout funciona mesmo sem endpoint remoto
- após logout, usuário não acessa rotas protegidas
- informações de sessão são removidas do app

### Testes unitários
- logout limpa token
- logout limpa contexto
- logout redireciona corretamente

---

# Fase 2 — Padronização do client HTTP

---

## 5.2.1 Tornar `api.ts` o único cliente HTTP interno

### Arquivo base
- `src/config/api.ts`

### Problema atual
O projeto usa duas abordagens diferentes para comunicação HTTP:

- `axios` com interceptors
- `fetch` manual em vários services e componentes

### Por que isso deve ser alterado
Quando cada arquivo faz requisição do seu jeito, surgem diferenças em:

- token
- cabeçalhos
- tratamento de erro
- tratamento de 401/403
- redirects especiais, como aceite de termos

### O que implementar
Todo acesso ao backend interno deve obrigatoriamente passar por `api.ts`.

### Benefício prático
Você ganha:

- centralização
- previsibilidade
- menos repetição
- menos bugs

### Critérios de aceite
- nenhum service interno usa `fetch`
- todas as chamadas autenticadas passam pelo interceptor
- erros HTTP são tratados de forma consistente

### Testes unitários
- interceptor adiciona `Authorization`
- interceptor trata `403` com tipo `TERMS_NOT_ACCEPTED`
- responses de erro são propagadas de forma uniforme

---

## 5.2.2 Criar padrão único de tratamento de erro

### Arquivos envolvidos
- `src/config/api.ts`
- `src/service/helpers/service-error.helper.ts`
- services em geral

### Problema atual
Cada arquivo trata erro de uma forma diferente.

### Por que isso deve ser alterado
Se o tratamento de erro é duplicado:

- mensagens ficam inconsistentes
- manutenção fica mais cara
- mesmo erro aparece de formas diferentes em telas diferentes

### O que implementar
Centralizar conversão de erro HTTP em mensagens úteis para a UI.

### Critérios de aceite
- services não fazem parsing manual repetido de erro
- telas usam helper comum para exibir mensagens

### Testes unitários
- 400 vira mensagem de validação
- 401/403 viram erro de autenticação
- fallback genérico funciona quando não há corpo legível

---

## 5.2.3 Criar padrão único de normalização de resposta

### Arquivos envolvidos
- `src/service/helpers/response-normalizer.helper.ts`

### Problema atual
O backend retorna formatos diferentes dependendo do domínio.

Exemplos:
- `{ companies: [...] }`
- `{ employees: [...] }`
- `{ users: [...] }`
- `{ documents: [...] }`
- array direto em mensagens

### Por que isso deve ser alterado
Se cada tela ou service tenta interpretar isso sozinho, o projeto fica cheio de lógica duplicada.

### O que implementar
Usar helpers para:

- extrair listas
- extrair objetos
- mapear payloads do backend para objetos do front

### Critérios de aceite
- os services dependem de helpers de normalização
- não existe parsing improvisado espalhado pela aplicação

### Testes unitários
- extrair array direto
- extrair array dentro de envelope
- extrair objeto simples
- mapear perfil de usuário com campos faltando

---

# Fase 3 — Refatoração por domínio

---

## 5.3.1 Empresas

### Arquivo principal
- `src/service/company.Service.ts`

### Problema atual
Esse arquivo usa `fetch` manual e possui chave HERE API hardcoded.

### Por que isso deve ser alterado
Dois motivos:

1. foge do padrão novo da aplicação
2. expõe segredo diretamente no front-end

### O que implementar
- migrar para `api.ts`
- remover uso hardcoded da chave HERE
- usar variável de ambiente se ainda ficar no front
- idealmente mover geolocalização para o backend futuramente

### Critérios de aceite
- listar empresas continua funcionando
- buscar detalhes por CNPJ continua funcionando
- atualizar empresa continua funcionando
- alternar status continua funcionando
- nenhuma chave externa fica exposta no código-fonte

### Testes unitários
- listagem de empresas
- detalhe de empresa
- atualização de empresa
- alternância de status
- tratamento de erro de empresa inexistente

---

## 5.3.2 Colaboradores — corrigir serviço legado e consolidar serviço válido

### Arquivos envolvidos
- `src/service/employee.Service.ts`
- `src/service/collaborator-management.service.ts`
- `src/pages/CriarColaborador.tsx`

### Problema atual
Há duas implementações concorrentes.

#### Problemas do `employee.Service.ts`
Ele usa endpoints que não existem mais ou não existem no backend atual, por exemplo:

- `auth/username-availability`
- `companies/list-basic`
- `employees/create-partner`
- `employees/create-manager`
- `employees/{employeeId}`

#### Situação do `collaborator-management.service.ts`
Esse está muito mais próximo do contrato real do backend.

### Por que isso deve ser alterado
O fluxo de cadastro de colaborador é crítico e hoje está vulnerável por:

- duplicidade de service
- endpoints errados
- imports duplicados na tela
- mistura de responsabilidade

### O que implementar
1. considerar `employee.Service.ts` como legado
2. remover seu uso progressivamente
3. manter `collaborator-management.service.ts` como service oficial
4. em `CriarColaborador.tsx`, usar somente:
   - checagem de CPF
   - checagem de username
   - criação de colaborador
   - criação de usuário
5. limpar imports duplicados
6. separar claramente o fluxo:
   - passo 1: cria colaborador
   - passo 2: cria usuário

### Critérios de aceite
- CPF é verificado via endpoint real
- username é verificado via endpoint real
- colaborador é criado no endpoint correto
- usuário é criado no endpoint correto
- nenhum endpoint antigo é usado nessa tela

### Testes unitários
- verificar CPF disponível e indisponível
- verificar username disponível e indisponível
- criação de colaborador retorna `employeeId`
- criação de usuário finaliza com sucesso

### Testes de componente
- tela avança do passo 1 para o passo 2
- não permite passo 2 sem passo 1
- não conclui cadastro sem username validado

---

## 5.3.3 Usuário e sessão de perfil

### Arquivos envolvidos
- `src/service/user.Service.ts`
- `src/service/session-profile.service.ts`
- `src/hooks/useUser.ts`

### Problema atual
Esse domínio está melhor estruturado, mas deve virar o padrão oficial do projeto.

### Por que isso deve ser alterado
Aqui já existe uma boa abordagem:

- buscar dados da conta em `/users/own-profile`
- buscar perfil detalhado em `/employee/own-profile`
- combinar os dois resultados em uma estrutura útil para o front

Essa implementação precisa ser mantida e consolidada.

### O que implementar
- manter a camada atual como oficial
- remover duplicações antigas, se ainda existirem
- ajustar `useUser.ts` para depender de tratamento de erro centralizado

### Critérios de aceite
- perfil do usuário carrega corretamente
- atualização de email funciona
- atualização de telefone funciona
- alteração de senha funciona
- expiração de sessão é tratada corretamente

### Testes unitários
- montagem de sessão composta
- atualização de email
- atualização de telefone com limpeza de máscara
- troca de senha com validação de confirmação

---

## 5.3.4 Documentos

### Arquivo principal
- `src/service/document.Service.ts`

### Problema atual
Esse service mistura endpoints corretos com endpoints inexistentes.

#### Pontos corretos
- listagem por `/documents`
- download por `/documents/{documentId}`
- exclusão por `/documents/{documentId}`
- upload por `/documents` com multipart

#### Pontos incorretos
- `documents/me`
- `documents/employee/{employeeId}`
- `documents/upload`
- `employees?active=true`

### Por que isso deve ser alterado
Se uma chamada usa rota que não existe, a integração falha independentemente da tela.

### O que implementar
O service deve trabalhar apenas com o contrato real:

- listar documentos via `/documents`
- enviar documento via `POST /documents`
- baixar via `GET /documents/{id}`
- excluir via `DELETE /documents/{id}`
- buscar colaboradores via `/employee?active=true`

### Critérios de aceite
- upload funciona com multipart
- download funciona corretamente
- exclusão funciona corretamente
- listagem funciona pelo envelope real da API
- referências a endpoints inexistentes foram removidas

### Testes unitários
- listagem de documentos
- upload com `file`, `type` e `employeeId`
- download respeitando nome do arquivo
- exclusão
- busca de colaboradores para seleção

---

## 5.3.5 Mensagens e dashboard

### Arquivos envolvidos
- `src/service/message.service.ts`
- `src/service/dashboard.service.ts`
- `src/hooks/useMessages.ts`

### Situação atual
Esse domínio já está relativamente correto, mas merece padronização fina.

### Por que isso deve ser alterado
Mesmo nos pontos corretos, ainda vale:

- centralizar erro
- eliminar heurísticas locais de sessão
- preparar paginação futura

### O que implementar
- manter `message.service.ts` como base
- ajustar hook para usar erros centralizados
- opcionalmente preparar paginação

### Critérios de aceite
- listagem de mensagens continua funcionando
- exclusão continua funcionando
- avisos do dashboard continuam sendo carregados

### Testes unitários
- listagem de mensagens
- exclusão de mensagem
- atualização de estado local após exclusão

---

## 5.3.6 Registros de ponto, relatórios, férias e abonos

### Arquivos envolvidos
- `src/service/pendingApproval.service.ts`
- `src/service/vacation.service.ts`
- `src/service/report.service.ts`
- `src/service/reportPortal.service.ts`
- hooks relacionados

### Problema atual
Há duplicidade de lógica e uma rota incorreta importante.

### Exemplo crítico
Existe implementação de solicitação de abono usando:

- `records/time-off-request` → incorreto
- `records/time-off/request` → correto

### Por que isso deve ser alterado
Esse domínio é sensível, porque envolve operação real do sistema:

- relatório de ponto
- ajustes
- aprovações
- férias
- abono manual

Se houver duplicidade, o risco de divergência é alto.

### O que implementar
1. escolher um único service para o domínio `records`
2. mover todas as chamadas para esse service
3. remover services duplicados
4. corrigir rota de time off
5. padronizar retorno paginado

### Critérios de aceite
- relatórios usam endpoint oficial
- aprovações usam endpoint oficial
- férias usam endpoint oficial
- solicitações de abono usam endpoint oficial
- não existe mais implementação duplicada do mesmo fluxo

### Testes unitários
- relatório detalhado
- aprovar ajuste
- rejeitar ajuste
- solicitar férias
- aprovar férias
- rejeitar férias
- solicitar abono com multipart
- aprovar abono
- rejeitar abono
- listar solicitações paginadas

### Testes de integração
- fluxo de geração de relatório
- fluxo de solicitação de abono
- fluxo de aprovação de férias

---

## 5.3.7 Auditoria fiscal

### Arquivo principal
- `src/service/fiscal.service.ts`

### Situação atual
Esse arquivo está próximo do ideal.

### O que implementar
Fazer apenas ajustes de robustez:

- padronizar tratamento de erro
- garantir nomes de arquivos consistentes
- adicionar testes

### Critérios de aceite
- downloads continuam funcionando
- mensagens de erro ficam consistentes
- response blob é baixada corretamente

### Testes unitários
- espelho de ponto
- AFD
- AEJ
- atestado técnico

---

# Fase 4 — Limpeza arquitetural

---

## 5.4.1 Remover arquivos legados

### O que alterar
Remover ou descontinuar definitivamente arquivos que apontam para contratos errados.

### Por que isso deve ser alterado
Código legado “abandonado, mas ainda no projeto” quase sempre volta a ser usado depois.

### O que implementar
- apagar services obsoletos
- remover imports não usados
- apagar referências a endpoints antigos

### Critérios de aceite
- busca textual no projeto não encontra endpoints antigos
- não existem dois services ativos para o mesmo domínio
- o time sabe qual arquivo é o oficial por domínio

---

## 5.4.2 Criar arquivo central de rotas da API

### O que alterar
Criar um arquivo de constantes de rota.

### Por que isso deve ser alterado
Hoje as strings de endpoint ficam espalhadas. Isso aumenta chance de erro de digitação e manutenção difícil.

### O que implementar
Criar constantes como:

- `COMPANIES = "companies"`
- `EMPLOYEE = "employee"`
- `USERS = "users"`
- `DOCUMENTS = "documents"`
- `RECORDS = "records"`

### Critérios de aceite
- serviços usam constantes centralizadas
- alterar endpoint exige mudança em um lugar só

### Testes unitários
Não exige muitos testes específicos, mas os services devem continuar funcionando com essas constantes.

---

## 5.4.3 Padronizar nomenclatura e organização

### O que alterar
Padronizar:

- nomes de arquivos
- singular/plural
- `Service` versus `service`
- localização por domínio

### Por que isso deve ser alterado
Hoje há inconsistência como:

- `company.Service.ts`
- `user.Service.ts`
- `dashboard.service.ts`
- `documentPortal.service.ts`

Isso atrapalha manutenção e onboarding.

### Critérios de aceite
- estrutura previsível
- um único padrão de nomenclatura
- novo desenvolvedor entende facilmente onde editar cada integração

---

# Fase 5 — Estratégia de testes

---

## 5.5.1 Testes unitários obrigatórios

### Autenticação
- `AuthProvider`
- `ProtectedRoute`
- `auth.Service`
- `session-profile.service`

### Helpers
- `response-normalizer.helper`
- `service-error.helper`

### Services
- empresas
- colaboradores
- usuário
- documentos
- mensagens
- dashboard
- registros
- fiscal

### Hooks
- `useUser`
- `useMessages`
- `usePendingApprovals`
- `useVacationApprovals`

---

## 5.5.2 Testes de componente obrigatórios

### Componentes mais importantes
- `LoginForm`
- `FaceLoginModal`
- `ProtectedRoute`
- `CriarColaborador`
- `Documentos`
- `RelatorioDetalhado`

### O que validar
- renderização
- loading
- erro
- submissão
- redirecionamento
- bloqueio de ações inválidas

---

## 5.5.3 Testes de integração com backend mockado

### Casos mais importantes
1. login com sucesso
2. login com falha
3. sessão expirada em rota protegida
4. criação de colaborador
5. criação de usuário
6. upload de documento
7. geração de relatório
8. solicitação de abono
9. aprovação de férias

---

# 6. Ordem recomendada de execução

A ordem abaixo é a mais segura para implementação:

1. criar base de testes
2. colocar `AuthProvider` no `App.tsx`
3. refatorar `ProtectedRoute`
4. unificar login normal e facial
5. corrigir logout
6. obrigar toda comunicação interna a passar por `api.ts`
7. consolidar serviços de colaboradores
8. corrigir documentos
9. consolidar domínio de registros, férias e abonos
10. remover legado
11. padronizar rotas e nomenclatura
12. ampliar testes

---

# 7. Backlog técnico resumido

## Sprint 1 — Fundação
- configurar testes
- incluir `AuthProvider`
- corrigir `ProtectedRoute`
- unificar login
- corrigir logout

## Sprint 2 — Comunicação HTTP
- eliminar `fetch` interno
- consolidar `api.ts`
- padronizar erro
- padronizar normalização

## Sprint 3 — Domínios críticos
- colaboradores
- usuário
- documentos

## Sprint 4 — Domínio operacional
- relatórios
- aprovações
- férias
- abonos
- auditoria fiscal

## Sprint 5 — Limpeza final
- remover arquivos legados
- padronizar rotas
- reforçar cobertura de testes

---

# 8. Critérios de aceite gerais do projeto

O trabalho pode ser considerado concluído quando estas condições forem verdadeiras:

1. nenhum service interno usa `fetch`
2. nenhum arquivo chama endpoint inexistente do backend
3. autenticação depende do `AuthContext`
4. login, sessão e logout estão centralizados
5. cadastro de colaborador usa o fluxo correto do backend
6. documentos usam apenas endpoints válidos
7. solicitações de abono usam a rota correta
8. existe suíte mínima de testes rodando
9. código legado conflitante foi removido
10. a estrutura do projeto ficou previsível para manutenção

---

# 9. Maiores riscos atuais do projeto

Em ordem de prioridade:

1. autenticação e sessão
2. cadastro de colaborador
3. documentos
4. férias e abonos
5. relatórios
6. limpeza arquitetural

---

# 10. Conclusão executiva

O problema do front-end não é um único bug isolado.

O problema é estrutural: existem duas gerações de integração convivendo ao mesmo tempo.

A forma correta de resolver isso não é “corrigir tela por tela” sem critério.

A forma correta é:

- centralizar autenticação
- centralizar o client HTTP
- alinhar todos os domains ao contrato real do backend
- remover código legado
- criar testes para impedir regressão

## Decisão técnica recomendada
> Adotar oficialmente a arquitetura nova baseada em `api.ts + interceptors + AuthContext + normalizers` e eliminar a arquitetura antiga baseada em `fetch` manual e endpoints legados.

Essa é a refatoração que mais aumenta estabilidade, previsibilidade e nível enterprise do projeto.

---
