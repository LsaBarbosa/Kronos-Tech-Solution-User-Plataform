Fiz a análise cruzando a branch `v4/fase4/limpeza` do front com o contrato real do backend `main`.

Conclusão principal: essa branch já está em um estágio bem mais maduro do que o plano inicial. A fundação técnica já foi quase toda resolvida: testes com Vitest/MSW já existem no projeto , a aplicação já está envolvida com `AuthProvider` em `App.tsx` , a sessão já é centralizada em `AuthContext` , a proteção de rota já usa o estado real da sessão , e o client HTTP centralizado com interceptors já existe em `api.ts` . Além disso, a própria comparação de commits mostra que essa branch já removeu muito legado, criou services novos, normalizadores, testes e consolidou o domínio de records .

Então o backlog correto para essa branch não é mais “refatorar tudo”. Agora o foco é corrigir os pontos onde o front ainda não reflete exatamente o que o back espera ou retorna.

## Resumo executivo em ordem de prioridade

Hoje os maiores problemas não estão mais em autenticação básica. Estão em 4 áreas:

1. listagem/edição de colaboradores e usuários
2. contrato de empresas e uso de geolocalização
3. tipagem e semântica do domínio de férias/abonos/ponto
4. pequenos desalinhamentos de payload e endpoint em services

O backend atual expõe os domínios centrais por `auth`, `companies`, `employee`, `users`, `documents`, `records`, `terms` e `legal`   , e a branch do front já está majoritariamente apontando para essas rotas. O problema restante é menos “rota errada” e mais “shape errado”, “tipagem errada” e “suposição errada sobre a resposta”.

---

# Backlog priorizado

## P0 — Bloqueadores funcionais

### BL-01 — Corrigir o contrato de listagem de usuários usado no fluxo de colaboradores

**Problema**
O front usa `listUsers()` para cruzar usuários com colaboradores e assume que cada usuário retornado possui `employeeId` . Isso é reforçado pelo tipo `UserAccountData`, que também exige `employeeId` .
Só que o backend atual, em `/users/search`, retorna `UserSearchItemResponse` com apenas `userId`, `username`, `role` e `active` — sem `employeeId` .

**Impacto**
O merge feito em `useCollaboratorList.ts` usando `user.employeeId` pode falhar estruturalmente, porque esse vínculo simplesmente não existe na resposta real .

**O que alterar**

* No front, separar claramente os tipos:

  * `UserAccountData` para `/users/own-profile`
  * `UserSearchItem` para `/users/search`
* Remover a suposição de que `/users/search` traz `employeeId`.
* Recomenda-se ajuste no backend para incluir `employeeId` na resposta de `/users/search`, porque o front de gestão de colaboradores precisa desse vínculo para editar, ativar e cruzar usuário com empregado.

**Dependência**

* **Front + Back**
* Esse é o principal item que eu classifico como dependente de evolução de contrato do backend.

**Critério de aceite**

* A listagem de colaboradores consegue cruzar corretamente colaborador e usuário sem heurística frágil.
* Edição, role e ativação do usuário funcionam sem depender de campo inexistente.

---

### BL-02 — Corrigir o contrato de empresa no front: o backend não retorna `location`

**Problema**
Os tipos do front modelam empresa com `location` em `CompanyListItem` e `CompanyData` .
Mas o backend retorna `CompanyResponse` com `id`, `name`, `cnpj`, `email`, `active`, `address`, `activeEmployees` e `inactiveEmployees`, sem `location` . A listagem é apenas `CompanyListResponse(List<CompanyResponse>)` .

**Impacto**
`useUpdateCompanyForm.ts` assume `originalCompany.location.latitude/longitude` e usa isso em reset, comparação e payload de update . Isso pode quebrar a edição de empresa.

**O que alterar**

