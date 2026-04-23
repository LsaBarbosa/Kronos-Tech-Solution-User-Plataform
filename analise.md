# Análise Técnica do Front-end Kronos

## Projeto analisado
- **Front-end:** `Kronos-Tech-Solution-User-Plataform`
- **Branch do front-end:** `v4/fase4/limpeza`
- **Back-end de referência:** `Kronos-Tech-Solutions-KTS`
- **Branch do back-end:** `main`

---

## 1. Objetivo

Este documento consolida a análise técnica do front-end com foco em dois eixos:

1. verificar se o front-end está consumindo corretamente as APIs do back-end;
2. identificar erros estruturais, arquiteturais e melhorias necessárias no próprio front-end.

A diretriz principal desta análise é simples:

> toda alteração no front-end deve permanecer alinhada ao contrato real das APIs do back-end.

---

## 2. Conclusão executiva

A branch `v4/fase4/limpeza` representa uma evolução clara em relação ao cenário híbrido anterior.

O front-end já possui uma base técnica correta nos pontos mais críticos:

- autenticação centralizada com `AuthProvider`
- proteção de rotas com `ProtectedRoute`
- client HTTP centralizado com `axios`
- interceptors para token, erros e redirecionamento de termos
- normalização de resposta
- padronização de erro de service
- uso de `Vitest`, `Testing Library` e `MSW`

Ou seja, o projeto **não precisa de reescrita completa**.

O estágio atual é de **consolidação e limpeza técnica**.

O que ainda precisa ser feito é:

- remover resquícios de contrato antigo
- corrigir pequenos desvios de rota e payload
- eliminar lógica de sessão espalhada na UI
- reduzir acoplamento da UI com regras de negócio e serviços externos
- padronizar alguns domínios que ainda estão heterogêneos

---

## 3. Estado atual do front-end

### 3.1 O que já está correto

#### 3.1.1 Autenticação e sessão

O front-end já implementa corretamente a base moderna de sessão:

- `src/context/AuthContext.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/service/auth.service.ts`
- `src/components/LoginForm.tsx`
- `src/components/FaceLoginModal.tsx`

Pontos positivos:

- login com usuário e senha usa service centralizado
- login facial usa service centralizado
- token é persistido de forma única
- sessão é validada via `loadSessionProfile()`
- rota protegida usa status real da sessão
- logout é local, o que é coerente com a ausência de endpoint oficial de logout no contrato principal analisado

#### 3.1.2 Client HTTP e tratamento de erro

O projeto já possui a espinha dorsal correta de comunicação com API:

- `src/config/api.ts`
- `src/service/helpers/service-error.helper.ts`
- `src/service/helpers/response-normalizer.helper.ts`
- `src/config/api-routes.ts`

Pontos positivos:

- token é injetado automaticamente
- `FormData` recebe tratamento apropriado
- erro HTTP é convertido para um erro interno padronizado
- o redirecionamento para termos pendentes está centralizado
- há abstração mínima para rotas de API

#### 3.1.3 Base de testes

A base de testes já existe e está configurada:

- `vitest`
- `@testing-library/react`
- `msw`
- `jsdom`
- `src/test/setup.ts`

Isso corrige uma deficiência importante apontada em fases anteriores.

#### 3.1.4 Domínio de documentos

O domínio de documentos está, no geral, alinhado ao back-end:

- listagem via `/documents`
- upload via `POST /documents`
- download via `GET /documents/{documentId}`
- exclusão via `DELETE /documents/{documentId}`

#### 3.1.5 Domínio de registros, férias, abonos e fiscal

O domínio de `records` e `legal` está majoritariamente correto:

- pendências de aprovação
- relatório detalhado
- solicitação de férias
- aprovação/rejeição de férias
- solicitação de abono
- aprovação/rejeição de abono
- fiscal (`espelho`, `AFD`, `AEJ`, `technical-certificate`)

---

## 4. Principais problemas encontrados

---

## 4.1 Problemas de contrato com o back-end

### 4.1.1 Resquícios do domínio antigo `/employees`

Arquivo impactado:

- `src/service/collaborator-management.service.ts`

Problema:

Ainda existem métodos apontando para endpoints no plural:

- `PATCH /employees/{employeeId}/toggle-status`
- `DELETE /employees/{employeeId}`

