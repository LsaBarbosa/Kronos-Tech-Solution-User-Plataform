# Backlog — Refatoração Visual Front-end KRONOS

## 1. Visão geral

Este backlog descreve uma refatoração visual completa do front-end da aplicação KRONOS, com foco em UX, UI, Design System, consistência visual, responsividade e aparência de produto SaaS pronto para produção.

A aplicação KRONOS é uma plataforma de gestão de jornada e conformidade trabalhista, cobrindo autenticação, empresas, colaboradores, usuários, comunicação interna, documentos, registro eletrônico de ponto, férias, abonos, relatórios e documentos legais como AFD, AEJ e espelho de ponto. :contentReference[oaicite:0]{index=0}

A refatoração deve respeitar integralmente os contratos funcionais existentes com o back-end. O escopo visual descrito aqui deriva do objetivo informado para a branch `PROD_HOSTINGER`: modernizar layout, dashboard, cards, menus, sidebar, header, formulários, tabelas, modais, feedbacks, responsividade, acessibilidade visual e tema claro/escuro sem alterar endpoints, payloads, DTOs, models, roles ou fluxos de negócio. :contentReference[oaicite:1]{index=1}

> Observação técnica: os arquivos citados neste backlog devem ser tratados como **arquivos prováveis / a validar no repositório**, porque este documento foi gerado a partir da documentação e do prompt fornecido, não da leitura direta da branch `PROD_HOSTINGER`.

---

## 2. Objetivo da refatoração

Transformar a interface atual do KRONOS em uma experiência visual de nível SaaS moderno, com:

- layout mais limpo;
- hierarquia visual mais clara;
- padronização de componentes;
- tema claro e escuro consistente;
- navegação mais profissional;
- dashboards mais informativos;
- formulários mais legíveis;
- tabelas mais utilizáveis;
- feedbacks visuais mais claros;
- responsividade real para desktop, tablet e mobile;
- acessibilidade visual mínima aceitável para produção;
- menor duplicidade de estilos;
- melhor separação entre lógica e apresentação.

A refatoração deve melhorar a percepção de confiabilidade do produto sem alterar regras de negócio, contratos com API ou permissões.

---

## 3. Restrições técnicas

### 3.1 O que não pode ser alterado

Não alterar:

- endpoints;
- payloads enviados;
- payloads recebidos;
- DTOs;
- models;
- nomes de propriedades;
- autenticação;
- autorização;
- roles;
- permissões;
- regras de negócio;
- validações de negócio;
- contratos de integração;
- comportamento funcional dependente do back-end.

### 3.2 Escopo permitido

Pode alterar:

- estrutura visual;
- CSS;
- tokens visuais;
- componentes de apresentação;
- layout das páginas;
- composição visual;
- estados visuais;
- responsividade;
- acessibilidade visual;
- microinterações;
- organização de componentes reutilizáveis;
- padronização de classes;
- padronização de estilos.

### 3.3 Regra central

Toda alteração deve ser visual ou estrutural no front-end.  
Qualquer comportamento funcional existente deve permanecer compatível com o back-end.

---

## 4. Diagnóstico da interface atual

### 4.1 Diagnóstico visual provável

Com base no estado descrito do front-end e nos pedidos recentes de ajustes visuais, a interface apresenta sinais de:

- baixa padronização entre telas;
- dashboard parcialmente desalinhada com o tema claro/escuro;
- cards com aparência simples;
- navegação ainda com aparência de protótipo;
- provável mistura entre estilos globais e estilos locais;
- componentes visuais pouco reutilizáveis;
- necessidade de padronização de espaçamentos;
- necessidade de melhoria na hierarquia tipográfica;
- uso inconsistente de sombras, bordas, cores e backgrounds;
- estados de loading, vazio e erro possivelmente pouco padronizados;
- formulários e tabelas com baixa consistência visual;
- tema claro/escuro ainda não aplicado de forma uniforme em toda a aplicação.

### 4.2 Diagnóstico técnico visual provável

O plano anterior do front-end aponta que o projeto possui estrutura React com elementos como `api.ts`, `axios`, interceptors, helpers de normalização e `AuthContext`, mas também coexistem padrões legados, como `fetch` manual e tratamentos próprios de erro. :contentReference[oaicite:2]{index=2}

Mesmo que este backlog seja visual, essa informação é relevante porque a refatoração deve preservar a arquitetura funcional e evitar inserir lógica visual diretamente dentro de services, hooks ou fluxos de API.

### 4.3 Telas com maior prioridade visual

Priorizar:

1. Dashboard;
2. Login;
3. Layout autenticado;
4. Sidebar;
5. Header;
6. Listagem de colaboradores;
7. Listagem de registros de ponto;
8. Aprovações pendentes;
9. Solicitações de férias e abonos;
10. Documentos;
11. Formulários de cadastro e edição;
12. Modais de confirmação;
13. Telas de erro, vazio e loading.

---

## 5. Direção visual proposta

### 5.1 Estilo visual

Adotar um estilo SaaS corporativo moderno:

- visual limpo;
- uso de cards com profundidade sutil;
- cores sóbrias;
- contraste adequado;
- cantos arredondados moderados;
- ícones consistentes;
- menos poluição visual;
- maior uso de espaços em branco;
- foco em produtividade e clareza.