* Tornar `location` opcional no tipo do front ou removê-lo da resposta de leitura.
* Ajustar `fetchCompanyDetails()` e os tipos para refletirem exatamente o contrato atual do backend.
* Em `useUpdateCompanyForm`, não depender de `location` carregada do backend.
* Se o endereço não mudar, o front não deveria precisar tocar em geolocalização.
* Se o endereço mudar, o front pode recalcular geolocalização antes do PATCH, mas isso deve ser tratado como fluxo derivado, não como dado sempre retornado.

**Dependência**

* **Front**, com observação de que o melhor cenário seria o backend passar a devolver `location` se essa informação for importante para edição.

**Critério de aceite**

* Buscar empresa funciona sem campos `undefined`.
* Atualizar empresa não quebra quando `location` não vier na resposta.
* O tipo TS reflete o payload real.

---

### BL-03 — Saneamento semântico do domínio de abono/esquecimento/ponto

**Problema**
O front ainda mistura conceitos de “tipo de solicitação” com “status do registro”.
O backend usa:

* `RequestType.TIME_OFF_REQUEST`
* `RequestType.FORGOTTEN_REGISTRATION` no request multipart  

Mas o fluxo funcional gera status:

* `TIME_OFF_REQUEST` para abono
* `WORK_TIME_REQUEST` para esquecimento
* `WORK_TIME_REJECTED` na rejeição de esquecimento  

Só que `recordApproval.ts` inclui `FORGOTTEN_REGISTRATION` como se fosse `StatusRecord`, duplica `TIME_OFF`, e não mostra `WORK_TIME_REJECTED` . `vacation.ts` também aparece com duplicações de interface e inconsistência semântica .

**Impacto**

* Filtros errados
* renderização errada de status
* validações erradas
* fragilidade em hooks, tabelas e formulários

**O que alterar**

* Separar:

  * `RequestType = TIME_OFF_REQUEST | FORGOTTEN_REGISTRATION`
  * `StatusRecord = ... | TIME_OFF_REQUEST | WORK_TIME_REQUEST | TIME_OFF_REJECTED | WORK_TIME_REJECTED | ...`
* Remover duplicações de `TimeRecordPageResponse`, `TimeOffFormState` e membros repetidos.
* Garantir que telas de aprovação e listagem usem os status reais do backend, não o enum do request.

**Dependência**

* **Front**

**Critério de aceite**

* O front distingue corretamente “tipo enviado” e “status persistido”.
* Tabelas e filtros de abono/esquecimento exibem os estados reais do backend.

---

## P1 — Alta prioridade

### BL-04 — Remover `password` do payload de criação de usuário

**Problema**
O front define `UserCreationPayload` com `password?: string` e passa esse campo no fluxo de criação de usuário  .
Mas o backend `CreateUserRequest` aceita apenas `username`, `role` e `employeeId` .

**Impacto**

* Ruído de contrato
* falsa percepção de que o front controla a senha inicial
* risco de comportamento divergente entre tela e backend

**O que alterar**

* Remover `password` do type de criação.
* Remover envio de `password` no passo 2 de `CriarColaborador`.
* Ajustar texto da UI para refletir que a senha inicial é controlada pelo backend.

**Dependência**

* **Front**

**Critério de aceite**

* O payload de `POST /users` contém apenas o que o backend aceita.

---

### BL-05 — Corrigir `toggleUserStatus` para refletir o endpoint real

**Problema**
O front envia body em `PATCH /users/toggle-activate/{userId}` com `{ active: !currentStatus }` .
O backend expõe esse endpoint como toggle puro, sem body .

**Impacto**

* acoplamento desnecessário
* risco de confusão futura se o body for ignorado hoje e interpretado amanhã

**O que alterar**

* Chamar o endpoint sem body.
* A lógica de inversão deve continuar apenas no cliente para feedback visual, não como parte do contrato HTTP.

**Dependência**

* **Front**

**Critério de aceite**

* Toggle funciona chamando apenas o path param.

---

### BL-06 — Consolidar e normalizar os tipos do domínio de usuário

**Problema**
`user.service.ts` usa o mesmo modelo mental tanto para `/users/own-profile` quanto para `/users/search`, mas o backend retorna contratos diferentes nesses dois endpoints   .