O contrato analisado do back-end usa o domínio principal no singular:

- `/employee`
- `/employee/{employeeId}`
- `/employee/manager/update-employee/{employeeId}`
- `/employee/check-cpf`

#### Impacto

- risco de erro 404 em runtime
- manutenção confusa
- possibilidade de reaproveitamento indevido de código legado

#### Ação recomendada

- remover definitivamente qualquer método baseado em `/employees`
- manter apenas o contrato oficial em `/employee`

---

### 4.1.2 Constante de rota inválida ainda disponível

Arquivo impactado:

- `src/config/api-routes.ts`

Problema:

O arquivo mantém as duas entradas:

- `EMPLOYEE`
- `EMPLOYEES`

Como o contrato correto do domínio é o singular, manter `EMPLOYEES` aumenta o risco de uso indevido.

#### Ação recomendada

- remover `EMPLOYEES`
- manter somente `EMPLOYEE`

---

### 4.1.3 Divergência potencial entre `enabled` e `active` no update de usuário

Arquivos impactados:

- `src/pages/ListaColaboradores.tsx`
- `src/service/collaborator-management.service.ts`

Problema:

A UI manipula estado do usuário com campo `enabled`, mas o contrato funcional do sistema gira em torno de ativação/inativação de usuário. É necessário confirmar o nome exato do campo aceito pelo DTO real do back-end.

#### Impacto

- update pode aparentar funcionar parcialmente
- toggle ou edição pode enviar payload divergente
- bug silencioso em ambientes integrados

#### Ação recomendada

- revisar DTO real do endpoint `PATCH /users/search/{userId}`
- padronizar o payload exatamente com o campo que o back-end aceita
- eliminar a ambiguidade entre `enabled` e `active`

---

### 4.1.4 Parâmetros não sustentados no domínio fiscal

Arquivo impactado:

- `src/service/fiscal.service.ts`

Problema:

O service aceita `targetEmployeeId` em métodos como `downloadAfd()` e `downloadAej()`, mas isso não está claramente sustentado pelo contrato funcional usado como referência principal.

#### Impacto

- confusão no front-end
- possibilidade de parâmetro ignorado pelo back-end
- falsa percepção de suporte a filtro não oficial

#### Ação recomendada

- alinhar as assinaturas do service estritamente ao contrato oficial
- manter apenas os parâmetros realmente suportados

---

## 4.2 Problemas estruturais e arquiteturais

### 4.2.1 Decodificação manual do JWT na UI

Arquivos impactados:

- `src/components/Sidebar.tsx`
- `src/pages/RelatorioDetalhado.tsx`

Problema:

Mesmo com `AuthContext`, algumas telas ainda:

- leem token diretamente do `localStorage`
- decodificam o JWT manualmente
- extraem `role`, `employeeId` e `fullName` localmente

#### Por que isso é ruim

- espalha regra de sessão na interface
- duplica responsabilidade que já existe no contexto
- acopla a UI ao formato interno do token
- dificulta manutenção futura caso o token mude

#### Ação recomendada

Substituir qualquer uso de `decodeToken()` local por:

- `useAuth().status`
- `useAuth().role`
- `useAuth().user`

---

### 4.2.2 Geocodificação no cliente

Arquivos impactados:

- `src/service/company.service.ts`
- `src/hooks/useUpdateCompanyForm.ts`

Problema:

A atualização de empresa ainda executa no browser:

- consulta ao ViaCEP
- consulta ao HERE Maps
- recálculo de latitude/longitude
- dependência de `VITE_HERE_API_KEY`

#### Riscos

- lógica de negócio no front-end
- dependência externa exposta ao navegador
- divergência entre validação do front e do back
- manutenção mais difícil

#### Ação recomendada

Ideal:

- mover geocodificação para o back-end

Mínimo aceitável:

- isolar essa lógica em camada transitória bem controlada
- evitar duplicação de regra de negócio na UI

---

### 4.2.3 Componentes excessivamente grandes

Arquivos impactados:

- `src/pages/CriarColaborador.tsx`
- `src/pages/ListaColaboradores.tsx`
- `src/pages/RelatorioDetalhado.tsx`
- `src/pages/RequestManualRegistration.tsx`

Problema:

Esses componentes concentram responsabilidades demais:

