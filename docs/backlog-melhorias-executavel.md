# Backlog Executável de Melhorias do Repositório

## Projeto
- **Front-end:** `Kronos-Tech-Solution-User-Plataform`
- **Base:** análise consolidada do estado atual do repositório

## Objetivo

Transformar o diagnóstico técnico em uma ordem de execução prática, com tarefas priorizadas por risco, impacto e dependência.

## Regras de execução

- Não introduzir regressão em fluxos já validados.
- Manter `AuthContext`, `ProtectedRoute`, `api.ts`, `records.service.ts` e `document.service.ts` como base.
- Evitar `any`, casts inseguros e `fetch` direto em páginas.
- Preferir `page + hook + service` para fluxos com lógica de negócio.

---

## Fase 0 - Blindagem do projeto

### 0.1 Endurecer TypeScript progressivamente

**Objetivo:** reduzir risco de bugs mascarados pela configuração permissiva.

**Ações:**
- habilitar `noImplicitAny` de forma gradual;
- revisar `strictNullChecks`;
- reduzir dependência de `allowJs`;
- limpar usos reais de `any` antes de endurecer as regras.

**Aceite:**
- o projeto compila com menos permissividade;
- o número de pontos não tipados diminui a cada etapa.

### 0.2 Consolidar tipos canônicos por domínio

**Objetivo:** eliminar ambiguidades em `user`, `company`, `records` e `vacation`.

**Ações:**
- manter um tipo oficial por contrato;
- remover duplicações desnecessárias;
- separar request, response e status quando houver semântica diferente.

**Aceite:**
- não existem tipos concorrentes para o mesmo conceito.

### 0.3 Aumentar cobertura de testes nas áreas críticas

**Objetivo:** garantir que refatorações futuras tenham rede de proteção.

**Ações:**
- reforçar testes de dashboard;
- reforçar testes de relatórios;
- reforçar testes de serviços com maior regra de negócio.

**Aceite:**
- fluxos críticos possuem teste de contrato.

---

## Fase 1 - Contrato e arquitetura crítica

### 1.1 Remover geocodificação externa do browser

**Objetivo:** tirar ViaCEP/HERE da execução direta no front.

**Ações:**
- mover geocodificação para backend ou BFF;
- se isso não for possível de imediato, manter o fluxo encapsulado em um único service;
- evitar `fetch` em páginas ou componentes.

**Dependências:**
- nenhum fluxo deve chamar geocoding direto na UI.

**Aceite:**
- o navegador não resolve endereço por integração externa.

### 1.2 Eliminar `any` e casts inseguros em produção

**Objetivo:** reduzir fragilidade estrutural.

**Ações:**
- substituir `any` por DTOs explícitos;
- remover `as any` e `as unknown as` de produção;
- criar normalizadores tipados onde necessário.

**Aceite:**
- os fluxos principais não dependem de casts para funcionar.

### 1.3 Reduzir bundle inicial e carregar rotas pesadas sob demanda

**Objetivo:** melhorar tempo de carregamento e TTI.

**Ações:**
- aplicar `React.lazy` + `Suspense` em rotas pesadas;
- adiar importação de módulos grandes de relatório/exportação;
- avaliar `manualChunks` apenas se necessário.

**Aceite:**
- o carregamento inicial diminui de forma mensurável.

---

## Fase 2 - Simplificação dos fluxos mais pesados

### 2.1 Quebrar o dashboard e relatórios em partes menores

**Objetivo:** reduzir monólitos de UI e lógica.

**Ações:**
- dividir `Dashboard.tsx`;
- dividir `ResultadosRelatorioDetalhado.tsx`;
- isolar cálculos, filtros e exportações em hooks/utilitários.

**Aceite:**
- os arquivos deixam de concentrar responsabilidades excessivas.

### 2.2 Quebrar hooks grandes em responsabilidades menores

**Objetivo:** tornar manutenção e testes mais previsíveis.

**Ações:**
- revisar `useCollaboratorList`;
- revisar `useUpdateCompanyForm`;
- revisar `useCreateManager`;
- revisar `useCompanySearch`.

**Aceite:**
- cada hook passa a fazer uma coisa clara e testável.

### 2.3 Unificar o domínio de férias, abonos e aprovações

**Objetivo:** evitar duplicação de regra e inconsistência de paginação.

**Ações:**
- consolidar `records.service.ts` como service oficial do domínio;
- revisar `useVacationApprovals`, `useTimeOffApprovals`, `useVacationCount`, `useTimeOffCount`;
- padronizar paginação e respostas.

