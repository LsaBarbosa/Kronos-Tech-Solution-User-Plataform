# Backlog Técnico — Refatoração do Front-end Kronos

## Projeto
- **Front-end:** `Kronos-Tech-Solution-User-Plataform`
- **Branch:** `v4/fase4/limpeza`
- **Back-end de referência:** `Kronos-Tech-Solutions-KTS`
- **Branch do back-end:** `main`

---

## Objetivo do backlog

Organizar as tarefas na ordem mais segura de execução, priorizando:

1. correção de quebra real de contrato
2. redução de risco de regressão
3. consolidação da arquitetura já existente
4. melhoria de manutenção e testabilidade

---

# Fase 1 — Correções imediatas de contrato e navegação

## 1.1 Remover endpoints legados em `/employees`

### Arquivos
- `src/service/collaborator-management.service.ts`
- `src/config/api-routes.ts`

### O que fazer
- remover métodos baseados em `/employees`
- remover a constante `EMPLOYEES`
- garantir uso exclusivo de `/employee`

### Resultado esperado
- nenhum service ativo depende de endpoint legado inválido

### Critério de aceite
- busca no projeto não encontra `/employees` em serviços ativos

---

## 1.2 Corrigir a rota de solicitação de abono no menu

### Arquivo
- `src/components/Sidebar.tsx`

### O que fazer
- corrigir `"/solicitar-Abono"` para `"/solicitar-abono"`

### Resultado esperado
- navegação do menu funciona corretamente

### Critério de aceite
- clique no menu abre a tela correta sem 404

---

## 1.3 Corrigir bug de payload do campo PIS

### Arquivo
- `src/pages/ListaColaboradores.tsx`

### O que fazer
- corrigir o mapeamento que hoje aponta o campo `pis` para `cpf`
- revisar o bloco inteiro de montagem de payload do colaborador

### Resultado esperado
- cada campo editável vai para o campo correto do payload

### Critério de aceite
- edição de PIS não altera CPF

---

## 1.4 Validar o contrato real de update de usuário

### Arquivos
- `src/pages/ListaColaboradores.tsx`
- `src/service/collaborator-management.service.ts`

### O que fazer
- confirmar se o DTO do backend espera `enabled` ou `active`
- ajustar o front para o nome correto
- remover qualquer ambiguidade

### Resultado esperado
- update de usuário alinhado ao DTO real

### Critério de aceite
- edição e toggle de status funcionam com payload correto

---

# Fase 2 — Centralização definitiva de sessão

## 2.1 Remover decodificação manual de token do menu lateral

### Arquivo
- `src/components/Sidebar.tsx`

### O que fazer
- remover `decodeToken()` local
- usar apenas `useAuth()` para obter role e sessão

### Resultado esperado
- `Sidebar` não depende de leitura direta de JWT

### Critério de aceite
- menu renderiza permissões corretamente usando apenas contexto

---

## 2.2 Remover decodificação manual de token do relatório detalhado

### Arquivo
- `src/pages/RelatorioDetalhado.tsx`

### O que fazer
- parar de ler token do `localStorage`
- usar `useAuth()` para obter role, employeeId e dados necessários

### Resultado esperado
- a tela depende da sessão centralizada

### Critério de aceite
- a lógica de parceiro/gestor continua funcionando sem decode local

---

## 2.3 Revisar todo o projeto em busca de sessão espalhada

### O que fazer
- localizar outros componentes que leem token diretamente
- migrar todos para `useAuth()`

### Resultado esperado
- `AuthContext` vira a única fonte da verdade da sessão

### Critério de aceite
- nenhuma tela ativa usa leitura manual de token

---

# Fase 3 — Consolidação do domínio de colaboradores

## 3.1 Revisar e limpar `collaborator-management.service.ts`

### O que fazer
- manter apenas endpoints oficiais do backend
- remover métodos mortos ou conflitantes
- revisar nomes, payloads e retornos

### Resultado esperado
- service único, previsível e alinhado ao contrato

### Critério de aceite
- domínio de colaborador usa somente rotas válidas

---

## 3.2 Refatorar a tela `CriarColaborador.tsx`

### O que fazer
- extrair lógica de formulário para hook próprio
- separar passo 1 e passo 2 com responsabilidades claras
- isolar máscaras e transformação de payload

### Resultado esperado
- componente mais testável e mais simples

### Critério de aceite
- cadastro continua funcionando e o componente fica mais enxuto

---

## 3.3 Refatorar a tela `ListaColaboradores.tsx`

### O que fazer
- separar lógica de carregamento, edição e mutação
- isolar helpers de transformação
- reduzir tamanho do componente

### Resultado esperado
- manutenção mais simples da tela de listagem/edição

### Critério de aceite
- lista, edição e ativação/inativação continuam funcionando

---

# Fase 4 — Padronização de hooks e carregamento de dados

## 4.1 Padronizar domínio de avisos

### Arquivos
- `src/hooks/useMessages.ts`
- `src/service/message.service.ts`

### O que fazer
- migrar carregamento e deleção para `react-query`
- padronizar loading, error e refresh

### Resultado esperado
- comportamento consistente com outros domínios

### Critério de aceite
- listagem e exclusão continuam funcionando com invalidação previsível

---

## 4.2 Padronizar domínio de abonos manuais

### Arquivos
- `src/hooks/useTimeOffApprovals.ts`
- `src/service/records.service.ts`

### O que fazer
- migrar `useTimeOffApprovals.ts` para `react-query`
- manter paginação e mutações em padrão único

### Resultado esperado
- abonos seguem o mesmo padrão técnico das aprovações de ponto e férias

### Critério de aceite
- listagem, aprovação e rejeição funcionam com invalidação de query

---

