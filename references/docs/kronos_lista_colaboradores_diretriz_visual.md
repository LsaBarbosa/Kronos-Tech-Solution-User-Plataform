# Kronos — Diretriz visual de negócio para `/lista-colaboradores`

## 1. Objetivo da tela

A rota `/lista-colaboradores` deve ser tratada como uma **central de pessoas e contas de acesso**, não apenas como uma listagem cadastral.

A tela precisa permitir que o gestor:

- visualize colaboradores do próprio tenant;
- filtre por nome, usuário, cargo e status;
- diferencie colaboradores ativos e inativos;
- identifique rapidamente perfil de acesso;
- veja jornada, escala e local de trabalho;
- identifique pendência ou presença de biometria;
- execute ações sensíveis com confirmação;
- acesse detalhes sem perder o contexto da lista.

A experiência deve transmitir gestão, controle, segurança e rastreabilidade.

---

## 2. Contexto funcional da rota

A rota `/lista-colaboradores` pertence ao módulo administrativo de colaboradores e usuários.

No comportamento atual, a tela combina dados de:

- colaborador;
- conta de usuário;
- status ativo/inativo;
- papel de acesso;
- escala e jornada;
- endereço/contato;
- biometria;
- ações de edição;
- ativação/desativação de usuário.

A nova UI deve preservar esse escopo, mas apresentar a informação com hierarquia mais clara.

---

## 3. Conceito visual da nova tela

### Nome conceitual

**People Operations Command Center**

A tela deve parecer um painel gerencial de operação de pessoas.

### Mensagem visual

> “O gestor enxerga o quadro operacional da empresa, controla acessos e atua sobre dados sensíveis com segurança.”

### Sensação desejada

- domínio da operação;
- visão executiva;
- organização;
- segurança;
- rapidez;
- precisão cadastral;
- responsabilidade sobre dados pessoais.

---

## 4. Diferença real entre desktop e mobile

## 4.1 Desktop

No desktop, o gestor precisa de densidade informacional.

A experiência desktop deve usar:

- tabela gerencial densa;
- filtros horizontais;
- métricas no topo;
- painel lateral de detalhes;
- ações rápidas por linha;
- área de ações sensíveis isolada;
- visualização simultânea de lista e detalhe.

### Estrutura desktop

| Área | Função |
|---|---|
| Sidebar | Navegação principal da plataforma. |
| Header superior | Contexto da rota e sessão. |
| Hero institucional | Explica o objetivo gerencial da tela. |
| Métricas | Ativos, inativos, gestores e home office. |
| Filtros | Busca por nome, usuário, cargo e status. |
| Tabela | Visão operacional densa. |
| Painel lateral | Detalhe do colaborador selecionado. |
| Ações sensíveis | Editar, ativar/desativar, biometria e histórico. |

### Experiência desktop proposta

O desktop deve funcionar como uma mesa de controle. O gestor não deve precisar abrir vários cards para comparar colaboradores.

---

## 4.2 Mobile

No mobile, o foco deve ser consulta rápida e ação contextual.

A experiência mobile deve usar:

- topo compacto;
- indicadores resumidos;
- busca em destaque;
- chips de filtro;
- cards empilhados;
- ações por menu de contexto;
- detalhe aberto por bottom sheet;
- CTA inferior para criação e limpeza de filtros.

### Estrutura mobile

| Área | Função |
|---|---|
| Topo compacto | Identifica a central de colaboradores. |
| Métricas rápidas | Mostra ativos, inativos e gestores. |
| Busca | Entrada rápida para nome, usuário ou cargo. |
| Chips | Alternância de filtros principais. |
| Cards | Um colaborador por card. |
| Menu contextual | Editar, ativar/desativar, biometria. |
| Rodapé | Ações principais persistentes. |

### Experiência mobile proposta

O mobile não deve reproduzir a tabela. Deve funcionar como uma lista operacional por cartões, com ações compactas e navegação por detalhe.

---

## 5. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Sidebar, topo mobile e fundos institucionais. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Gradientes escuros. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Hover, textos de marca e contexto seguro. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | CTA, item ativo, seleção e foco. |
| Ciano técnico | `#22D3EE` | `rgb(34, 211, 238)` | Realce de navegação e detalhes tecnológicos. |
| Verde sucesso | `#16A34A` | `rgb(22, 163, 74)` | Colaborador ativo, biometria cadastrada e operação OK. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo para status positivo. |
| Amarelo atenção | `#F59E0B` | `rgb(245, 158, 11)` | Biometria pendente, atenção e informação incompleta. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo de status pendente. |
| Vermelho erro | `#DC2626` | `rgb(220, 38, 38)` | Colaborador inativo, desativação e ações destrutivas. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo de status inativo. |
| Roxo gerencial | `#7C3AED` | `rgb(124, 58, 237)` | Jornada, escala ou informação administrativa. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo administrativo secundário. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Fundo principal. |
| Fundo secundário | `#F1F5F9` | `rgb(241, 245, 249)` | Blocos neutros, cabeçalho de tabela e filtros. |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Cards, tabela e painéis. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Contornos. |
| Borda forte | `#CBD5E1` | `rgb(203, 213, 225)` | Divisórias e inputs ativos. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Títulos e dados críticos. |
| Texto secundário | `#64748B` | `rgb(100, 116, 139)` | Descrições e metadados. |
| Texto terciário | `#94A3B8` | `rgb(148, 163, 184)` | Labels, placeholders e itens desativados. |