**O que alterar**

* Criar tipos separados:

  * `UserOwnProfileResponse`
  * `UserSearchItemResponse`
* Manter `session-profile.service.ts` como camada oficial para sessão, pois ele já está correto conceitualmente ao compor `/users/own-profile` com `/employee/own-profile` .
* Ajustar `useUser.ts` para depender só desses tipos corretos.

**Dependência**

* **Front**

**Critério de aceite**

* Nenhum tipo de listagem herda campos que só existem no own-profile.

---

### BL-07 — Corrigir o fluxo de empresas para refletir o onboarding real

**Problema**
O front cria empresa em `CriarEmpresa.tsx` com payload só de empresa e depois redireciona para `/criar-administrador` .
O DTO do backend `CreateCompanyRequest` contém `employeeRequest` , mas o `CompanyService.createCompany()` atual ignora isso e persiste apenas a empresa .

**Leitura correta**
Hoje o fluxo do front funciona por coincidência do service atual, não por aderência plena ao DTO.

**O que alterar**

* Definir oficialmente um destes dois caminhos:

  * manter o fluxo em 2 etapas e simplificar o DTO do backend
  * ou aderir ao DTO completo e criar empresa + primeiro responsável na mesma chamada
* Enquanto isso não for decidido, documentar explicitamente que o front usa onboarding em 2 etapas porque o service real ainda ignora `employeeRequest`.

**Dependência**

* **Front + Back** se quiser alinhamento definitivo

**Critério de aceite**

* O fluxo de onboarding de empresa fica oficialmente consistente entre DTO, service e UI.

---

## P2 — Média prioridade

### BL-08 — Tirar a geolocalização externa da página e deixar o domínio de empresa mais previsível

**Problema**
`company.service.ts` ainda usa `fetch` direto para ViaCEP e HERE API, com `VITE_HERE_API_KEY` no front . `CriarEmpresa.tsx` também implementa geocodificação direta na própria página .

**Impacto**

* segredo exposto no front
* duplicação de lógica
* dependência de API externa fora do client HTTP interno
* regra difícil de testar

**O que alterar**

* Escolher um único ponto para geocodificação, preferencialmente backend.
* Se ficar no front por agora, centralizar tudo em `company.service.ts`.
* Remover `fetch` de página/componente.
* Parar de duplicar lógica de ViaCEP + HERE.

**Dependência**

* **Front**, idealmente com evolução futura no **Back**

**Critério de aceite**

* Não existe geocodificação espalhada em componente.
* A key externa não fica embutida na lógica de página.

---

### BL-09 — Saneamento de tipos duplicados e nomes inconsistentes

**Problema**
Ainda há sinais de duplicação residual em `recordApproval.ts` e `vacation.ts`  .
Também há mistura de convenções (`I*`, nomes duplicados, interfaces repetidas).

**O que alterar**

* Eliminar interfaces duplicadas.
* Remover prefixos inconsistentes quando não agregam valor.
* Centralizar tipos de records em um arquivo único coerente:

  * request params
  * page responses
  * status enums
  * request types

**Dependência**

* **Front**

**Critério de aceite**

* Cada conceito tem um único type.
* Não existe enum/status duplicado ou contraditório.

---

### BL-10 — Tornar o módulo de férias consistente com paginação e shape do backend

**Problema**
O backend retorna férias como lista consolidada de `VacationRequestResponse`  e o controller expõe `GET /records/vacation-request` com `status`, `employeeName`, `page` e `size` .
O front usa hooks que tratam o retorno como array simples e contagens derivadas localmente em alguns pontos, o que é funcional, mas pouco robusto .

**O que alterar**

* Formalizar o tipo de resposta de férias no front.
* Padronizar paginação, filtros e totalização.
* Evitar heurística local para contagem quando o backend puder fornecer paginação/quantidade.

**Dependência**

* **Front**

**Critério de aceite**

* O módulo de férias trabalha com tipos estáveis e sem cast implícito.

---

### BL-11 — Revisar contagens “por carga massiva”

