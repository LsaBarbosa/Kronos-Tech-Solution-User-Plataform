# Kronos — Diretriz visual de negócio para `/lgpd/admin/requests`

## 1. Objetivo da tela

A rota `/lgpd/admin/requests` deve ser uma **central administrativa de governança LGPD**.

Ela não deve parecer apenas uma tabela. A tela deve funcionar como uma fila de tratamento dos direitos do titular, com leitura clara de prioridade, status, SLA, responsável e próxima ação.

---

## 2. Fluxo de negócio

A experiência precisa permitir:

- listar solicitações LGPD administrativas;
- filtrar por tipo;
- filtrar por status;
- filtrar por empresa quando aplicável;
- localizar titular/funcionário;
- identificar solicitações atrasadas;
- abrir detalhes do caso;
- atribuir responsável;
- acompanhar histórico;
- avançar transições de status;
- registrar notas públicas e internas;
- concluir, rejeitar, cancelar ou solicitar complemento;
- apoiar exportação aprovada e anonimização quando aplicável.

---

## 3. Tipos de solicitação contemplados

A interface deve contemplar os direitos do titular:

- confirmação de tratamento;
- acesso;
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

## 4. Status contemplados

A tela deve representar visualmente:

- `OPEN`;
- `IN_ANALYSIS`;
- `WAITING_CONTROLLER`;
- `WAITING_LEGAL_REVIEW`;
- `APPROVED_FOR_EXPORT`;
- `WAITING_DATA_SUBJECT`;
- `COMPLETED`;
- `REJECTED`;
- `PARTIALLY_COMPLETED`;
- `CANCELLED`.

---

## 5. Conceito visual

### Nome conceitual

**LGPD Governance Inbox**

A tela deve transmitir governança, rastreabilidade, controle de SLA, proteção de dados sensíveis, responsabilidade jurídica e clareza de próxima ação.

---

## 6. Experiência desktop

No desktop, a tela deve usar:

1. **Hero de governança** com abertas, em análise, atrasadas e aprovadas para exportação.
2. **Inbox administrativo** com filtros, titular, empresa, tipo, status, SLA e responsável.
3. **Painel lateral** com caso selecionado, linha de tratamento, risco/SLA e CTA para detalhes.

---

## 7. Experiência mobile

No mobile, a tela deve ser uma **fila de cards de governança**:

- resumo superior;
- busca compacta;
- chips de status;
- cards com titular, tipo, status e SLA;
- drawer inferior com o caso selecionado;
- CTA principal para detalhes.

O mobile não deve usar tabela.

---

## 8. Paleta de cores

| Papel | Hexadecimal | RGB | Uso |
|---|---:|---:|---|
| Azul noite | `#0B1220` | `rgb(11, 18, 32)` | Sidebar, topo e governança premium. |
| Azul meia-noite | `#101A33` | `rgb(16, 26, 51)` | Gradientes escuros. |
| Azul profundo | `#1E3A8A` | `rgb(30, 58, 138)` | Texto institucional. |
| Azul principal | `#2563EB` | `rgb(37, 99, 235)` | Seleção, abrir detalhes e status em análise. |
| Ciano técnico | `#22D3EE` | `rgb(34, 211, 238)` | Navegação ativa e tecnologia. |
| Verde concluído | `#16A34A` | `rgb(22, 163, 74)` | Concluído, exportação aprovada, sucesso. |
| Verde suave | `#DCFCE7` | `rgb(220, 252, 231)` | Fundo de sucesso. |
| Amarelo pendência | `#F59E0B` | `rgb(245, 158, 11)` | Aberto, aguardando e atenção. |
| Amarelo suave | `#FEF3C7` | `rgb(254, 243, 199)` | Fundo pendente. |
| Vermelho SLA crítico | `#DC2626` | `rgb(220, 38, 38)` | Atraso, rejeição e risco. |
| Vermelho suave | `#FEE2E2` | `rgb(254, 226, 226)` | Fundo crítico. |
| Roxo dados sensíveis | `#7C3AED` | `rgb(124, 58, 237)` | Anonimização, biometria, dados sensíveis. |
| Roxo suave | `#EDE9FE` | `rgb(237, 233, 254)` | Fundo de dados sensíveis. |
| Teal privacidade | `#0D9488` | `rgb(13, 148, 136)` | LGPD, consentimento e proteção de dados. |
| Teal suave | `#CCFBF1` | `rgb(204, 251, 241)` | Fundo de privacidade. |
| Fundo claro | `#F8FAFC` | `rgb(248, 250, 252)` | Fundo principal. |
| Superfície | `#FFFFFF` | `rgb(255, 255, 255)` | Cards e painéis. |
| Borda | `#E2E8F0` | `rgb(226, 232, 240)` | Contornos. |
| Texto principal | `#0F172A` | `rgb(15, 23, 42)` | Títulos. |
| Texto secundário | `#64748B` | `rgb(100, 116, 139)` | Metadados. |
| Texto terciário | `#94A3B8` | `rgb(148, 163, 184)` | Labels auxiliares. |

---

## 9. Regras de UX

- Solicitações atrasadas devem ter destaque vermelho.
- Dados sensíveis devem usar realce roxo/teal.
- O status deve ser legível, não apenas colorido.
- A lista deve permitir leitura rápida de titular, empresa, tipo, status e responsável.
- A ação principal da lista deve ser abrir detalhes.
- A tela de lista não deve executar ações destrutivas diretamente.
- O detalhe deve concentrar transições, notas, exportação e anonimização.
- O mobile deve priorizar triagem, não edição complexa.

---

## 10. Estados obrigatórios

| Estado | Como deve aparecer |
|---|---|
| Carregando | Loading/skeleton. |
| Erro | Estado vermelho com tentar novamente. |
| Sem solicitações | Estado vazio. |
| Aberto | Selo azul/amarelo. |
| Em análise | Selo azul. |
| Aguardando legal | Selo neutro/âmbar. |
| Aprovado para exportação | Selo verde. |
| Concluído | Selo verde. |
| Rejeitado | Selo vermelho. |
| Cancelado | Selo cinza. |
| Atrasado | Badge vermelho de SLA. |

---

## 11. Resultado esperado

A tela deve transmitir conformidade LGPD, controle administrativo, rastreabilidade, gestão de SLA, clareza de responsabilidades e proteção dos direitos do titular.
