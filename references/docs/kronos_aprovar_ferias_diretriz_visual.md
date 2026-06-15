# Kronos — Diretriz visual de negócio para `/ferias`

## 1. Objetivo da tela

A rota `/ferias` deve ser tratada como uma **mesa de aprovação gerencial de férias**, não como uma simples listagem de pedidos.

A experiência precisa permitir que o gestor:

- veja solicitações pendentes, aprovadas e rejeitadas;
- filtre por colaborador e status;
- entenda o período solicitado;
- visualize quantos registros/dias serão afetados;
- aprove ou rejeite em lote;
- perceba que a decisão é sensível e auditável;
- reduza erro operacional antes da decisão.

A tela deve transmitir controle, responsabilidade gerencial, conformidade trabalhista e rastreabilidade.

---

## 2. Contexto funcional da rota

A rota `/ferias` representa a gestão das solicitações criadas em `/solicitar-ferias`.

O fluxo de negócio é:

1. colaborador cria solicitação de férias;
2. o sistema cria registros diários com status de solicitação;
3. gestor acessa `/ferias`;
4. gestor filtra por status, colaborador e página;
5. gestor aprova ou rejeita o lote de registros;
6. aprovação converte os registros para férias;
7. rejeição converte os registros para férias rejeitadas.

---

## 3. Conceito visual da nova tela

### Nome conceitual

**Vacation Approval Command Desk**

A tela deve parecer uma central de decisão, com lista de solicitações, detalhe do pedido selecionado e botões de decisão separados.

### Mensagem visual

> “O gestor toma uma decisão formal sobre o período de descanso de um colaborador, com clareza de impacto e status.”

### Sensação desejada

- controle;
- segurança;
- análise;
- responsabilidade;
- precisão;
- rastreabilidade;
- conformidade;
- rapidez operacional.

---

## 4. Diferença real entre desktop e mobile

## 4.1 Desktop

No desktop, a experiência deve favorecer comparação e análise simultânea.

A tela desktop deve usar:

- painel com métricas superiores;
- tabela/lista de solicitações;
- filtros horizontais;
- detalhe lateral da solicitação selecionada;
- cards de impacto;
- bloco de regra sensível;
- botões separados de aprovar e rejeitar.

### Estrutura desktop

| Área | Função |
|---|---|
| Sidebar | Navegação principal. |
| Header | Contexto da rota e sessão. |
| Hero | Explica a função gerencial da tela. |
| Métricas | Pendentes, aprovadas, rejeitadas e em análise. |
| Filtros | Nome, status e limpeza de busca. |
| Inbox | Lista/tabela de solicitações. |
| Detalhe lateral | Solicitação selecionada e impacto. |
| Ações | Aprovar lote ou rejeitar lote. |

### Experiência desktop proposta

O desktop deve funcionar como uma **mesa de aprovação**. O gestor deve analisar lista e detalhe no mesmo fluxo visual.

---

## 4.2 Mobile

No mobile, a experiência deve funcionar como um **inbox de decisões**.

A tela mobile deve usar:

- topo compacto;
- métricas curtas;
- busca simples;
- chips de status;
- cards de solicitações;
- seleção de um pedido;
- painel fixo inferior com decisão;
- botões grandes de aprovar/rejeitar.

### Estrutura mobile

| Área | Função |
|---|---|
| Topo | Identifica a fila gerencial. |
| Métricas | Pendentes, aprovadas e rejeitadas. |
| Busca | Localiza colaborador rapidamente. |
| Chips | Alterna status. |
| Cards | Mostram colaborador, período e dias. |
| Painel inferior | Resume solicitação selecionada. |
| CTA | Aprovar ou rejeitar. |

### Experiência mobile proposta

O mobile não deve replicar a tabela. Deve priorizar leitura rápida, seleção de pedido e ação confirmada.

---

## 5. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Sidebar, topo mobile e fundos institucionais. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Gradientes escuros. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Hover, textos de marca e contexto seguro. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | Foco, seleção ativa e navegação. |
| Ciano técnico | `#22D3EE` | `rgb(34, 211, 238)` | Realce tecnológico e item ativo da navegação. |
| Verde sucesso | `#16A34A` | `rgb(22, 163, 74)` | Aprovação e férias efetivadas. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo de status aprovado. |
| Amarelo pendência | `#F59E0B` | `rgb(245, 158, 11)` | Solicitação aguardando aprovação. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo de solicitação pendente. |
| Vermelho decisão negativa | `#DC2626` | `rgb(220, 38, 38)` | Rejeição, ação negativa e erro. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo de status rejeitado. |
| Roxo administrativo | `#7C3AED` | `rgb(124, 58, 237)` | Métricas e informações administrativas. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo de apoio administrativo. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Fundo principal. |
| Fundo secundário | `#F1F5F9` | `rgb(241, 245, 249)` | Cabeçalho de lista, filtros e áreas neutras. |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Cards, tabela e painéis. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Contornos leves. |
| Borda forte | `#CBD5E1` | `rgb(203, 213, 225)` | Inputs, divisórias e estados destacados. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Títulos e dados críticos. |
| Texto secundário | `#64748B` | `rgb(100, 116, 139)` | Descrições e metadados. |
| Texto terciário | `#94A3B8` | `rgb(148, 163, 184)` | Labels auxiliares e placeholders. |