**Problema**
`fetchPendingVacationCount()` usa `size: 500` e conta itens localmente .

**Impacto**

* escala mal
* gera falsa sensação de total real
* quebra quando volume crescer

**O que alterar**

* Se o backend não expõe count dedicado, usar metadados reais de paginação quando houver.
* Caso não haja metadado suficiente, criar endpoint de contagem no backend.

**Dependência**

* **Front** ou **Front + Back**

**Critério de aceite**

* Contadores não dependem de “buscar até 500”.

---

## P3 — Melhorias estruturais

### BL-12 — Fortalecer o domínio de documentos só com tipos reais da API

**Situação**
O `document.service.ts` está bem alinhado com o backend: GET/POST/DELETE em `/documents` e busca de colaboradores em `/employee?active=true` . Esse domínio deixou de ser crítico.

**Melhoria**

* Apenas revisar o mapeamento de campos `id/name/fileName/uploadedAt/type` para garantir aderência exata ao DTO real do backend.
* Manter como domínio estável.

---

### BL-13 — Manter mensagens, sessão e fiscal como domínios estáveis

**Situação**

* `useMessages.ts` já está usando sessão centralizada e tratamento de auth expirado .
* `fiscal.service.ts` está corretamente alinhado com `/legal/technical-certificate`, `/legal/afd`, `/legal/aej` e `/legal/espelho-ponto` .
* `auth.service.ts` também está alinhado com os endpoints reais de autenticação .

**Melhoria**

* Manter.
* Apenas reforçar testes e tipagem.

---

# Backlog consolidado por sprint

## Sprint 1 — Correção de contrato

1. Corrigir listagem de usuários para não assumir `employeeId` em `/users/search`.
2. Corrigir merge colaborador ↔ usuário.
3. Ajustar tipos de empresa para não depender de `location` retornada.
4. Corrigir `useUpdateCompanyForm` para funcionar sem `location` na resposta.

## Sprint 2 — Saneamento do domínio operacional

5. Separar `RequestType` de `StatusRecord`.
6. Remover `FORGOTTEN_REGISTRATION` de status de registro.
7. Adicionar `WORK_TIME_REJECTED`.
8. Eliminar duplicações em `recordApproval.ts` e `vacation.ts`.

## Sprint 3 — Payloads e endpoints finos

9. Remover `password` do `POST /users`.
10. Corrigir `PATCH /users/toggle-activate/{userId}` para não enviar body.
11. Revisar tipos de `user.service.ts` por endpoint.
12. Formalizar retorno de férias.

## Sprint 4 — Empresas e geolocalização

13. Centralizar geocodificação.
14. Remover dependência de lógica externa em página.
15. Definir oficialmente se criação de empresa é fluxo em 1 etapa ou 2 etapas.
16. Se mantiver 2 etapas, alinhar DTO/backend para isso.

## Sprint 5 — Robustez e escalabilidade

17. Revisar contadores baseados em carga massiva.
18. Reforçar testes para os contratos corrigidos.
19. Congelar os domínios já estáveis: auth, fiscal, documentos, mensagens.

---

# O que já está correto e não deve ser refeito

Não vale gastar sprint refazendo estas partes, porque nesta branch elas já estão bem encaminhadas:

* base de testes já adicionada 
* `AuthProvider` já aplicado na árvore principal 
* `ProtectedRoute` já baseado em sessão real 
* client HTTP centralizado com interceptor 
* rotas centralizadas em `api-routes.ts` 
* login normal e facial já centralizados em service 
* session-profile composto por `/users/own-profile` + `/employee/own-profile` 
* documentos e fiscal já estão próximos do contrato real  

---

# Ordem recomendada final

A ordem mais segura é:

1. corrigir o contrato de `/users/search`
2. corrigir o módulo de colaboradores
3. corrigir o contrato de empresas e `location`
4. sanear tipos de records/vacation/time-off
5. remover payloads/body indevidos
6. centralizar geolocalização
7. reforçar testes em cima dos contratos já corrigidos
