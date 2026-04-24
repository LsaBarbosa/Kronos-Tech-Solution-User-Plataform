# Análise de Melhorias Priorizadas do Repositório

## Projeto analisado
- **Front-end:** `Kronos-Tech-Solution-User-Plataform`
- **Branch atual:** estado de trabalho local
- **Objetivo:** consolidar as melhorias ainda necessárias no projeto, classificadas por prioridade, com foco em arquitetura, performance e boas práticas

## Escopo

Este documento parte do estado atual do código e considera como base as refatorações já executadas em etapas anteriores. O foco aqui é o que ainda pode ser melhorado para elevar a qualidade do projeto, reduzir risco técnico e melhorar a experiência de manutenção.

## Critério de prioridade

- **P0:** risco de produção, segurança, integridade de contrato ou dívida técnica que mascara erros reais
- **P1:** arquitetura e manutenção de alto impacto
- **P2:** performance, consistência e redução de custo operacional
- **P3:** boas práticas, governança e refinamentos de longo prazo

## O que já está em boa condição

- autenticação centralizada com `AuthContext`
- proteção de sessão com `ProtectedRoute`
- client HTTP centralizado em `api.ts`
- roteamento e metadata de rotas já consolidados
- services principais já separados por domínio
- base de testes já existente com `Vitest`, `Testing Library` e `MSW`

---

## P0 — Correções críticas

### P0.1 Tornar o TypeScript mais rígido

**Problema:** `tsconfig.json` ainda está permissivo demais, com `noImplicitAny: false`, `strictNullChecks: false`, `allowJs: true` e checagens de unused desabilitadas.

**Impacto:** isso mascara bugs, permite `any` se espalhar e reduz a confiança nas garantias do compilador.

**Arquivos relacionados:** `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`

**Recomendação:** migrar para modo mais estrito de forma progressiva, começando por `noImplicitAny` e `strictNullChecks`, com remoção controlada de `allowJs` e limpeza de código morto.

### P0.2 Remover dependência de geocodificação externa do front

**Problema:** `src/service/company.service.ts` ainda chama ViaCEP e HERE API diretamente do navegador, com chave configurada via ambiente do front.

**Impacto:** expõe integração externa no cliente, aumenta latência, piora testabilidade e cria dependência de segredo no browser.

**Arquivos relacionados:** `src/service/company.service.ts`, `src/hooks/useCreateCompany.ts`, `src/hooks/useUpdateCompanyForm.ts`

**Recomendação:** mover geocodificação para backend ou BFF. Se isso ainda não for possível, encapsular o fluxo em um único service e isolar a chave de terceiros ao máximo.

### P0.3 Eliminar `any` e casts inseguros em código de produção

**Problema:** ainda existem `any` e casts frágeis em serviços e hooks críticos.

**Impacto:** aumenta risco de regressão silenciosa, quebra as garantias de tipagem e dificulta manutenção.

**Arquivos relacionados:** `src/hooks/useDashboardData.ts`, `src/hooks/usePendingApproval.ts`, `src/hooks/useVacationApprovals.ts`, `src/hooks/useManualRegister.ts`, `src/hooks/useDocumentUpload.ts`, `src/service/message.service.ts`, `src/service/records.service.ts`, `src/pages/RelatorioDetalhado.tsx`, `src/pages/StatusRegistro.tsx`, `src/types/dashboard.ts`

**Recomendação:** trocar `any` por DTOs explícitos, criar normalizadores tipados e reduzir casts ao mínimo necessário.

### P0.4 Reduzir o bundle inicial e adotar lazy loading em rotas pesadas

**Problema:** o build ainda gera chunk principal muito grande e não há uso relevante de `React.lazy` / `Suspense` nas rotas.

**Impacto:** maior tempo de carregamento, pior TTI e mais peso no primeiro acesso.

**Arquivos relacionados:** `src/App.tsx`, páginas de relatório, documentos, férias, dashboard e módulos de exportação

**Recomendação:** dividir rotas pesadas com importação preguiçosa, carregar componentes de exportação sob demanda e revisar `manualChunks` quando fizer sentido.

### P0.5 Formalizar um contrato único para DTOs críticos

**Problema:** o domínio ainda possui múltiplas representações para conceitos próximos, especialmente em registros, férias e usuários.

**Impacto:** ambiguidade de tipos, duplicação de contratos e risco de consumir shape errado em telas diferentes.