### 5.2 Paleta proposta

#### Tema claro

- `background`: `#F8FAFC`
- `surface`: `#FFFFFF`
- `surface-muted`: `#F1F5F9`
- `border`: `#E2E8F0`
- `text-primary`: `#0F172A`
- `text-secondary`: `#475569`
- `text-muted`: `#94A3B8`
- `primary`: `#2563EB`
- `primary-hover`: `#1D4ED8`
- `success`: `#16A34A`
- `warning`: `#F59E0B`
- `danger`: `#DC2626`
- `info`: `#0284C7`

#### Tema escuro

- `background`: `#020617`
- `surface`: `#0F172A`
- `surface-muted`: `#1E293B`
- `border`: `#334155`
- `text-primary`: `#F8FAFC`
- `text-secondary`: `#CBD5E1`
- `text-muted`: `#64748B`
- `primary`: `#3B82F6`
- `primary-hover`: `#60A5FA`
- `success`: `#22C55E`
- `warning`: `#FBBF24`
- `danger`: `#F87171`
- `info`: `#38BDF8`

### 5.3 Tipografia

Usar uma fonte moderna e legível, como:

- `Inter`;
- `Roboto`;
- `Noto Sans`;
- ou fonte já adotada no projeto, desde que padronizada.

Escala sugerida:

- `text-xs`: 12px;
- `text-sm`: 14px;
- `text-base`: 16px;
- `text-lg`: 18px;
- `text-xl`: 20px;
- `text-2xl`: 24px;
- `text-3xl`: 30px.

### 5.4 Padrão visual geral

- Sidebar fixa em desktop.
- Header limpo com título da página, ações rápidas e alternador de tema.
- Conteúdo central com largura fluida e padding consistente.
- Cards com borda sutil e sombra leve.
- Botões com hierarquia clara: primário, secundário, ghost, danger.
- Inputs com label, hint, erro e estado disabled padronizados.
- Tabelas com cabeçalho fixo visualmente forte, linhas espaçadas e ações claras.
- Modais com título objetivo, corpo limpo e ações separadas.
- Feedbacks com mensagens curtas e status visual claro.

---

## 6. Design System proposto

### 6.1 Tokens visuais

Criar ou consolidar tokens para:

- cores;
- tipografia;
- espaçamentos;
- raios de borda;
- sombras;
- z-index;
- transições;
- breakpoints.

Arquivos prováveis:

- `src/styles/tokens.css`;
- `src/styles/theme.css`;
- `src/styles/global.css`;
- `src/styles/index.css`;
- `src/theme/theme.ts`;
- `src/theme/tokens.ts`.

### 6.2 Espaçamentos

Escala sugerida:

- `4px`;
- `8px`;
- `12px`;
- `16px`;
- `20px`;
- `24px`;
- `32px`;
- `40px`;
- `48px`;
- `64px`.

### 6.3 Border radius

- `sm`: 6px;
- `md`: 10px;
- `lg`: 14px;
- `xl`: 18px;
- `full`: 999px.

### 6.4 Sombras

- `shadow-sm`: cards simples;
- `shadow-md`: dropdowns e menus;
- `shadow-lg`: modais;
- evitar sombras fortes em excesso.

### 6.5 Componentes base sugeridos

Criar ou padronizar:

- `Button`;
- `Input`;
- `Select`;
- `Textarea`;
- `Checkbox`;
- `Switch`;
- `Card`;
- `PageHeader`;
- `PageContainer`;
- `DataTable`;
- `Badge`;
- `StatusPill`;
- `Modal`;
- `Alert`;
- `Toast`;
- `EmptyState`;
- `LoadingState`;
- `Skeleton`;
- `Tabs`;
- `DropdownMenu`;
- `ThemeToggle`.

---

## 7. Épicos

---

# Épico 1 — Estrutura visual base da aplicação

## História 1.1 — Criar tokens globais de design

- **Prioridade:** Alta
- **Objetivo:** Centralizar cores, espaçamentos, tipografia, bordas, sombras e transições.
- **Problema atual:** A aplicação tende a ter estilos dispersos, dificultando manutenção e consistência visual.
- **Solução proposta:** Criar camada global de tokens e substituir valores fixos por variáveis reutilizáveis.
- **Arquivos prováveis impactados:**
  - `src/styles/global.css`
  - `src/styles/theme.css`
  - `src/styles/tokens.css`
  - `src/index.css`
  - `src/App.css`
- **Critérios de aceite:**
  - todas as cores principais estão em tokens;
  - tema claro e escuro usam os mesmos nomes de variáveis;
  - não há uso recorrente de hexadecimais espalhados em componentes;
  - espaçamentos seguem escala padronizada.
- **Observações técnicas:** Não alterar lógica dos componentes. Apenas substituir estilos por tokens.

## História 1.2 — Criar estrutura visual padrão de página

- **Prioridade:** Alta
- **Objetivo:** Garantir que todas as telas autenticadas tenham estrutura consistente.
- **Problema atual:** Telas internas podem ter margens, larguras e títulos inconsistentes.
- **Solução proposta:** Criar componente `PageContainer` com padding, largura, background e comportamento responsivo padronizados.
- **Arquivos prováveis impactados:**
  - `src/components/layout/PageContainer.tsx`
  - `src/components/layout/PageHeader.tsx`
  - páginas em `src/pages`