- formulário
- validação
- orquestração de service
- tratamento de erro
- lógica de sessão
- lógica de exportação
- transformação de payload
- comportamento visual

#### Impacto

- difícil testar
- difícil manter
- maior risco de regressão
- leitura mais lenta

#### Ação recomendada

Separar em:

- hooks de orquestração
- helpers puros
- componentes presentacionais
- services especializados

---

### 4.2.4 Estratégia de estado inconsistente

Problema:

O projeto mistura padrões:

- `react-query` em alguns domínios
- `useEffect + useState` manual em outros

Exemplos:

- `usePendingApproval.ts` usa `react-query`
- `useVacationApprovals.ts` usa `react-query`
- `useTimeOffApprovals.ts` segue padrão manual
- `useMessages.ts` segue padrão manual

#### Impacto

- inconsistência técnica
- invalidação de cache desigual
- loading/error sem padronização

#### Ação recomendada

Padronizar a aplicação para:

- `useQuery` para leitura
- `useMutation` para escrita
- invalidação consistente
- retorno previsível de loading e error

---

### 4.2.5 Duplicação de lógica para obter gestores

Arquivos impactados:

- `src/service/records.service.ts`
- `src/hooks/useManualRegister.ts`

Problema:

Há mais de um caminho para carregar gestores:

- service dedicado que já filtra/normaliza
- leitura de usuários com filtro posterior na UI/hook

#### Ação recomendada

- padronizar um único fluxo oficial para obter gestores aprovadores

---

### 4.2.6 Estratégia de ambiente ainda frágil

Arquivos impactados:

- `vite.config.ts`
- `src/config/api.ts`

Problema:

Existe proxy local `/api -> localhost:8080`, mas a aplicação depende de `VITE_API_URL`. Sem padronização explícita, o comportamento em desenvolvimento fica sujeito a configuração manual sensível.

#### Ação recomendada

Escolher uma política única de desenvolvimento, por exemplo:

- `VITE_API_URL=/api` em dev
- URL real em homologação e produção
- documentação clara do `.env`

---

## 4.3 Bugs e inconsistências internas do front-end

### 4.3.1 Rota errada no menu lateral

Arquivo impactado:

- `src/components/Sidebar.tsx`

Problema:

O menu navega para:

- `/solicitar-Abono`

Mas a rota registrada no `App.tsx` é:

- `/solicitar-abono`

#### Impacto

- falha de navegação
- comportamento inconsistente entre ambientes

#### Ação recomendada

- corrigir a rota no `Sidebar.tsx`

---

### 4.3.2 Bug de payload ao editar PIS

Arquivo impactado:

- `src/pages/ListaColaboradores.tsx`

Problema:

No trecho de atualização, o campo `pis` aponta novamente para `cpf` no payload.

#### Impacto

- envio de campo incorreto
- risco de sobrescrever dado errado
- comportamento inesperado no update

#### Ação recomendada

- corrigir o mapeamento do campo
- validar todos os campos editáveis do payload de colaborador

---

### 4.3.3 Sinais de duplicação estrutural em tela grande

Arquivo impactado:

- `src/pages/CriarColaborador.tsx`

Problema:

A página possui sinais de duplicação estrutural de layout e markup, o que sugere resíduo de refatoração parcial.

#### Ação recomendada

- revisar a composição da tela
- eliminar blocos duplicados
- extrair seções reutilizáveis

---

## 5. Análise por domínio

### 5.1 Autenticação

**Situação:** boa e bem encaminhada.

#### Manter

- `AuthContext`
- `ProtectedRoute`
- `auth.service.ts`
- interceptors em `api.ts`

#### Ajustar

- remover qualquer leitura manual de token na UI

---

### 5.2 Empresas

**Situação:** integração principal existe, mas o fluxo de geolocalização ainda está acoplado ao front.

#### Ajustes necessários

- reduzir lógica de negócio no cliente
- evitar dependência externa sensível na UI
- tornar o fluxo mais alinhado ao back-end

---

### 5.3 Colaboradores

**Situação:** é o domínio que ainda guarda maior risco estrutural.

#### Problemas

- resquícios de `/employees`
- fluxo de edição muito concentrado na tela
- possível divergência de payload de usuário
- bug de campo no update

#### Direção correta

