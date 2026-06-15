# Kronos — Diretriz visual de negócio para `/privacidade`

## 1. Objetivo da tela

A rota `/privacidade` deve ser um **centro de direitos do titular**, cobrindo o contexto LGPD da plataforma.

A experiência precisa permitir:

- gerenciar consentimento biométrico;
- exportar dados pessoais;
- criar solicitações LGPD;
- acompanhar solicitações abertas;
- consultar histórico de consentimentos;
- entender revogação de consentimentos;
- acessar catálogo de tratamento;
- ler política de privacidade;
- contatar o DPO/encarregado de dados.

---

## 2. Direitos LGPD contemplados

A interface deve comunicar direitos como:

- confirmação de tratamento;
- acesso aos dados;
- correção;
- anonimização;
- bloqueio;
- eliminação;
- portabilidade;
- revogação de consentimento;
- informação sobre compartilhamento;
- informação sobre consentimento;
- oposição;
- revisão de decisão automatizada.

---

## 3. Conceito visual

### Nome conceitual

**Privacy Rights Center**

A tela deve transmitir controle, transparência, confiança e autonomia do titular.

---

## 4. Desktop e mobile

### Desktop

O desktop deve usar:

- hero institucional;
- cards de ações principais;
- lista de solicitações recentes;
- painel lateral de governança;
- CTAs para exportar e criar solicitação.

### Mobile

O mobile deve usar:

- cards de direitos em fluxo vertical;
- resumo de indicadores;
- CTA fixo;
- navegação por seções.

---

## 5. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Sidebar e topo. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Gradientes. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Texto institucional. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | CTA e foco. |
| Ciano técnico | `#22D3EE` | `rgb(34, 211, 238)` | Realce de segurança. |
| Verde consentimento | `#16A34A` | `rgb(22, 163, 74)` | Consentimento ativo/concluído. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo positivo. |
| Amarelo pendência | `#F59E0B` | `rgb(245, 158, 11)` | Solicitação aberta/atenção. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo pendente. |
| Vermelho revogação | `#DC2626` | `rgb(220, 38, 38)` | Revogação, rejeição ou bloqueio. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo de alerta crítico. |
| Roxo direitos | `#7C3AED` | `rgb(124, 58, 237)` | Solicitações LGPD. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo de direitos. |
| Teal privacidade | `#0D9488` | `rgb(13, 148, 136)` | Consentimento biométrico e dados sensíveis. |
| Teal suave | `#CCFBF1` | `rgb(204, 251, 241)` | Fundo de privacidade. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Fundo principal. |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Cards. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Contornos. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Títulos. |
| Texto secundário | `#64748B` | `rgb(100, 116, 139)` | Descrições. |
| Texto terciário | `#94A3B8` | `rgb(148, 163, 184)` | Labels. |

---

## 6. Regras de UX

- Exportação deve exigir confirmação.
- Solicitações LGPD devem ter status textual.
- Consentimento biométrico deve indicar estado atual.
- Revogação deve explicar consequência.
- Catálogo de tratamento deve explicar finalidade, base legal, retenção e sensibilidade.
- DPO deve ser facilmente encontrável.
- Mobile deve priorizar ações por cards.

---

## 7. Estados obrigatórios

| Estado | Como deve aparecer |
|---|---|
| Exportando dados | Loading e bloqueio de repetição. |
| Exportação concluída | Manifesto exibido. |
| Solicitação aberta | Selo amarelo. |
| Em análise | Selo azul. |
| Concluída | Selo verde. |
| Rejeitada/cancelada | Selo vermelho. |
| Consentimento ativo | Selo verde/teal. |
| Consentimento revogado | Selo vermelho. |

---

## 8. Resultado esperado

A tela deve transmitir:

- conformidade LGPD;
- controle do titular;
- transparência de tratamento;
- governança de consentimento;
- rastreabilidade de solicitações;
- clareza sobre dados sensíveis.