- **Critérios de aceite:**
  - toda tela interna usa o mesmo container visual;
  - títulos e subtítulos seguem padrão;
  - ações principais ficam sempre no topo à direita em desktop;
  - em mobile, ações quebram abaixo do título.
- **Observações técnicas:** Não mover chamadas de API; apenas reorganizar composição visual.

## História 1.3 — Padronizar background e superfícies

- **Prioridade:** Alta
- **Objetivo:** Remover aparência de protótipo e criar profundidade visual profissional.
- **Problema atual:** Fundos e cards podem estar sem contraste suficiente ou sem padrão entre telas.
- **Solução proposta:** Aplicar `background`, `surface`, `surface-muted` e `border` de forma consistente.
- **Arquivos prováveis impactados:**
  - `src/styles/theme.css`
  - `src/components/layout/*`
  - `src/pages/*`
- **Critérios de aceite:**
  - tema claro possui fundo suave e cards brancos;
  - tema escuro possui superfícies em camadas;
  - elementos clicáveis não parecem soltos na tela;
  - bordas são sutis e consistentes.
- **Observações técnicas:** Evitar alterar estrutura de dados renderizados.

## História 1.4 — Remover estilos duplicados e conflitantes

- **Prioridade:** Média
- **Objetivo:** Reduzir inconsistência visual e facilitar manutenção.
- **Problema atual:** É provável que componentes tenham CSS local repetindo regras globais.
- **Solução proposta:** Mapear estilos duplicados e consolidar em componentes/tokens.
- **Arquivos prováveis impactados:**
  - `src/components/**/*.css`
  - `src/pages/**/*.css`
  - `src/styles/*`
- **Critérios de aceite:**
  - botões não possuem múltiplas variações visuais sem padrão;
  - inputs seguem o mesmo visual;
  - cards seguem a mesma base;
  - estilos globais não quebram telas existentes.
- **Observações técnicas:** Fazer por etapas para evitar regressões visuais.

---

# Épico 2 — Dashboard

## História 2.1 — Reestruturar layout da dashboard

- **Prioridade:** Alta
- **Objetivo:** Tornar a dashboard a tela de entrada principal do produto, com aparência clara e executiva.
- **Problema atual:** A dashboard não está totalmente aderente à nova feature de tema e pode ter cards desalinhados.
- **Solução proposta:** Criar layout em seções: saudação, indicadores principais, atalhos, pendências e avisos.
- **Arquivos prováveis impactados:**
  - `src/pages/Dashboard.tsx`
  - `src/components/dashboard/*`
  - `src/service/dashboard.service.ts`
- **Critérios de aceite:**
  - dashboard funciona em tema claro e escuro;
  - cards possuem mesma altura visual dentro da mesma linha;
  - títulos têm hierarquia clara;
  - ações principais são fáceis de localizar;
  - não há quebra visual em tablet.
- **Observações técnicas:** Não alterar dados consumidos da API.

## História 2.2 — Padronizar cards de atalho da dashboard

- **Prioridade:** Alta
- **Objetivo:** Transformar atalhos em cards clicáveis modernos.
- **Problema atual:** Cards podem parecer simples, sem hierarquia ou sem affordance de clique.
- **Solução proposta:** Criar card com ícone, título, descrição curta, hover, foco e rota.
- **Arquivos prováveis impactados:**
  - `src/components/dashboard/DashboardCard.tsx`
  - `src/pages/Dashboard.tsx`
  - `src/routes/*`
- **Critérios de aceite:**
  - card possui estado hover;
  - card possui estado focus visível;
  - ícone segue padrão;
  - texto não estoura em telas menores;
  - rotas existentes são preservadas.
- **Observações técnicas:** Respeitar regras de visibilidade por role. Cards específicos de `MANAGER` devem aparecer apenas para usuários autorizados.

## História 2.3 — Ajustar cards gerenciais para role MANAGER

- **Prioridade:** Alta
- **Objetivo:** Garantir que cards administrativos sejam exibidos apenas para gestores.
- **Problema atual:** Mudanças visuais recentes indicam necessidade de cards direcionados para rotas gerenciais.
- **Solução proposta:** Aplicar visual padronizado aos cards de:
  - `/lista-colaboradores`;
  - `/status-do-registro`;
  - `/enviar-documento-colaborador`.
- **Arquivos prováveis impactados:**
  - `src/pages/Dashboard.tsx`
  - `src/components/dashboard/*`
  - `src/context/AuthContext.tsx`
- **Critérios de aceite:**
  - cards aparecem apenas para role `MANAGER`, se essa já for a regra funcional;
  - cards mantêm navegação para as rotas corretas;
  - visual segue tokens de tema;
  - não há alteração na regra de autorização do back-end.
- **Observações técnicas:** Não criar novas permissões; apenas respeitar a role já disponível no front.

## História 2.4 — Criar estados de loading e vazio na dashboard

- **Prioridade:** Média
- **Objetivo:** Melhorar percepção de qualidade durante carregamento ou ausência de dados.
- **Problema atual:** Loading simples ou ausência de feedback reduz confiança do usuário.
- **Solução proposta:** Usar skeletons nos cards e empty states para seções sem dados.
- **Arquivos prováveis impactados:**
  - `src/components/ui/Skeleton.tsx`
  - `src/components/ui/EmptyState.tsx`
  - `src/pages/Dashboard.tsx`
