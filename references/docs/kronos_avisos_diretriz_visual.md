# Kronos — Diretriz visual de negócio para `/avisos`

## 1. Objetivo da tela

A rota `/avisos` deve ser tratada como uma **central de comunicação interna**, não apenas como uma lista de mensagens.

A experiência precisa permitir:

- visualizar avisos recebidos;
- distinguir prioridade `NORMAL`, `ALERT` e `CRITICAL`;
- entender se o aviso é direcionado ou visível apenas para o remetente;
- abrir detalhe da mensagem;
- navegar por páginas;
- criar novo aviso quando a ROLE permitir;
- deletar aviso quando a ROLE permitir;
- preservar clareza sobre ações sensíveis.

---

## 2. Comportamento por ROLE

### CTO

O `CTO` deve ter visão administrativa.

Pode:

- visualizar mensagens;
- criar novos avisos;
- deletar avisos;
- acompanhar prioridades;
- entender alcance do comunicado.

Mensagem visual:

> “Comunicação institucional e administrativa com controle total.”

### MANAGER

O `MANAGER` deve ter visão gerencial.

Pode:

- visualizar mensagens;
- criar novos avisos;
- deletar avisos;
- direcionar comunicação para colaboradores ativos;
- acompanhar alertas críticos.

Mensagem visual:

> “Comunicação operacional para orientar a equipe.”

### PARTNER

O `PARTNER` deve ter experiência de leitura.

Pode:

- visualizar avisos recebidos;
- abrir detalhes;
- navegar por páginas.

Não deve:

- criar aviso;
- deletar aviso;
- acessar ações administrativas.

Mensagem visual:

> “Canal de leitura de comunicados importantes.”

---

## 3. Conceito visual da nova tela

### Nome conceitual

**Internal Notice Center**

A tela deve parecer um mural corporativo moderno, com prioridades claras e leitura rápida.

### Sensação desejada

- comunicação clara;
- urgência quando necessário;
- segurança;
- organização;
- hierarquia de prioridade;
- rastreabilidade de mensagem;
- foco na leitura.

---

## 4. Diferença real entre desktop e mobile

## 4.1 Desktop

No desktop, a tela deve permitir leitura e análise simultânea.

A experiência desktop deve usar:

- lista ampla de avisos à esquerda;
- detalhe do aviso selecionado à direita;
- filtros por prioridade;
- busca por título/conteúdo;
- métricas superiores;
- ações administrativas visíveis apenas para `CTO` e `MANAGER`.

### Estrutura desktop

| Área | Função |
|---|---|
| Sidebar | Navegação principal. |
| Header | Contexto da rota e ROLE atual. |
| Hero | Explica a central de comunicação. |
| Métricas | Total de avisos, alertas, críticos e direcionados. |
| Busca | Localiza aviso por título ou conteúdo. |
| Filtros | Todos, Normal, Alerta e Crítico. |
| Lista | Avisos com prioridade, destinatário, data e ações. |
| Detalhe lateral | Conteúdo do aviso selecionado. |
| Ações | Novo aviso e deletar aviso conforme ROLE. |

## 4.2 Mobile

No mobile, a tela deve priorizar leitura rápida.

A experiência mobile deve usar:

- topo compacto;
- estatísticas resumidas;
- busca;
- chips de prioridade;
- cards de aviso;
- rodapé com permissão atual;
- abertura de detalhe em tela/modal.

### Estrutura mobile

| Área | Função |
|---|---|
| Topo | Identifica o mural de avisos. |
| Métricas | Total, alertas e críticos. |
| Busca | Busca simples por aviso. |
| Chips | Filtra por prioridade. |
| Cards | Um aviso por card. |
| Rodapé | Explica permissão da ROLE atual. |

---

## 5. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Sidebar, topo mobile e fundo institucional. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Gradientes escuros. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Texto institucional e hover. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | Seleção, CTA e foco. |
| Ciano técnico | `#22D3EE` | `rgb(34, 211, 238)` | Realce de navegação. |
| Verde sucesso | `#16A34A` | `rgb(22, 163, 74)` | Confirmação de publicação ou operação bem-sucedida. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo positivo. |
| Amarelo alerta | `#F59E0B` | `rgb(245, 158, 11)` | Aviso `ALERT`. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo de alerta. |
| Vermelho crítico | `#DC2626` | `rgb(220, 38, 38)` | Aviso `CRITICAL`, erro e exclusão. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo de crítico. |
| Roxo administrativo | `#7C3AED` | `rgb(124, 58, 237)` | Permissão `CTO`. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo de permissão `CTO`. |
| Teal leitura | `#0D9488` | `rgb(13, 148, 136)` | Permissão `PARTNER` / somente leitura. |
| Teal suave | `#CCFBF1` | `rgb(204, 251, 241)` | Fundo de leitura. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Fundo principal. |
| Fundo secundário | `#F1F5F9` | `rgb(241, 245, 249)` | Busca, filtros e blocos neutros. |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Cards e painéis. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Contornos. |
| Borda forte | `#CBD5E1` | `rgb(203, 213, 225)` | Divisórias e estados ativos. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Títulos e mensagem principal. |
| Texto secundário | `#64748B` | `rgb(100, 116, 139)` | Descrições e metadados. |
| Texto terciário | `#94A3B8` | `rgb(148, 163, 184)` | Placeholders e labels auxiliares. |