## 4.3 Consolidar carregamento de gestores em um único fluxo

### Arquivos
- `src/service/records.service.ts`
- `src/hooks/useManualRegister.ts`
- telas que usam gestores

### O que fazer
- escolher um único service oficial para buscar gestores
- remover filtros locais duplicados

### Resultado esperado
- todos os fluxos usam a mesma fonte de gestores

### Critério de aceite
- relatório e solicitação manual carregam gestores da mesma forma

---

# Fase 5 — Domínio de empresa e geolocalização

## 5.1 Revisar o uso de geocodificação no front-end

### Arquivos
- `src/service/company.service.ts`
- `src/hooks/useUpdateCompanyForm.ts`

### O que fazer
- reduzir a lógica de ViaCEP/HERE no cliente
- avaliar mover a geocodificação para o back-end
- no mínimo, isolar essa dependência em camada transitória

### Resultado esperado
- menos regra de negócio sensível no browser

### Critério de aceite
- atualização de empresa continua funcionando com menor acoplamento no cliente

---

## 5.2 Refatorar o fluxo de atualização de empresa

### Arquivos
- `src/hooks/useUpdateCompanyForm.ts`
- `src/pages/AtualizarEmpresa.tsx`

### O que fazer
- simplificar o fluxo
- reduzir gatilhos implícitos de geocodificação
- manter o comportamento previsível

### Resultado esperado
- fluxo mais robusto e com menos efeitos colaterais

### Critério de aceite
- ao alterar endereço, a experiência continua estável e previsível

---

# Fase 6 — Ajustes finos de domínio fiscal

## 6.1 Alinhar `fiscal.service.ts` estritamente ao contrato

### Arquivo
- `src/service/fiscal.service.ts`

### O que fazer
- revisar quais parâmetros são realmente suportados
- remover parâmetros extras não oficiais
- reforçar padronização de nome de arquivo

### Resultado esperado
- service fiscal 100% aderente ao contrato

### Critério de aceite
- todos os downloads funcionam com parâmetros corretos

---

# Fase 7 — Limpeza estrutural do projeto

## 7.1 Limpar `App.tsx` e imports residuais

### Arquivo
- `src/App.tsx`

### O que fazer
- remover imports redundantes
- revisar rotas não utilizadas
- manter organização previsível

### Resultado esperado
- árvore principal do app mais limpa

### Critério de aceite
- `App.tsx` sem imports mortos ou rotas ambíguas

---

## 7.2 Revisar páginas grandes e extrair componentes

### Arquivos prioritários
- `src/pages/CriarColaborador.tsx`
- `src/pages/ListaColaboradores.tsx`
- `src/pages/RelatorioDetalhado.tsx`
- `src/pages/RequestManualRegistration.tsx`

### O que fazer
- quebrar componentes grandes em blocos menores
- separar UI, hook e service
- mover helpers puros para arquivos próprios

### Resultado esperado
- maior clareza, menor acoplamento e melhor testabilidade

### Critério de aceite
- redução de complexidade sem perda de funcionalidade

---

# Fase 8 — Testes e endurecimento técnico

## 8.1 Reforçar testes do núcleo de sessão

### O que testar
- `AuthContext`
- `ProtectedRoute`
- login por senha
- login facial
- sessão inválida

### Critério de aceite
- cobertura mínima do fluxo de autenticação

---

## 8.2 Reforçar testes dos domínios críticos

### Prioridade
1. colaboradores
2. usuário/sessão
3. documentos
4. records
5. fiscal

### Critério de aceite
- cenários principais de leitura, mutação e erro cobertos

---

## 8.3 Criar testes de regressão para rotas e payloads críticos

### O que testar
- cadastro de colaborador
- edição de colaborador
- toggle de usuário
- solicitação de abono
- solicitação de férias
- download de documentos
- download fiscal

### Critério de aceite
- refatorações futuras não quebram fluxos críticos sem alerta imediato

---

# Ordem final recomendada de execução

## Bloco 1 — corrigir quebra real
1. remover `/employees`
2. remover `EMPLOYEES`
3. corrigir `/solicitar-Abono`
4. corrigir bug de `pis`
5. validar `enabled` vs `active`

## Bloco 2 — consolidar sessão
6. remover decode de token da `Sidebar`
7. remover decode de token do `RelatorioDetalhado`
8. revisar o restante do projeto para sessão espalhada

## Bloco 3 — consolidar colaboradores
9. limpar `collaborator-management.service.ts`
10. refatorar `CriarColaborador.tsx`
11. refatorar `ListaColaboradores.tsx`

## Bloco 4 — padronizar carregamento de dados
12. migrar `useMessages.ts` para padrão uniforme
13. migrar `useTimeOffApprovals.ts` para `react-query`
14. unificar carregamento de gestores

## Bloco 5 — tratar empresa/geolocalização
15. revisar `company.service.ts`
16. refatorar `useUpdateCompanyForm.ts`

## Bloco 6 — ajustes finais de domínio
17. alinhar `fiscal.service.ts`
18. limpar `App.tsx`
19. quebrar páginas grandes em componentes menores

## Bloco 7 — endurecimento
20. reforçar testes de autenticação
21. reforçar testes de colaboradores
22. reforçar testes de documentos
23. reforçar testes de records
24. reforçar testes de fiscal

---

# Definição de pronto

Este backlog pode ser considerado concluído quando:

- não existir mais contrato legado ativo no front
- a sessão estiver 100% centralizada no contexto
- colaboradores e usuários estiverem alinhados ao DTO real do backend
- a navegação estiver sem divergência de rota
- geolocalização estiver menos acoplada ao navegador
- hooks críticos estiverem padronizados
- os fluxos principais estiverem cobertos por testes mínimos