- **Critérios de aceite:**
  - dashboard não fica visualmente quebrada enquanto carrega;
  - ausência de dados exibe mensagem clara;
  - tema claro/escuro é respeitado.
- **Observações técnicas:** Não alterar comportamento de retry ou fetch.

---

# Épico 3 — Sidebar, header e navegação

## História 3.1 — Redesenhar sidebar

- **Prioridade:** Alta
- **Objetivo:** Criar navegação lateral moderna, organizada e legível.
- **Problema atual:** Sidebar pode parecer simples, com hierarquia fraca e estados visuais pouco claros.
- **Solução proposta:** Padronizar menu com grupos, ícones, item ativo, hover, foco e colapso em desktop.
- **Arquivos prováveis impactados:**
  - `src/components/Sidebar.tsx`
  - `src/components/layout/Sidebar.tsx`
  - `src/styles/sidebar.css`
- **Critérios de aceite:**
  - item ativo é facilmente identificado;
  - agrupamentos são claros;
  - sidebar funciona em tema claro e escuro;
  - menus por role permanecem inalterados;
  - sidebar não ocupa espaço excessivo.
- **Observações técnicas:** Não alterar rotas existentes.

## História 3.2 — Redesenhar header

- **Prioridade:** Alta
- **Objetivo:** Melhorar orientação do usuário dentro da aplicação.
- **Problema atual:** Header pode não deixar claro em qual tela o usuário está ou quais ações estão disponíveis.
- **Solução proposta:** Header com título da página, breadcrumb opcional, ação primária e botão de tema.
- **Arquivos prováveis impactados:**
  - `src/components/Header.tsx`
  - `src/components/layout/Header.tsx`
  - `src/components/layout/PageHeader.tsx`
- **Critérios de aceite:**
  - título da tela aparece de forma consistente;
  - ações globais ficam alinhadas;
  - botão de tema fica acessível;
  - logout e perfil mantêm comportamento atual.
- **Observações técnicas:** Evitar duplicar título dentro da página e no header sem necessidade.

## História 3.3 — Substituir menu de tema por botão toggle

- **Prioridade:** Alta
- **Objetivo:** Simplificar alternância entre tema claro e escuro.
- **Problema atual:** Menu de tema é desnecessário quando existem apenas duas opções.
- **Solução proposta:** Criar botão único que alterna entre claro e escuro.
- **Arquivos prováveis impactados:**
  - `src/components/theme/ThemeToggle.tsx`
  - `src/context/ThemeContext.tsx`
  - `src/components/Header.tsx`
- **Critérios de aceite:**
  - clique alterna imediatamente entre claro e escuro;
  - preferência é persistida, se já existir persistência;
  - ícone muda conforme tema atual;
  - não há opção de cor personalizada para o usuário.
- **Observações técnicas:** Usuário pode escolher apenas claro ou escuro.

## História 3.4 — Ajustar navegação mobile

- **Prioridade:** Alta
- **Objetivo:** Tornar o produto usável em celular e tablet.
- **Problema atual:** Sidebar fixa pode prejudicar mobile.
- **Solução proposta:** Em telas menores, sidebar vira drawer acionado por botão no header.
- **Arquivos prováveis impactados:**
  - `src/components/layout/MobileDrawer.tsx`
  - `src/components/Sidebar.tsx`
  - `src/components/Header.tsx`
- **Critérios de aceite:**
  - menu abre e fecha em mobile;
  - clique fora fecha o drawer;
  - tecla `Esc` fecha o drawer;
  - foco não fica preso incorretamente;
  - conteúdo não fica escondido atrás do menu.
- **Observações técnicas:** Garantir acessibilidade mínima do drawer.

---

# Épico 4 — Cards e componentes reutilizáveis

## História 4.1 — Criar componente Card base

- **Prioridade:** Alta
- **Objetivo:** Padronizar todos os cards do sistema.
- **Problema atual:** Cards podem ter paddings, bordas e sombras diferentes.
- **Solução proposta:** Criar `Card`, `CardHeader`, `CardTitle`, `CardContent` e `CardFooter`.
- **Arquivos prováveis impactados:**
  - `src/components/ui/Card.tsx`
  - `src/components/dashboard/*`
  - páginas com cards
- **Critérios de aceite:**
  - todos os cards principais usam o componente base;
  - variações são controladas por props;
  - tema claro/escuro funciona sem CSS específico por tela.
- **Observações técnicas:** Evitar acoplar regra de negócio no card.

## História 4.2 — Criar componente Badge/StatusPill

- **Prioridade:** Alta
- **Objetivo:** Padronizar status visuais de registros, usuários, documentos e solicitações.
- **Problema atual:** Status podem aparecer com cores e textos inconsistentes.
- **Solução proposta:** Criar componente para status com mapa visual controlado.
- **Arquivos prováveis impactados:**
  - `src/components/ui/Badge.tsx`
  - `src/components/ui/StatusPill.tsx`
  - telas de registros, usuários, documentos e aprovações