**Aceite:**
- o domínio trabalha com contratos coerentes e previsíveis.

---

## Fase 3 - Padrões globais

### 3.1 Padronizar feedback e tratamento de erro

**Objetivo:** unificar a experiência visual e técnica.

**Ações:**
- manter um contrato único de toast/feedback;
- usar o mesmo padrão de erro em hooks e services;
- evitar mensagens divergentes para a mesma falha.

**Aceite:**
- erros e sucessos seguem o mesmo padrão em toda a aplicação.

### 3.2 Centralizar layout autenticado

**Objetivo:** reduzir repetição de estrutura de página.

**Ações:**
- expandir o uso de `PageShell`;
- concentrar `Header`, `Sidebar` e estrutura de container no layout;
- evitar repetição de fundo e wrapper nas páginas.

**Aceite:**
- telas autenticadas compartilham base visual comum.

### 3.3 Normalizar acesso à sessão e ao storage

**Objetivo:** reduzir acoplamento ao browser.

**Ações:**
- encapsular `localStorage` em helpers;
- minimizar uso direto de `window.location` e `document`;
- manter `AuthContext` como fonte central da sessão.

**Aceite:**
- a sessão não é lida de forma dispersa.

---

## Fase 4 - Performance e escala

### 4.1 Melhorar listas grandes e paginação

**Objetivo:** deixar a UI mais estável com volume maior de dados.

**Ações:**
- considerar paginação real em documentos, colaboradores e aprovações;
- avaliar virtualização para listas densas;
- evitar renderização desnecessária de grandes tabelas.

**Aceite:**
- a experiência não degrada fortemente com volume de dados maior.

### 4.2 Adiar bibliotecas pesadas até o uso

**Objetivo:** pagar custo só quando o usuário realmente usa a função.

**Ações:**
- importar dinamicamente módulos de PDF/CSV/canvas quando acionados;
- evitar bundling inicial de dependências de exportação.

**Aceite:**
- funcionalidades raras deixam de pesar no primeiro carregamento.

### 4.3 Reduzir reprocessamento em relatórios

**Objetivo:** evitar travamentos em operações maiores.

**Ações:**
- isolar geração de arquivo;
- considerar web worker para exportações grandes;
- revisar pontos de cálculo em render.

**Aceite:**
- relatórios grandes deixam a UI mais responsiva.

---

## Fase 5 - Qualidade de longo prazo

### 5.1 Reforçar lint e governança técnica

**Objetivo:** impedir regressão de padrão.

**Ações:**
- endurecer regras do ESLint gradualmente;
- criar baseline para o que ainda é exceção;
- eliminar permissões amplas sem necessidade.

**Aceite:**
- novos desvios ficam mais difíceis de entrar.

### 5.2 Ampliar testes de contrato

**Objetivo:** proteger fluxos críticos.

**Ações:**
- aumentar cobertura de dashboard;
- reforçar contratos de report/export;
- cobrir mais mutações de services críticos.

**Aceite:**
- mudanças em contratos relevantes têm cobertura adequada.

### 5.3 Revisar acessibilidade e consistência de UI

**Objetivo:** melhorar usabilidade e inclusão.

**Ações:**
- revisar `aria-label`;
- revisar foco e teclado;
- revisar contraste e estado de loading.

**Aceite:**
- componentes críticos são navegáveis e compreensíveis sem mouse.

### 5.4 Reavaliar dependências

**Objetivo:** simplificar manutenção do projeto.

**Ações:**
- revisar dependências não utilizadas;
- atualizar browserslist periodicamente;
- reduzir pacotes redundantes quando possível.

**Aceite:**
- `package.json` fica mais limpo e previsível.

---

## Ordem recomendada de implementação

1. endurecer TypeScript e remover `any` de produção
2. mover geocodificação externa para fora do browser
3. reduzir bundle inicial com lazy loading
4. consolidar tipos canônicos por domínio
5. quebrar páginas e hooks monolíticos
6. unificar domínio de férias, abonos e aprovações
7. padronizar feedback, erro e layout
8. melhorar listas grandes e exportações pesadas
9. expandir testes de contrato
10. elevar lint, acessibilidade e governança

## Saída esperada do backlog

Ao final dessa sequência, o repositório deve apresentar:

- tipagem mais rígida e confiável;
- menos acoplamento com browser e integrações externas;
- telas mais enxutas e previsíveis;
- melhor performance no carregamento inicial;
- contratos de domínio mais estáveis;
- base mais forte de manutenção e evolução.
