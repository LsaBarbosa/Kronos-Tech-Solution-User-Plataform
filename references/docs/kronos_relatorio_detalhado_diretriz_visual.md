# Kronos — Diretriz visual de negócio para `/relatorio-detalhado`

## 1. Objetivo da tela

A rota `/relatorio-detalhado` deve ser tratada como uma **central de solicitação e geração de relatório de ponto**, não apenas como um formulário de filtros.

A experiência precisa permitir:

- selecionar uma ou mais datas;
- informar carga horária de referência no formato `HH:mm`;
- filtrar registros por status;
- selecionar colaborador quando a ROLE permitir;
- respeitar diferenças entre `CTO`, `MANAGER` e `PARTNER`;
- gerar relatório detalhado;
- exibir resultados e permitir exportação somente após a busca;
- comunicar que o relatório é um documento operacional sensível.

---

## 2. Comportamento por ROLE

### CTO

O `CTO` deve ter a experiência mais ampla.

Deve visualizar:

- escopo administrativo;
- possibilidade de alternar empresa, se disponível no produto;
- seleção de colaborador;
- filtros por status;
- datas;
- carga horária de referência;
- prévia de indicadores antes da exportação.

Mensagem visual:

> “Visão administrativa ampliada para auditoria e acompanhamento global.”

### MANAGER

O `MANAGER` deve ter experiência gerencial dentro do seu contexto operacional.

Deve visualizar:

- seleção de colaborador do tenant/equipe;
- colaborador ativo/inativo;
- filtros por status;
- datas;
- referência diária;
- relatório e exportação.

Mensagem visual:

> “Visão gerencial para acompanhar registros de colaboradores vinculados.”

### PARTNER

O `PARTNER` deve ter experiência individual e restrita.

Deve visualizar:

- colaborador travado na própria sessão;
- ausência de troca de colaborador;
- seleção de datas;
- status;
- carga horária de referência;
- geração do próprio relatório.

Mensagem visual:

> “Consulta individual do próprio ponto, sem acesso a dados de outros colaboradores.”

---

## 3. Conceito visual da nova tela

### Nome conceitual

**Detailed Time Report Builder**

A tela deve parecer um construtor guiado de relatório, com regras de permissão explícitas.

### Sensação desejada

- precisão;
- transparência;
- segurança;
- controle;
- clareza documental;
- confiança em dados trabalhistas.

---

## 4. Diferença real entre desktop e mobile

## 4.1 Desktop

No desktop, a tela deve priorizar composição avançada de filtros.

A experiência desktop deve usar:

- layout em duas colunas;
- construtor de filtros à esquerda;
- painel de governança e prévia à direita;
- cards de escopo por ROLE;
- campos densos;
- faixa de datas selecionadas;
- botões separados para gerar, limpar, exportar e ver resultados.

### Estrutura desktop

| Área | Função |
|---|---|
| Sidebar | Navegação principal. |
| Header | Contexto da rota e ROLE atual. |
| Hero | Explica relatório e permissões. |
| Cards de ROLE | Mostram diferença entre CTO, MANAGER e PARTNER. |
| Filtros | Referência, status, colaborador, datas e atividade. |
| Datas | Seleção múltipla visível. |
| Prévia | Indicadores esperados após geração. |
| Governança | Explica o que cada ROLE pode visualizar. |
| Exportação | PDF e resultados habilitados após busca. |

## 4.2 Mobile

No mobile, a experiência deve ser guiada e sequencial.

A experiência mobile deve usar:

- topo compacto;
- card de escopo atual;
- etapas verticais;
- seleção simples de datas;
- carga horária e status no mesmo card;
- explicação resumida por ROLE;
- botão fixo no rodapé.

### Estrutura mobile

| Área | Função |
|---|---|
| Topo | Identifica relatório detalhado. |
| Escopo atual | Mostra a ROLE e restrição aplicada. |
| Etapa 1 | Datas. |
| Etapa 2 | Referência e status. |
| Etapa 3 | Regra de visibilidade por ROLE. |
| Rodapé | Resumo e CTA para gerar relatório. |

---