- **Critérios de aceite:**
  - status ativo/inativo usam cores consistentes;
  - status pendente/aprovado/rejeitado usam padrão único;
  - contraste é adequado nos dois temas;
  - texto é legível.
- **Observações técnicas:** Não alterar enum, string ou status vindo do back-end.

## História 4.3 — Padronizar ícones

- **Prioridade:** Média
- **Objetivo:** Melhorar leitura visual e coerência entre módulos.
- **Problema atual:** Ícones podem estar misturados ou sem padrão de tamanho.
- **Solução proposta:** Definir biblioteca/padrão único de ícones e tamanhos.
- **Arquivos prováveis impactados:**
  - `src/components/icons/*`
  - `src/components/Sidebar.tsx`
  - `src/pages/Dashboard.tsx`
- **Critérios de aceite:**
  - ícones têm tamanho consistente;
  - ícones não quebram alinhamento;
  - cada módulo possui ícone semântico claro.
- **Observações técnicas:** Não adicionar ícones decorativos excessivos.

---

# Épico 5 — Formulários

## História 5.1 — Criar padrão visual de inputs

- **Prioridade:** Alta
- **Objetivo:** Melhorar legibilidade e consistência dos formulários.
- **Problema atual:** Inputs podem variar por tela.
- **Solução proposta:** Criar componentes `Input`, `Select`, `Textarea`, `Checkbox` e `Switch`.
- **Arquivos prováveis impactados:**
  - `src/components/ui/Input.tsx`
  - `src/components/ui/Select.tsx`
  - `src/components/ui/Textarea.tsx`
  - telas de cadastro e edição
- **Critérios de aceite:**
  - label sempre visível;
  - erro aparece abaixo do campo;
  - estado disabled é claro;
  - foco é visível;
  - altura dos campos é consistente.
- **Observações técnicas:** Não alterar nomes de campos enviados à API.

## História 5.2 — Reorganizar formulários longos em seções

- **Prioridade:** Alta
- **Objetivo:** Reduzir carga cognitiva em cadastros complexos.
- **Problema atual:** Formulários de empresa, colaborador e usuário podem ficar extensos e cansativos.
- **Solução proposta:** Dividir em blocos visuais:
  - dados principais;
  - contato;
  - endereço;
  - jornada;
  - permissões;
  - biometria, quando aplicável.
- **Arquivos prováveis impactados:**
  - `src/pages/CriarColaborador.tsx`
  - `src/pages/EditarColaborador.tsx`
  - `src/pages/Empresa*.tsx`
  - `src/pages/Usuario*.tsx`
- **Critérios de aceite:**
  - cada seção tem título claro;
  - campos relacionados ficam agrupados;
  - ações ficam no final ou em área fixa;
  - mobile mantém leitura adequada.
- **Observações técnicas:** Apenas reorganizar UI; manter submissão atual.

## História 5.3 — Padronizar botões de ação em formulários

- **Prioridade:** Alta
- **Objetivo:** Evitar confusão entre salvar, cancelar, excluir e voltar.
- **Problema atual:** Botões podem ter cores e posições inconsistentes.
- **Solução proposta:** Definir padrão:
  - ação primária à direita;
  - ação secundária à esquerda ou antes da primária;
  - ação destrutiva com visual danger.
- **Arquivos prováveis impactados:**
  - `src/components/ui/Button.tsx`
  - formulários em `src/pages/*`
- **Critérios de aceite:**
  - botão primário é sempre evidente;
  - botão danger nunca usa cor primária;
  - estado loading impede duplo clique;
  - estado disabled é visualmente claro.
- **Observações técnicas:** Não alterar validações de negócio.

---

# Épico 6 — Tabelas e listagens

## História 6.1 — Criar DataTable base

- **Prioridade:** Alta
- **Objetivo:** Padronizar listagens críticas.
- **Problema atual:** Tabelas podem variar entre módulos.
- **Solução proposta:** Criar componente `DataTable` com header, body, ações, loading, vazio e paginação visual.
- **Arquivos prováveis impactados:**
  - `src/components/ui/DataTable.tsx`
  - `src/pages/ListaColaboradores.tsx`
  - `src/pages/Usuarios.tsx`
  - `src/pages/Documentos.tsx`
  - `src/pages/Relatorios.tsx`
- **Critérios de aceite:**
  - cabeçalho é legível;
  - linhas têm espaçamento adequado;
  - ações ficam alinhadas;
  - tabela tem estado vazio;
  - tabela é utilizável no tema escuro.
- **Observações técnicas:** Não alterar paginação ou filtros enviados à API.

## História 6.2 — Melhorar ações por linha

- **Prioridade:** Média
- **Objetivo:** Reduzir poluição visual em tabelas.
- **Problema atual:** Muitas ações visíveis por linha podem deixar a tabela confusa.
- **Solução proposta:** Usar grupo de ações, menu contextual ou botões compactos padronizados.
- **Arquivos prováveis impactados:**
  - `src/components/ui/RowActions.tsx`
  - páginas com tabelas
- **Critérios de aceite:**
  - ações principais continuam acessíveis;
  - ações destrutivas exigem confirmação;
  - layout não quebra em telas menores.
- **Observações técnicas:** Não remover ações existentes.

## História 6.3 — Padronizar filtros e busca