---

## 6. Hierarquia visual

### Prioridade 1

- status da solicitação;
- nome do colaborador;
- período solicitado;
- botões de aprovar/rejeitar;
- quantidade de dias/registros afetados.

### Prioridade 2

- filtro por status;
- busca por colaborador;
- métricas de pendência;
- detalhe do lote.

### Prioridade 3

- paginação;
- instruções de uso;
- observações administrativas;
- textos auxiliares.

---

## 7. Estados visuais obrigatórios

| Estado | Como deve aparecer |
|---|---|
| Pendente | Selo amarelo `Aguardando aprovação`. |
| Aprovado | Selo verde `Aprovado`. |
| Rejeitado | Selo vermelho `Rejeitado`. |
| Carregando | Skeleton ou overlay discreto. |
| Mutação em andamento | Bloqueio localizado na lista/detalhe. |
| Sem solicitações | Estado vazio com explicação do filtro. |
| Filtro ativo | Chip destacado e botão de limpar. |
| Solicitação selecionada | Linha/card com borda azul. |
| Rejeição | Ação vermelha com confirmação. |
| Aprovação | Ação verde com confirmação. |

---

## 8. Conteúdo textual recomendado

### Título desktop

**Aprovação de férias com contexto operacional**

### Título mobile

**Inbox de decisões**

### Subtítulo

**Analise solicitações por status, período e impacto na equipe antes de aprovar ou rejeitar em lote.**

### Busca

**Buscar colaborador**

### Status pendente

**Aguardando aprovação**

### CTA positivo

**Aprovar lote**

ou, no mobile:

**Aprovar férias**

### CTA negativo

**Rejeitar lote**

ou, no mobile:

**Rejeitar**

### Mensagem de segurança

**Aprovação e rejeição são ações gerenciais sensíveis. Exibir confirmação antes de aplicar lote.**

---

## 9. Componentes de negócio

### 9.1 Métricas superiores

Devem mostrar:

- solicitações pendentes;
- solicitações aprovadas;
- solicitações rejeitadas;
- solicitações em análise, se existir esse estado na experiência.

### 9.2 Inbox de solicitações

Deve mostrar:

- colaborador;
- período;
- dias;
- status;
- ações rápidas.

### 9.3 Painel de detalhe

Deve mostrar:

- colaborador;
- período inicial e final;
- quantidade de dias corridos;
- quantidade estimada de dias úteis;
- quantidade de registros afetados;
- status atual;
- efeito da aprovação;
- efeito da rejeição.

### 9.4 Confirmação de ação

Antes de aprovar ou rejeitar:

- mostrar nome do colaborador;
- mostrar período;
- mostrar total de registros;
- pedir confirmação explícita.

---

## 10. Regras de UX

1. Aprovar e rejeitar devem ter botões visualmente separados.
2. Rejeitar não deve ficar próximo demais de aprovar sem confirmação.
3. Status pendente deve ser amarelo, não verde.
4. Aprovação final deve ser verde.
5. Rejeição deve ser vermelha.
6. A lista deve manter o contexto da solicitação selecionada.
7. O usuário deve entender que a ação afeta um lote de registros.
8. O mobile deve evitar tabela.
9. O desktop deve priorizar comparação e detalhe lado a lado.
10. Estados finalizados não devem exibir CTA de aprovação/rejeição.

---

## 11. Acessibilidade

- Botões de aprovar/rejeitar precisam de texto visível.
- A decisão não pode depender apenas da cor.
- Chips de status devem ter texto explícito.
- Cards mobile devem ter área mínima de toque de 44px.
- Confirmações destrutivas devem ser acessíveis por teclado.
- Loading deve ser anunciado quando bloquear ação.
- Contraste precisa ser validado em tema claro e escuro.

---

## 12. Resultado esperado

A tela deve transmitir que o Kronos permite:

- controlar férias com aprovação gerencial;
- proteger decisões sensíveis;
- organizar pendências por status;
- decidir com contexto;
- manter rastreabilidade;
- reduzir erros de aprovação;
- preservar coerência com a jornada e o ponto eletrônico.