**Arquivos relacionados:** `src/types/recordApproval.ts`, `src/types/vacation.ts`, `src/types/user.ts`, `src/types/company.ts`

**Recomendação:** manter um tipo canônico por conceito, com aliases apenas quando houver real necessidade de compatibilidade.

---

## P1 — Arquitetura e manutenção

### P1.1 Quebrar componentes e hooks monolíticos

**Problema:** há arquivos grandes e com múltiplas responsabilidades.

**Impacto:** aumenta complexidade cognitiva, dificulta teste e torna refatorações futuras mais arriscadas.

**Arquivos mais urgentes:** `src/pages/Dashboard.tsx`, `src/pages/BuscarEmpresa.tsx`, `src/pages/CriarManager.tsx`, `src/components/ResultadosRelatorioDetalhado.tsx`, `src/hooks/useCollaboratorList.ts`

**Recomendação:** separar em camadas menores de `page + hook + components + service`, mantendo a página só como composição.

### P1.2 Consolidar o domínio de férias, abonos e aprovações

**Problema:** há hooks e services paralelos para fluxos próximos, como contagem, aprovação e listagem.

**Impacto:** risco de duplicação de regra, inconsistência de paginação e manutenção mais difícil.

**Arquivos relacionados:** `src/service/records.service.ts`, `src/hooks/useVacationApprovals.ts`, `src/hooks/useTimeOffApprovals.ts`, `src/hooks/useVacationCount.ts`, `src/hooks/useTimeOffCount.ts`

**Recomendação:** definir serviços e tipos canônicos por subdomínio, eliminando lógicas repetidas de contagem e uniformizando paginação.

### P1.3 Padronizar tratamento de erro e feedback

**Problema:** ainda existem diferenças de estilo entre hooks que usam `toast`, `toast.success`, `toast.error` e variações de `useToast`.

**Impacto:** inconsistência visual e de comportamento, além de dificultar a manutenção do padrão.

**Arquivos relacionados:** `src/hooks/use-toast.ts`, `src/components/ui/toaster.tsx`, `src/hooks/*`, `src/pages/*`

**Recomendação:** criar um contrato único de feedback e manter uma camada adaptadora para todos os fluxos de UI.

### P1.4 Centralizar layout de página

**Problema:** várias páginas ainda repetem estrutura de `Header`, `Sidebar`, fundo animado e container principal.

**Impacto:** duplicação de markup, custo de manutenção e dificuldade para uniformizar mudanças visuais.

**Arquivos relacionados:** `src/pages/*.tsx`, `src/components/PageShell.tsx`

**Recomendação:** expandir o uso do `PageShell` como layout oficial das áreas autenticadas.

### P1.5 Normalizar acesso à sessão e ao storage

**Problema:** ainda existem acessos diretos a `localStorage`, `window.location` e `document` em vários pontos do app.

**Impacto:** acoplamento com o ambiente de browser e mais risco de comportamento divergente em testes ou SSR futuro.

**Arquivos relacionados:** `src/config/api.ts`, `src/context/AuthContext.tsx`, `src/hooks/useDashboardData.ts`, `src/hooks/useTheme.tsx`, `src/components/ThemeSelector.tsx`, `src/components/ThemeToggle.tsx`

**Recomendação:** encapsular leitura/escrita de storage e redirects em helpers específicos.

---

## P2 — Performance e escala

### P2.1 Evitar cálculos pesados no render

**Problema:** alguns fluxos ainda filtram, mapeiam ou transformam dados em componentes ou hooks sem estratégia clara de memoização.

**Impacto:** custo extra de render, principalmente em listas grandes e dashboards.

**Arquivos relacionados:** `src/hooks/useCompanySearch.ts`, `src/hooks/useCollaboratorList.ts`, `src/pages/Dashboard.tsx`, `src/components/ResultadosRelatorioDetalhado.tsx`

**Recomendação:** revisar `useMemo` e derivação de estado somente onde houver custo real medido.

### P2.2 Melhorar o tratamento de listas grandes

**Problema:** colaborador, documentos, relatórios e aprovações podem crescer bastante.

**Impacto:** a UI pode ficar lenta em datasets maiores.

**Arquivos relacionados:** `src/pages/Documentos.tsx`, `src/pages/ListaColaboradores.tsx`, `src/pages/PendingApprovals.tsx`, `src/pages/VacationApprovals.tsx`, `src/components/ResultadosRelatorioDetalhado.tsx`