- **Prioridade:** Média
- **Objetivo:** Tornar listagens mais fáceis de usar.
- **Problema atual:** Filtros podem estar posicionados ou estilizados de formas diferentes.
- **Solução proposta:** Criar área padrão de filtros acima da tabela.
- **Arquivos prováveis impactados:**
  - `src/components/ui/FilterBar.tsx`
  - listagens em `src/pages/*`
- **Critérios de aceite:**
  - busca fica à esquerda;
  - filtros ficam agrupados;
  - limpar filtros é possível quando aplicável;
  - layout quebra corretamente em mobile.
- **Observações técnicas:** Preservar parâmetros já usados pelo back-end.

---

# Épico 7 — Modais, alertas e feedbacks

## História 7.1 — Criar componente Modal padronizado

- **Prioridade:** Alta
- **Objetivo:** Melhorar consistência de confirmações e fluxos secundários.
- **Problema atual:** Modais podem ter estilos diferentes.
- **Solução proposta:** Criar modal base com título, descrição, conteúdo e footer de ações.
- **Arquivos prováveis impactados:**
  - `src/components/ui/Modal.tsx`
  - telas com confirmação de exclusão, upload e aprovações
- **Critérios de aceite:**
  - modal centralizado;
  - overlay coerente no tema claro/escuro;
  - fechamento por `Esc`;
  - foco inicial no modal;
  - ações destrutivas destacadas.
- **Observações técnicas:** Não alterar fluxo confirmado pelo modal.

## História 7.2 — Padronizar alertas e toasts

- **Prioridade:** Alta
- **Objetivo:** Tornar mensagens de sucesso, erro e aviso consistentes.
- **Problema atual:** Feedbacks podem variar entre páginas.
- **Solução proposta:** Criar componentes `Alert` e `Toast` com variações `success`, `error`, `warning` e `info`.
- **Arquivos prováveis impactados:**
  - `src/components/ui/Alert.tsx`
  - `src/components/ui/Toast.tsx`
  - `src/hooks/useToast.ts`
- **Critérios de aceite:**
  - erros aparecem com visual consistente;
  - sucesso não usa cor de erro;
  - mensagens são legíveis;
  - tema escuro mantém contraste.
- **Observações técnicas:** Não alterar tratamento funcional de erro; apenas apresentação.

## História 7.3 — Criar estados vazios reutilizáveis

- **Prioridade:** Média
- **Objetivo:** Melhorar telas sem dados.
- **Problema atual:** Telas vazias podem parecer quebradas.
- **Solução proposta:** Criar `EmptyState` com ícone, título, descrição e ação opcional.
- **Arquivos prováveis impactados:**
  - `src/components/ui/EmptyState.tsx`
  - dashboard, documentos, mensagens, relatórios, aprovações
- **Critérios de aceite:**
  - toda listagem crítica possui estado vazio;
  - mensagem explica o que aconteceu;
  - ação opcional é clara;
  - componente funciona nos dois temas.
- **Observações técnicas:** Não simular dados inexistentes.

---

# Épico 8 — Tema claro e escuro

## História 8.1 — Consolidar ThemeProvider

- **Prioridade:** Alta
- **Objetivo:** Garantir aplicação uniforme do tema.
- **Problema atual:** A dashboard não está totalmente aderente à feature de tema.
- **Solução proposta:** Consolidar provider de tema e aplicar variáveis CSS no elemento raiz.
- **Arquivos prováveis impactados:**
  - `src/context/ThemeContext.tsx`
  - `src/theme/*`
  - `src/styles/theme.css`
  - `src/App.tsx`
- **Critérios de aceite:**
  - tema muda em toda aplicação;
  - dashboard respeita o tema;
  - sidebar respeita o tema;
  - modais respeitam o tema;
  - tabelas respeitam o tema.
- **Observações técnicas:** Não oferecer seleção de cores ao usuário.

## História 8.2 — Remover opções de cor customizada

- **Prioridade:** Alta
- **Objetivo:** Simplificar experiência e manter identidade visual controlada.
- **Problema atual:** Opções de cores para usuário criariam variações difíceis de manter.
- **Solução proposta:** Manter apenas claro/escuro.
- **Arquivos prováveis impactados:**
  - `src/components/theme/*`
  - `src/context/ThemeContext.tsx`
  - `src/components/Header.tsx`
- **Critérios de aceite:**
  - usuário só alterna claro/escuro;
  - não há menu de paleta;
  - tokens continuam controlados pelo projeto.
- **Observações técnicas:** Se existir código de paleta, remover da UI ou descontinuar com segurança.

## História 8.3 — Auditar contraste dos dois temas

- **Prioridade:** Média
- **Objetivo:** Evitar baixa legibilidade.
- **Problema atual:** Tema escuro costuma apresentar contraste ruim em bordas, textos secundários e inputs.
- **Solução proposta:** Revisar contraste de textos, bordas, badges, botões e estados.
- **Arquivos prováveis impactados:**
  - `src/styles/theme.css`
  - `src/components/ui/*`
- **Critérios de aceite:**
  - texto primário é legível;
  - texto secundário não fica apagado;
  - botões têm contraste suficiente;
  - badges são legíveis em ambos os temas.
- **Observações técnicas:** Usar inspeção visual e, se possível, ferramenta de contraste.

---