- manter `collaborator-management.service.ts` como base oficial
- limpar legado inválido
- separar payloads e DTOs com clareza

---

### 5.4 Usuário e sessão de perfil

**Situação:** boa.

O conjunto:

- `user.service.ts`
- `session-profile.service.ts`
- `AuthContext.tsx`

está coerente com a estratégia do projeto.

#### Ajustes necessários

- remover duplicações locais de sessão
- manter o contexto como única fonte da verdade

---

### 5.5 Documentos

**Situação:** bom alinhamento.

#### Ajustes necessários

- apenas robustez adicional e testes mais fortes

---

### 5.6 Avisos e dashboard

**Situação:** funcional, mas ainda não totalmente padronizada no consumo de estado.

#### Ajustes necessários

- considerar migração para `react-query`
- reduzir lógica manual de carregamento
- centralizar melhor tratamento de sessão expirada

---

### 5.7 Registros, férias e abonos

**Situação:** contrato principal está correto.

#### Ajustes necessários

- unificar estratégia de hooks
- padronizar paginação e carregamento
- remover filtros e parâmetros não oficiais

---

### 5.8 Fiscal

**Situação:** bem próximo do ideal.

#### Ajustes necessários

- alinhar exatamente os parâmetros aceitos
- reforçar testes de download e nomes de arquivo

---

## 6. Priorização recomendada

### P0 — correção imediata

1. remover qualquer uso de `/employees`
2. remover `EMPLOYEES` de `api-routes.ts`
3. corrigir rota `/solicitar-Abono`
4. corrigir bug do campo `pis`
5. validar payload real de update de usuário (`enabled` vs `active`)
6. remover leitura manual de token em `Sidebar.tsx`
7. remover leitura manual de token em `RelatorioDetalhado.tsx`

### P1 — alta prioridade

1. revisar domínio de empresa e geolocalização
2. consolidar carregamento de gestores em um único fluxo
3. migrar hooks manuais críticos para `react-query`
4. alinhar `fiscal.service.ts` estritamente ao contrato
5. limpar imports, resíduos e duplicações do `App.tsx` e páginas grandes

### P2 — consolidação arquitetural

1. quebrar páginas monolíticas
2. reduzir lógica de negócio na UI
3. uniformizar DTOs e mapeadores
4. ampliar cobertura de testes por domínio

---

## 7. Recomendações finais

### 7.1 Decisão arquitetural recomendada

Manter como padrão oficial:

- `api.ts`
- `axios`
- `interceptors`
- `AuthContext`
- `response normalizers`
- `service-error helper`

Essa base já está correta e deve ser preservada.

### 7.2 O que deve ser eliminado

- qualquer referência a `/employees`
- leitura manual de token em componente
- lógica de negócio de geocodificação espalhada na UI
- duplicações de carregamento e filtragem que já têm service oficial

### 7.3 Estado real do projeto

O front-end não está em estado crítico de reescrita.

Ele já possui uma fundação adequada.

O momento atual é de:

- limpeza técnica
- correção pontual de integração
- simplificação arquitetural
- endurecimento de testes

---

## 8. Critérios de aceite para considerar a limpeza concluída

O esforço desta fase pode ser considerado concluído quando:

1. nenhum service ativo usa `/employees`
2. nenhuma tela decodifica token manualmente
3. `Sidebar` e demais rotas navegam sem divergência de path
4. payloads de colaborador e usuário estão alinhados ao DTO real do back-end
5. domínio de empresa deixa de depender de regra de negócio sensível no browser
6. hooks críticos usam padrão consistente de carregamento/mutação
7. páginas grandes têm responsabilidades melhor separadas
8. testes mínimos cobrem autenticação, colaboradores, documentos e records

---

## 9. Resumo final

A branch `v4/fase4/limpeza` já resolveu boa parte dos problemas estruturais históricos do front-end.

A arquitetura central está correta.

Os problemas restantes são objetivos, localizados e corrigíveis sem reescrever a aplicação.

O caminho recomendado é:

1. limpar contrato antigo residual
2. centralizar totalmente a sessão no `AuthContext`
3. remover lógica sensível do cliente
4. padronizar hooks e carregamento
5. reforçar testes

Esse é o melhor caminho para manter o front alinhado ao back-end e, ao mesmo tempo, elevar o nível de manutenção e previsibilidade do projeto.