**Recomendação:** considerar paginação real, virtualização e carregamento incremental quando o volume aumentar.

### P2.3 Adiar bibliotecas pesadas para quando forem necessárias

**Problema:** bibliotecas de exportação e renderização de relatório são custosas.

**Impacto:** parte do peso está sendo paga mesmo quando o usuário não usa exportação.

**Arquivos relacionados:** `src/components/ResultadosRelatorioDetalhado.tsx`, `src/pages/RelatorioDetalhado.tsx`, `src/pages/RequestManualRegistration.tsx`

**Recomendação:** importar dinamicamente dependências como PDF/canvas/export quando o usuário acionar a ação.

### P2.4 Reduzir reprocessamento de relatórios e exportações

**Problema:** geração de CSV/PDF e preparação de tabelas ainda é feita no thread principal.

**Impacto:** travamentos perceptíveis em relatórios maiores.

**Arquivos relacionados:** `src/pages/RelatorioDetalhado.tsx`, `src/components/ResultadosRelatorioDetalhado.tsx`

**Recomendação:** isolar geração de arquivos, avaliar web worker ou pelo menos execução sob demanda com loading claro.

---

## P3 — Boas práticas, qualidade e governança

### P3.1 Reforçar regras de lint e tipo

**Problema:** o repositório ainda tolera muita flexibilidade do TypeScript e regras de lint pouco restritivas.

**Impacto:** regressões passam mais facilmente e o código acumula dívida técnica.

**Arquivos relacionados:** `eslint.config.js`, `tsconfig.json`

**Recomendação:** elevar gradualmente a rigidez do lint e do TypeScript com baseline de erros aceitáveis.

### P3.2 Aumentar cobertura de testes nas áreas mais dinâmicas

**Problema:** a base de testes é boa, mas nem todos os fluxos mais complexos estão protegidos com o mesmo nível de cobertura.

**Impacto:** mudanças em dashboard, relatórios e integrações podem quebrar sem alerta.

**Arquivos relacionados:** `src/hooks/useDashboardData.ts`, `src/pages/Dashboard.tsx`, `src/pages/RelatorioDetalhado.tsx`, `src/service/message.service.ts`, `src/service/fiscal.service.ts`

**Recomendação:** priorizar testes de integração em fluxos com regras de negócio e exports.

### P3.3 Melhorar acessibilidade e consistência de UI

**Problema:** componentes customizados e telas densas precisam de revisão de navegação por teclado, labels e feedback acessível.

**Impacto:** UX pior para usuários de leitor de tela ou navegação não-mouse.

**Arquivos relacionados:** `src/components/*`, `src/pages/*`

**Recomendação:** revisar `aria-label`, foco, contraste, navegação por teclado e estados de loading.

### P3.4 Revisar dependências e limpeza de projeto

**Problema:** o projeto carrega dependências pesadas e algumas podem deixar de ser necessárias conforme a refatoração avança.

**Impacto:** manutenção do `package.json` mais difícil e bundle potencialmente maior.

**Arquivos relacionados:** `package.json`

**Recomendação:** reavaliar dependências que não estão mais sendo usadas de fato e atualizar o ambiente de browserslist periodicamente.

---

## Ordem recomendada de execução

1. endurecer TypeScript e remover `any` de produção
2. mover geocodificação externa para fora do browser
3. reduzir bundle inicial com lazy loading
4. consolidar DTOs e contratos centrais
5. quebrar páginas e hooks monolíticos
6. unificar domínio de férias, abonos e aprovações
7. padronizar feedback, storage e layout
8. melhorar paginação, virtualização e exportação assíncrona
9. aumentar cobertura de testes e acessibilidade
10. limpar dependências e melhorar governança de lint

## Conclusão

O repositório já está em um patamar funcional bem superior ao estado inicial, mas ainda há melhorias relevantes para elevar a base ao nível de manutenção sustentável.

As prioridades mais importantes hoje são:

- fechar a flexibilidade excessiva de tipagem;
- remover dependências externas críticas do navegador;
- reduzir o custo do carregamento inicial;
- eliminar monólitos de UI e hooks;
- consolidar contratos e padrões de erro.

Esse conjunto de ações melhora simultaneamente:

- segurança;
- robustez;
- performance;
- previsibilidade;
- legibilidade;
- capacidade de evolução.