## 5. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Sidebar, topo mobile e fundo institucional. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Gradientes escuros. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Texto institucional e hover. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | CTA, seleção ativa e foco. |
| Ciano técnico | `#22D3EE` | `rgb(34, 211, 238)` | Realce tecnológico. |
| Verde sucesso | `#16A34A` | `rgb(22, 163, 74)` | Registros corretos, status positivo e total trabalhado. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo de status positivo. |
| Amarelo atenção | `#F59E0B` | `rgb(245, 158, 11)` | Pendência, alerta e validação. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo de alerta. |
| Vermelho erro | `#DC2626` | `rgb(220, 38, 38)` | Falta, erro e saldo negativo. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo de erro. |
| Roxo administrativo | `#7C3AED` | `rgb(124, 58, 237)` | Escopo CTO e visão administrativa. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo para CTO. |
| Teal individual | `#0D9488` | `rgb(13, 148, 136)` | Escopo PARTNER. |
| Teal suave | `#CCFBF1` | `rgb(204, 251, 241)` | Fundo para PARTNER. |
| Laranja pendência | `#EA580C` | `rgb(234, 88, 12)` | Status pendente de aprovação. |
| Laranja suave | `#FFEDD5` | `rgb(255, 237, 213)` | Fundo de pendência. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Fundo principal. |
| Fundo secundário | `#F1F5F9` | `rgb(241, 245, 249)` | Cards neutros e filtros. |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Cards e painéis. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Contornos. |
| Borda forte | `#CBD5E1` | `rgb(203, 213, 225)` | Divisórias e campos ativos. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Títulos e dados críticos. |
| Texto secundário | `#64748B` | `rgb(100, 116, 139)` | Descrições e metadados. |
| Texto terciário | `#94A3B8` | `rgb(148, 163, 184)` | Labels e placeholders. |

---

## 6. Hierarquia visual

### Prioridade 1

- ROLE atual;
- datas selecionadas;
- colaborador selecionado ou bloqueado;
- carga horária de referência;
- botão gerar relatório.

### Prioridade 2

- status selecionados;
- filtro ativo/inativo;
- prévia de resultados;
- botões de exportação.

### Prioridade 3

- instruções auxiliares;
- explicação de permissões;
- links de apoio;
- metadados do relatório.

---

## 7. Estados visuais obrigatórios

| Estado | Como deve aparecer |
|---|---|
| Sem datas | CTA desabilitado e aviso de data obrigatória. |
| Referência inválida | Erro explícito: `HH:mm`. |
| PARTNER | Campo colaborador bloqueado e mensagem de escopo próprio. |
| MANAGER | Select de colaborador do tenant/equipe. |
| CTO | Escopo administrativo ampliado. |
| Carregando | Skeleton ou loading no botão gerar. |
| Sem resultados | Estado vazio com explicação dos filtros. |
| Com resultados | Habilitar PDF e área de resultados. |
| Exportando PDF | Loading localizado no botão. |
| Erro de busca | Mensagem clara e não técnica. |

---

## 8. Conteúdo textual recomendado

### Título desktop

**Solicitação inteligente de relatório de ponto**

### Título mobile

**Gerar relatório**

### Subtítulo

**Monte filtros de data, colaborador, status e carga horária de referência respeitando permissões por CTO, MANAGER e PARTNER.**

### CTA principal

**Gerar relatório**

### CTA secundário

**Limpar filtros**

### Exportação

**Baixar PDF**

### Busca sem resultado

**Não há registros para os filtros selecionados.**

---

## 9. Componentes de negócio

### 9.1 Escopo por ROLE

Deve mostrar:

- `CTO`: visão administrativa ampla;
- `MANAGER`: colaboradores do tenant/equipe;
- `PARTNER`: próprio colaborador.

### 9.2 Filtros

Devem conter:

- carga horária de referência;
- datas;
- colaborador;
- status;
- ativo/inativo;
- exportação disponível após resultado.

### 9.3 Prévia de resultados

Pode mostrar após geração:

- quantidade de registros;
- total trabalhado;
- saldo;
- status mais recorrente;
- período consultado.

### 9.4 Resultado e PDF

A exportação deve parecer uma consequência do relatório já gerado, não uma ação inicial.

---

## 10. Regras de UX

1. `PARTNER` não deve conseguir trocar colaborador.
2. `MANAGER` deve conseguir selecionar colaborador permitido.
3. `CTO` deve ter comunicação visual de escopo administrativo.
4. `reference` deve ser exibido e validado no formato `HH:mm`.
5. Ao menos uma data deve ser obrigatória.
6. PDF só deve ficar habilitado após retorno de dados.
7. Status selecionados devem aparecer como chips.
8. O mobile deve guiar a geração em etapas.
9. O desktop deve permitir montar todos os filtros em uma visão consolidada.
10. Erros devem aparecer próximos ao campo responsável.

---

## 11. Acessibilidade

- Campos devem ter labels explícitos.
- Chips de status precisam de texto, não apenas cor.
- CTA desabilitado deve explicar o motivo.
- Mobile deve respeitar toque mínimo de 44px.
- Exportação deve indicar loading.
- Estados de erro devem usar texto e cor.
- O escopo por ROLE deve ser anunciado textualmente.

---

## 12. Resultado esperado

A tela deve transmitir que o Kronos permite:

- gerar relatórios de ponto com segurança;
- respeitar permissões por perfil;
- consolidar dados de jornada;
- apoiar auditoria trabalhista;
- exportar evidências em PDF;
- reduzir erro na seleção de colaborador e datas.