# Épico 9 — Responsividade

## História 9.1 — Definir breakpoints oficiais

- **Prioridade:** Alta
- **Objetivo:** Padronizar comportamento responsivo.
- **Problema atual:** Telas podem quebrar de forma diferente.
- **Solução proposta:** Definir breakpoints:
  - mobile: até 640px;
  - tablet: 641px a 1024px;
  - desktop: acima de 1024px.
- **Arquivos prováveis impactados:**
  - `src/styles/tokens.css`
  - `src/styles/responsive.css`
  - componentes de layout
- **Critérios de aceite:**
  - layout usa breakpoints consistentes;
  - dashboard se adapta;
  - tabelas não estouram viewport;
  - formulários quebram em uma coluna no mobile.
- **Observações técnicas:** Não criar layouts separados por tela sem necessidade.

## História 9.2 — Ajustar formulários para mobile

- **Prioridade:** Alta
- **Objetivo:** Garantir uso em telas pequenas.
- **Problema atual:** Formulários com múltiplas colunas podem ficar ilegíveis.
- **Solução proposta:** Em mobile, todo formulário deve virar uma coluna.
- **Arquivos prováveis impactados:**
  - formulários em `src/pages/*`
  - componentes `Input`, `Select`, `FormSection`
- **Critérios de aceite:**
  - campos ocupam largura total;
  - labels não quebram de forma ruim;
  - botões ficam acessíveis;
  - não há scroll horizontal.
- **Observações técnicas:** Preservar ordem lógica dos campos.

## História 9.3 — Ajustar tabelas para telas menores

- **Prioridade:** Média
- **Objetivo:** Evitar tabelas inutilizáveis em mobile.
- **Problema atual:** Tabelas largas tendem a estourar a tela.
- **Solução proposta:** Usar scroll horizontal controlado ou transformar linhas em cards no mobile para listagens críticas.
- **Arquivos prováveis impactados:**
  - `src/components/ui/DataTable.tsx`
  - listagens em `src/pages/*`
- **Critérios de aceite:**
  - não há overflow global;
  - cabeçalho permanece compreensível;
  - ações continuam acessíveis;
  - leitura em mobile é possível.
- **Observações técnicas:** Para MVP, scroll horizontal controlado pode ser suficiente.

---

# Épico 10 — Acessibilidade visual

## História 10.1 — Padronizar foco visível

- **Prioridade:** Alta
- **Objetivo:** Permitir navegação por teclado.
- **Problema atual:** Foco pode ser invisível ou inconsistente.
- **Solução proposta:** Criar estilo global de focus ring para botões, links, inputs e menus.
- **Arquivos prováveis impactados:**
  - `src/styles/accessibility.css`
  - `src/components/ui/*`
- **Critérios de aceite:**
  - foco é visível em todos os elementos interativos;
  - foco funciona em tema claro e escuro;
  - foco não depende apenas de mudança sutil de cor.
- **Observações técnicas:** Não remover outline sem substituto acessível.

## História 10.2 — Melhorar contraste e legibilidade

- **Prioridade:** Alta
- **Objetivo:** Garantir leitura confortável.
- **Problema atual:** Textos secundários, placeholders e labels podem ter contraste baixo.
- **Solução proposta:** Ajustar tokens de texto e backgrounds.
- **Arquivos prováveis impactados:**
  - `src/styles/theme.css`
  - `src/components/ui/*`
- **Critérios de aceite:**
  - labels são legíveis;
  - placeholders não competem com texto preenchido;
  - mensagens de erro são claras;
  - botões disabled continuam identificáveis.
- **Observações técnicas:** Não usar cor como único indicador de erro.

## História 10.3 — Padronizar tamanho de áreas clicáveis

- **Prioridade:** Média
- **Objetivo:** Melhorar usabilidade em touch.
- **Problema atual:** Ícones pequenos podem ser difíceis de clicar.
- **Solução proposta:** Garantir área mínima aproximada de 40px para botões e ações.
- **Arquivos prováveis impactados:**
  - `src/components/ui/Button.tsx`
  - `src/components/ui/IconButton.tsx`
  - `src/components/Sidebar.tsx`
- **Critérios de aceite:**
  - botões pequenos ainda têm área clicável adequada;
  - ações em tabela são acessíveis;
  - mobile não exige precisão excessiva.
- **Observações técnicas:** Ícone pode ser pequeno, mas área clicável não.

---

# Épico 11 — Padronização final e polish visual

## História 11.1 — Revisar consistência visual entre telas

- **Prioridade:** Alta
- **Objetivo:** Garantir que o produto pareça uma aplicação única, não um conjunto de telas isoladas.
- **Problema atual:** Telas podem ter estilos distintos.
- **Solução proposta:** Fazer auditoria visual por módulo e ajustar discrepâncias.
- **Arquivos prováveis impactados:**
  - `src/pages/*`
  - `src/components/*`
  - `src/styles/*`
- **Critérios de aceite:**
  - títulos seguem padrão;
  - cards seguem padrão;
  - botões seguem padrão;
  - tabelas seguem padrão;
  - formulários seguem padrão.
- **Observações técnicas:** Fazer checklist por tela.

## História 11.2 — Adicionar microinterações discretas

