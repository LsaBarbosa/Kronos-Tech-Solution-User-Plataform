# Kronos — Diretriz visual de negócio para `/status-do-registro`

## 1. Objetivo da tela

A rota `/status-do-registro` deve ser uma **central de correção auditável de registros de ponto**.

A experiência precisa permitir:

- buscar registros por colaborador, datas e status atual;
- visualizar registros encontrados;
- selecionar um registro;
- alterar o status para `ABSENCE`, `DAY_OFF` ou `TIME_OFF`;
- ativar ou inativar registro;
- comunicar impacto trabalhista antes da confirmação.

---

## 2. Conceito visual

### Nome conceitual

**Time Record Status Control**

A tela deve parecer uma mesa de correção formal, com separação entre busca, resultado e decisão.

---

## 3. Desktop e mobile

### Desktop

O desktop deve usar:

- filtros à esquerda;
- lista de registros no centro;
- painel de decisão à direita;
- botões separados para inativar e salvar;
- aviso de impacto.

### Mobile

O mobile deve usar:

- fluxo sequencial;
- etapa de filtros;
- etapa de registros;
- etapa de decisão;
- CTA fixo no rodapé.

---

## 4. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Sidebar e topo. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Gradiente. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Texto institucional. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | CTA e seleção. |
| Ciano técnico | `#22D3EE` | `rgb(34, 211, 238)` | Navegação ativa. |
| Verde sucesso | `#16A34A` | `rgb(22, 163, 74)` | Registro criado/ativo. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo positivo. |
| Amarelo atenção | `#F59E0B` | `rgb(245, 158, 11)` | Alerta de impacto. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo de alerta. |
| Vermelho falta | `#DC2626` | `rgb(220, 38, 38)` | Falta, inativação e ação sensível. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo de falta. |
| Roxo abono | `#7C3AED` | `rgb(124, 58, 237)` | Abono. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo de abono. |
| Teal operação | `#0D9488` | `rgb(13, 148, 136)` | Contexto operacional. |
| Teal suave | `#CCFBF1` | `rgb(204, 251, 241)` | Fundo operacional. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Fundo principal. |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Cards e painéis. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Contornos. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Títulos. |
| Texto secundário | `#64748B` | `rgb(100, 116, 139)` | Metadados. |
| Texto terciário | `#94A3B8` | `rgb(148, 163, 184)` | Labels auxiliares. |

---

## 5. Regras de UX

- Não permitir salvar sem registro selecionado.
- Não permitir salvar sem novo status.
- Separar inativação da alteração de status.
- Usar confirmação antes de aplicar alteração.
- Mostrar status atual e status novo.
- Explicar impacto trabalhista.
- No mobile, evitar tabela.

---

## 6. Estados obrigatórios

| Estado | Como deve aparecer |
|---|---|
| Sem status no filtro | Aviso obrigatório. |
| Buscando | Loading no botão. |
| Sem registros | Estado vazio. |
| Registro selecionado | Borda azul e painel de decisão. |
| Salvando status | Loading no CTA. |
| Ativando/inativando | Loading separado. |
| Erro | Mensagem vermelha. |
| Sucesso | Confirmação verde. |

---

## 7. Resultado esperado

A tela deve transmitir:

- correção segura de ponto;
- rastreabilidade;
- clareza de impacto;
- prevenção de erro operacional;
- separação entre busca, seleção e decisão.