---

## 6. Hierarquia visual

### Prioridade 1

- total de colaboradores;
- status ativo/inativo;
- nome do colaborador;
- perfil de acesso;
- ações sensíveis.

### Prioridade 2

- cargo;
- jornada;
- biometria;
- usuário;
- telefone/e-mail.

### Prioridade 3

- endereço;
- escala detalhada;
- informações complementares;
- histórico e rastreabilidade.

---

## 7. Estados visuais obrigatórios

| Estado | Como deve aparecer |
|---|---|
| Carregando lista | Skeleton de tabela no desktop e skeleton de cards no mobile. |
| Sem colaboradores | Estado vazio com CTA para cadastrar colaborador. |
| Sem resultado no filtro | Mensagem clara e botão “limpar filtros”. |
| Colaborador ativo | Selo verde. |
| Colaborador inativo | Selo vermelho suave e texto de acesso suspenso. |
| Biometria cadastrada | Selo verde. |
| Biometria pendente | Selo amarelo. |
| Conta sem usuário | Selo neutro com ação para criar conta. |
| Edição aberta | Linha/card com destaque azul e painel lateral. |
| Ação destrutiva | Confirmação explícita e cor vermelha. |
| Atualização em andamento | Loading localizado na linha/card. |

---

## 8. Conteúdo textual recomendado

### Título desktop

**Colaboradores, contas e operação em uma única visão**

### Título mobile

**Central de pessoas**

### Subtítulo

**Acompanhe status, escala, vínculo de usuário, contato e ações sensíveis com rastreabilidade gerencial.**

### Busca

**Buscar por nome, usuário ou cargo**

### CTA principal

**Novo colaborador**

### CTA secundário

**Limpar filtros**

### Ação sensível

**Editar cadastro**

### Mensagem de segurança

**Edição de dados, troca de status e biometria precisam manter rastreabilidade e confirmação.**

---

## 9. Componentes de negócio

### 9.1 Métricas superiores

Devem mostrar:

- colaboradores ativos;
- colaboradores inativos;
- gestores;
- colaboradores em home office;
- pendências biométricas, se disponível.

### 9.2 Filtros

Devem incluir:

- busca textual;
- status ativo/inativo;
- papel;
- cargo;
- home office;
- biometria pendente.

### 9.3 Tabela desktop

Colunas recomendadas:

1. Colaborador;
2. Perfil;
3. Jornada;
4. Status;
5. Biometria;
6. Ações.

A tabela deve ser densa, legível e orientada a decisão.

### 9.4 Cards mobile

Cada card deve mostrar:

- iniciais/avatar;
- nome;
- cargo;
- perfil;
- status;
- dado operacional curto;
- menu de ações.

### 9.5 Painel de detalhes

Deve mostrar:

- nome;
- cargo;
- perfil;
- usuário;
- e-mail;
- telefone;
- jornada;
- local;
- status biométrico;
- ações sensíveis.

---

## 10. Regras de UX

1. A lista deve diferenciar claramente colaborador e usuário.
2. Alteração de status deve exigir confirmação.
3. Ação de biometria deve ficar separada de ações comuns.
4. Filtros ativos devem ser visíveis.
5. O gestor deve conseguir limpar filtros em um clique.
6. Desktop deve priorizar comparação entre colaboradores.
7. Mobile deve priorizar consulta rápida e ação contextual.
8. Dados sensíveis não devem parecer editáveis sem intenção clara.
9. Status inativo não deve usar apenas opacidade; deve ter selo explícito.
10. A tela deve evitar poluição visual em mobile.

---

## 11. Acessibilidade

- Toque mínimo de 44px no mobile.
- Ícones de ação precisam de label acessível.
- Status não pode depender apenas de cor.
- Filtros devem ser navegáveis por teclado.
- Tabela deve manter ordem lógica de leitura.
- Confirmação destrutiva deve ter texto claro.
- Contraste deve ser testado em light e dark mode.

---

## 12. Resultado esperado

A nova tela deve transmitir que o Kronos permite:

- gestão organizada de colaboradores;
- controle de usuários e acessos;
- operação multi-tenant segura;
- rastreabilidade de ações gerenciais;
- leitura rápida do quadro da empresa;
- tomada de decisão sem abrir múltiplas telas.