---

## 6. Hierarquia visual

### Prioridade 1

- prioridade do aviso;
- título;
- conteúdo resumido;
- detalhe do aviso;
- ação `Novo Aviso` para CTO/MANAGER.

### Prioridade 2

- destinatário;
- data;
- paginação;
- exclusão.

### Prioridade 3

- métricas;
- permissões;
- estado vazio;
- textos auxiliares.

---

## 7. Estados visuais obrigatórios

| Estado | Como deve aparecer |
|---|---|
| Carregando | Loading central ou skeleton de cards. |
| Erro | Card vermelho com mensagem de falha. |
| Sem avisos | Estado vazio com texto “Tudo tranquilo por aqui”. |
| NORMAL | Selo neutro. |
| ALERT | Selo amarelo. |
| CRITICAL | Selo vermelho. |
| Mensagem direcionada | Chip “Mensagem Direcionada”. |
| Sem destinatário | Chip “Visível Apenas para o Remetente”. |
| PARTNER | Rodapé/card informando somente leitura. |
| CTO/MANAGER | CTA “Novo aviso” visível. |
| Exclusão | Confirmação destrutiva antes de deletar. |

---

## 8. Conteúdo textual recomendado

### Título desktop

**Comunicação interna com prioridade e destinatário**

### Título mobile

**Mural de avisos**

### Subtítulo

**Veja avisos recebidos, acompanhe alertas críticos e publique comunicados quando sua ROLE permitir.**

### Busca

**Buscar por título ou conteúdo**

### CTA administrativo

**Novo aviso**

### Ação destrutiva

**Deletar aviso**

### Estado vazio

**Tudo tranquilo por aqui**

### Texto PARTNER

**Você visualiza avisos recebidos. Criação e exclusão ficam para CTO/MANAGER.**

---

## 9. Componentes de negócio

### 9.1 Lista de avisos

Deve mostrar:

- prioridade;
- título;
- resumo;
- indicador de destinatário;
- data;
- ação de ver detalhe;
- ação de deletar quando permitido.

### 9.2 Detalhe do aviso

Deve mostrar:

- título;
- prioridade;
- destinatário;
- data;
- texto completo;
- ações permitidas pela ROLE.

### 9.3 Criação de aviso

Na rota `/avisos`, o CTA deve levar ao fluxo de criação quando `CTO` ou `MANAGER`.

A criação deve estar ausente para `PARTNER`.

### 9.4 Exclusão

A exclusão deve:

- estar ausente para `PARTNER`;
- ser visível para `CTO` e `MANAGER`;
- exigir confirmação;
- explicar que a ação remove o aviso para os usuários afetados.

---

## 10. Regras de UX

1. `PARTNER` não deve ver botão de criar aviso.
2. `PARTNER` não deve ver botão de deletar aviso.
3. `MANAGER` e `CTO` devem ver `Novo aviso`.
4. `MANAGER` e `CTO` devem conseguir deletar com confirmação.
5. Prioridade crítica deve ter destaque visual forte.
6. O detalhe deve abrir sem perder contexto no desktop.
7. No mobile, o detalhe deve abrir como tela/modal.
8. Paginação precisa continuar clara.
9. Avisos devem ser lidos como comunicação, não como tarefa operacional.
10. Exclusão precisa ser tratada como ação sensível.

---

## 11. Acessibilidade

- Prioridade deve ser textual, não apenas cor.
- Botões de ação precisam de rótulo acessível.
- Cards devem ter foco visível.
- A exclusão deve ser confirmável por teclado.
- Contraste deve ser validado para amarelo e vermelho.
- O mobile deve manter área mínima de toque de 44px.
- Estado vazio deve ser compreensível por leitor de tela.

---

## 12. Resultado esperado

A tela deve transmitir que o Kronos permite:

- comunicação interna organizada;
- controle de prioridade;
- segmentação de destinatários;
- leitura simples para colaboradores;
- publicação gerencial;
- exclusão controlada;
- consistência entre segurança, gestão e experiência.
