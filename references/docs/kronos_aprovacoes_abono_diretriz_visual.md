# Kronos — Diretriz visual de negócio para `/aprovacoes-abono`

## 1. Objetivo da tela

A rota `/aprovacoes-abono` deve ser uma **mesa de aprovação gerencial de abonos**.

A experiência precisa permitir:

- listar solicitações de abono;
- filtrar por colaborador;
- filtrar por status;
- analisar documento/evidência;
- entender horas e registros afetados;
- aprovar ou rejeitar;
- manter clareza de impacto trabalhista.

---

## 2. Fluxo funcional

A tela trabalha com:

- listagem paginada de solicitações;
- status inicial `PENDING`;
- busca por nome do colaborador;
- ação `approve`;
- ação `reject`.

Ao aprovar, a solicitação passa a ser considerada abono.  
Ao rejeitar, o abono não é aplicado ao registro.

---

## 3. Conceito visual

### Nome conceitual

**Time-Off Approval Desk**

A tela deve funcionar como uma fila de triagem com detalhe contextual.

---

## 4. Desktop e mobile

### Desktop

O desktop deve usar:

- métricas superiores;
- lista de solicitações;
- filtros por status;
- painel lateral de detalhe;
- destaque de evidência;
- botões separados de aprovar/rejeitar.

### Mobile

O mobile deve usar:

- inbox por cards;
- chips de status;
- painel fixo inferior;
- ações grandes de aprovar/rejeitar.

---

## 5. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Sidebar e topo. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Gradientes. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Texto institucional. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | Seleção e foco. |
| Ciano técnico | `#22D3EE` | `rgb(34, 211, 238)` | Navegação ativa. |
| Verde aprovação | `#16A34A` | `rgb(22, 163, 74)` | Aprovar abono. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo aprovado. |
| Amarelo pendência | `#F59E0B` | `rgb(245, 158, 11)` | Status pendente. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo pendente. |
| Vermelho rejeição | `#DC2626` | `rgb(220, 38, 38)` | Rejeitar abono. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo rejeitado. |
| Roxo evidência | `#7C3AED` | `rgb(124, 58, 237)` | Documento/anexo. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo de evidência. |
| Teal operação | `#0D9488` | `rgb(13, 148, 136)` | Contexto operacional. |
| Teal suave | `#CCFBF1` | `rgb(204, 251, 241)` | Fundo operacional. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Fundo principal. |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Cards. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Contornos. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Títulos. |
| Texto secundário | `#64748B` | `rgb(100, 116, 139)` | Metadados. |
| Texto terciário | `#94A3B8` | `rgb(148, 163, 184)` | Labels auxiliares. |

---

## 6. Regras de UX

- Aprovar e rejeitar devem ser separados.
- Pendência deve ser amarela.
- Aprovação deve ser verde.
- Rejeição deve ser vermelha.
- Evidência/anexo deve ser visível antes da decisão.
- A ação deve indicar impacto em horas/registros.
- Mobile não deve usar tabela.
- Desktop deve permitir analisar fila e detalhe simultaneamente.

---

## 7. Estados obrigatórios

| Estado | Como deve aparecer |
|---|---|
| Carregando | Skeleton ou loading. |
| Sem solicitações | Estado vazio. |
| Pendente | Selo amarelo. |
| Aprovado | Selo verde. |
| Rejeitado | Selo vermelho. |
| Mutação em andamento | Botões desabilitados. |
| Erro | Mensagem vermelha. |
| Sucesso | Confirmação verde. |

---

## 8. Resultado esperado

A tela deve transmitir:

- decisão gerencial;
- análise de evidência;
- impacto no ponto;
- segurança trabalhista;
- rastreabilidade de aprovação.