- **Prioridade:** Baixa
- **Objetivo:** Aumentar sensação de produto polido.
- **Problema atual:** Interface pode parecer estática.
- **Solução proposta:** Adicionar transições curtas em hover, foco, abertura de modal e sidebar.
- **Arquivos prováveis impactados:**
  - `src/styles/tokens.css`
  - `src/components/ui/*`
- **Critérios de aceite:**
  - transições são rápidas;
  - não há animações exageradas;
  - interface continua performática;
  - respeita `prefers-reduced-motion`.
- **Observações técnicas:** Não animar layout pesado sem necessidade.

## História 11.3 — Criar checklist visual de release

- **Prioridade:** Média
- **Objetivo:** Evitar regressões visuais antes de produção.
- **Problema atual:** Sem checklist, inconsistências passam despercebidas.
- **Solução proposta:** Criar checklist manual para validar telas principais.
- **Arquivos prováveis impactados:**
  - `docs/CHECKLIST_VISUAL_FRONTEND.md`
- **Critérios de aceite:**
  - checklist cobre desktop, tablet e mobile;
  - checklist cobre tema claro e escuro;
  - checklist cobre loading, vazio e erro;
  - checklist cobre principais roles.
- **Observações técnicas:** Documento simples, direto e reutilizável.

---

## 8. Ordem recomendada de implementação

1. Criar tokens visuais globais.
2. Consolidar tema claro/escuro.
3. Substituir menu de tema por botão toggle.
4. Padronizar layout base autenticado.
5. Redesenhar sidebar.
6. Redesenhar header.
7. Criar componentes UI base.
8. Refatorar dashboard.
9. Ajustar cards gerenciais por role.
10. Padronizar formulários.
11. Padronizar tabelas.
12. Padronizar modais e feedbacks.
13. Ajustar responsividade.
14. Revisar acessibilidade visual.
15. Fazer polish visual final.
16. Criar checklist visual de release.

---

## 9. Checklist final de qualidade visual

### Layout

- [ ] Todas as telas usam container padrão.
- [ ] Não há margens improvisadas.
- [ ] Header e sidebar estão alinhados.
- [ ] Conteúdo não encosta nas bordas.
- [ ] Desktop, tablet e mobile foram verificados.

### Tema

- [ ] Tema claro funciona em todas as telas.
- [ ] Tema escuro funciona em todas as telas.
- [ ] Dashboard respeita o tema.
- [ ] Modais respeitam o tema.
- [ ] Tabelas respeitam o tema.
- [ ] Não existe opção de cor customizada para usuário.

### Componentes

- [ ] Botões seguem padrão único.
- [ ] Inputs seguem padrão único.
- [ ] Cards seguem padrão único.
- [ ] Badges seguem padrão único.
- [ ] Modais seguem padrão único.
- [ ] Feedbacks seguem padrão único.

### UX

- [ ] Usuário entende onde está.
- [ ] Ação principal é evidente.
- [ ] Estados vazios são claros.
- [ ] Erros são compreensíveis.
- [ ] Loading não parece travamento.
- [ ] Ações destrutivas exigem confirmação.

### Acessibilidade visual

- [ ] Foco visível em elementos interativos.
- [ ] Contraste adequado.
- [ ] Áreas clicáveis suficientes.
- [ ] Informação crítica não depende apenas de cor.
- [ ] Tema escuro não prejudica leitura.

---

## 10. Riscos e cuidados

### 10.1 Risco de alterar comportamento funcional

- **Risco:** Ao mexer em componentes, alterar props, handlers ou payloads sem perceber.
- **Cuidado:** Separar refatoração visual de alteração funcional. Não mexer em services sem necessidade.

### 10.2 Risco de quebrar regras por role

- **Risco:** Exibir cards, menus ou ações para usuários sem permissão.
- **Cuidado:** Preservar verificações existentes de role e autorização.

### 10.3 Risco de inconsistência no tema escuro

- **Risco:** Algumas telas continuarem com cores hardcoded.
- **Cuidado:** Buscar valores fixos de cor e substituir por tokens.

### 10.4 Risco de regressão em mobile

- **Risco:** Layout bonito em desktop, mas inutilizável em celular.
- **Cuidado:** Validar cada módulo em largura pequena.

### 10.5 Risco de criar Design System complexo demais

- **Risco:** Criar abstrações excessivas e atrasar entrega.
- **Cuidado:** Começar por componentes realmente reutilizados.

---

## 11. Critérios finais para considerar a refatoração concluída

A refatoração visual pode ser considerada concluída quando:

1. toda aplicação estiver aderente ao tema claro e escuro;
2. dashboard estiver visualmente consistente com o restante do sistema;
3. não existir menu de cor customizada;
4. alternância de tema for feita por botão único;
5. sidebar e header tiverem aparência profissional;
6. cards forem padronizados;
7. formulários seguirem padrão único;
8. tabelas seguirem padrão único;
9. modais, alertas e toasts forem consistentes;
10. telas principais tiverem loading, vazio e erro;
11. a interface funcionar em desktop, tablet e mobile;
12. elementos interativos tiverem foco visível;
13. textos tiverem contraste adequado;
14. regras de role forem preservadas;
15. nenhum contrato com o back-end tiver sido alterado;
16. o visual final parecer um produto SaaS real, confiável e pronto para produção.
